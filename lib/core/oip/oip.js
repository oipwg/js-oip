"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom.iterable.js");

require("core-js/modules/es6.regexp.to-string.js");

var _bitcoinjsLib = require("bitcoinjs-lib");

var _oipdApi = require("../oipd-api");

var _modules = require("../../modules");

var _records = require("../../modules/records");

var _edit = require("../../modules/records/edit");

var _wallets = require("../../modules/wallets");

var _FLOTransaction = require("../../modules/flo/FLOTransaction");

var _config = require("../../config");

/**
 * Class to publish, register, edit, transfer, and deactivate OIP Records
 */
class OIP {
  /**
   * ##### Example
   * ```javascript
   * import {OIP} from 'js-oip'
   *
   * let wif = "cRVa9rNx5N1YKBw8PhavegJPFCiYCfC4n8cYmdc3X1Y6TyFZGG4B"
   * let oip = new OIP(wif, "testnet")
   * ```
   * @param {String} wif - private key in Wallet Import Format (WIF) see: {@link https://en.bitcoin.it/wiki/Wallet_import_format}
   * @param {String} [network="mainnet"] - Use "testnet" for mainnet
   * @param {Object} [options] - Options to for the OIP class
   * @param {Object} [options.publicAddress] - Explicitly define a public address for the passed WIF
   * @param {Object} [options.oipdURL] - The OIP daemon API url to use when looking up the Latest Record in oip.edit()
   * @param {Object} [options.rpc] - By default, OIP uses a connection to a web explorer to publish Records, you can however use a connection to an RPC wallet instead by passing an object into this option
   * @param {Object} [options.rpc.host] - The Hostname for the RPC wallet connection
   * @param {Object} [options.rpc.port] - The Port for the RPC wallet connection
   * @param {Object} [options.rpc.username] - The Username for the RPC wallet connection
   * @param {Object} [options.rpc.password] - The Password for the RPC wallet connection
   */
  constructor(wif, network, options) {
    this.options = options || {};
    this.options.wif = wif;
    this.options.network = network; // If public address is not defined, calculate it using bitcoin-js (used by RPC-Wallet)

    if (!this.options.publicAddress) {
      let tmpNetwork = _config.floMainnet;

      if (network === 'testnet') {
        tmpNetwork = _config.floTestnet;
      }

      if (network === 'regtest') {
        tmpNetwork = _config.floRegtest;
      }

      let myECPair = _bitcoinjsLib.ECPair.fromWIF(this.options.wif, tmpNetwork.network);

      this.options.publicAddress = _bitcoinjsLib.payments.p2pkh({
        pubkey: myECPair.publicKey,
        network: tmpNetwork.network
      }).address;
    }

    if (this.options.rpc) {
      this.wallet = new _wallets.RPCWallet(this.options);
      this.walletInitialized = false;
    } else {
      this.wallet = new _wallets.ExplorerWallet(this.options);
      this.walletInitialized = true;
    }

    this.oipdAPI = new _oipdApi.DaemonApi(this.options.oipdURL);
  }
  /**
   * Sign an OIP Record (if unsigned), and verify it's signature
   * @param  {OIPRecord} record - The record you want to make sure is signed
   */


  async signRecord(record) {
    // Check if a signature exists
    if (!record.getSignature() || record.getSignature() === '') {
      // Set the publisher address
      record.setPubAddress(this.options.publicAddress); // Check if a timestamp is set, and if not, set it to the current date (in ms time)

      if (!record.getTimestamp()) {
        record.setTimestamp(Date.now());
      } // Attempt the signing of the Record


      let {
        success,
        error
      } = await record.signSelf(this.wallet.signMessage.bind(this.wallet));

      if (!success) {
        // If there was an error, log the stack, and then return the error.
        console.log(error.stack);
        throw new Error("Failed to sign record: ".concat(error));
      }
    } // Check if the record has a valid signature


    if (!record.hasValidSignature()) {
      throw new Error("Invalid signature");
    }
  }
  /**
   * Broadcast an OIP Record
   * @param {OIPRecord} record - Any Object whos class extends OIPRecord (Artifact, Publisher, Platform, Retailer, Influencer, EditRecord, etc)
   * @param {String} methodType - The method you are wanting to perform, i.e. `publish`, `edit`, `deactivate`, `transfer` etc
   * @param {Object} options - Broadcast options
   * @param {function} options.onConfirmation - A function to run once the transaction recieves a confirmation that it was included in a block.
   * @param {String} options.onConfirmationRef - A reference string that should be returned in the onConfirmation function (useful for ID's).
   * @return {Promise<Object>} response - An object that contains a var for `success`, the `record` that was published, and the `editRecord` if it is an edit
   * let oip = new OIP(wif, "testnet")
   * let artifact = new Artifact()
   * let result = await oip.broadcastRecord(artifact, 'publish')
   */


  async broadcastRecord(record, methodType, options) {
    // Verify that we are generally an OIPRecord (aka, we have the required signature and serialization functions)
    if (!(record instanceof _records.OIPRecord)) {
      throw new Error("Record must be an instanceof OIPRecord");
    } // Make sure the wallet has initialized and is ready for use


    if (!this.walletInitialized) {
      await this.wallet.initialize();
      this.walletInitialized = true;
    } // Make sure the record is signed, and if not, sign it.


    try {
      await this.signRecord(record);
    } catch (error) {
      return {
        success: false,
        error: "Error while Signing Record: ".concat(error)
      };
    } // Make sure the Record is valid


    let {
      success,
      error
    } = record.isValid();

    if (!success) {
      return {
        success: false,
        error: "Invalid record: ".concat(error)
      };
    } // Create the data we are broadcasting to the chain


    let broadcastString = record.serialize(methodType); // Array to store txids

    let txids = []; // Check if we need to publish it using Multiparts, or if it will fit into a single transaction

    if (broadcastString.length > _FLOTransaction.FLODATA_MAX_LEN) {
      try {
        // Split the broadcast string up and publish the multiparts for it
        txids = await this.publishMultiparts(broadcastString, options);
      } catch (err) {
        return {
          success: false,
          error: "Failed to publish multiparts: ".concat(err)
        };
      }
    } else {
      try {
        // Broadcast it in a single transaction :)
        let txid = await this.wallet.sendDataToChain(broadcastString);
        txids = [txid];
      } catch (err) {
        return {
          success: false,
          error: "Failed to broadcast message: ".concat(err)
        };
      }
    } // Set the txid to the Record


    record.setTXID(txids[0]); // Grab the data we need and bundle it for returning

    let response = {
      success: true,
      txids,
      record
    }; // If we are an edit record, also return the edit record :)

    if (record instanceof _edit.EditRecord) {
      // Grab the patched record to return
      let patchedRecord = record.getPatchedRecord(); // Set the edit version to the EditRecord txid

      patchedRecord.setEditVersion(txids[0]); // Move EditRecord and set patchedRecord

      response.record = patchedRecord;
      response.editRecord = record;
    } // Subscribe to the onConfirmation function to get a callback when all transactions have been confirmed


    this.wallet.onConfirmation(response, options); // Return our built response

    return response;
  }
  /**
   * Publish OIP Records
   * @param {OIPRecord} record - an Artifact, Publisher, Platform, Retailer, or Influencer
   * @param {Object} options - Publishing options
   * @param {function} options.onConfirmation - A function to run once the transaction recieves a confirmation that it was included in a block.
   * @param {String} options.onConfirmationRef - A reference string that should be returned in the onConfirmation function (useful for ID's).
   * @return {Promise<Object>} response - An object that contains a var for `success`, the `record` that was published
   * let oip = new OIP(wif, "testnet")
   * let artifact = new Artifact()
   * let result = await oip.publish(artifact)
   */


  async publish(record, options) {
    // Forward the publish directly on to the broadcastRecord method
    let res = await this.broadcastRecord(record, 'publish', options);
    return res;
  } // async register(record) {
  // } //ToDo

  /**
   * Publish an Edit for a Record
   * @param  {OIPRecord} editedRecord - The new version of the Record
   * @param {Object} options - Publishing options
   * @param {function} options.onConfirmation - A function to run once the transaction recieves a confirmation that it was included in a block.
   * @param {String} options.onConfirmationRef - A reference string that should be returned in the onConfirmation function (useful for ID's).
   * @return {Promise<Object>} response - An object that contains a var for `success`, the `record` that was published, and the `editRecord`
   * @Example
   * let oip = new OIP(wif, "testnet")
   * let record = new Artifact(previousArtifactJSON)
   * record.setTitle('new title')
   * let result = await oip.edit(record)
   */


  async edit(editedRecord, options) {
    // Lookup the currently latest version of the Record
    let original;

    try {
      let {
        success,
        record,
        error
      } = await this.oipdAPI.getRecord(editedRecord.getOriginalTXID()); // If OIPd reported an error, then throw the error

      if (success) {
        original = record;
      } else {
        return {
          success: false,
          error: "Unable to load Original Record from OIP daemon: ".concat(error)
        };
      }
    } catch (e) {
      // Throw an error if the API request failed
      return {
        success: false,
        error: "Error while requesting Original Record from OIP daemon: ".concat(e)
      };
    } // Throw an Error if record does not exist


    if (!original) {
      return {
        success: false,
        error: "A Record with the txid ".concat(editedRecord.getOriginalTXID(), " was not found in OIP daemon! Please make sure you have set 'options.oipdURL' to your OIP daemon server!")
      };
    } // Set the Publisher Address before we sign


    editedRecord.setPubAddress(this.options.publicAddress); // Check if a timestamp is set, and if not, set it to the current date (in ms time)

    if (!editedRecord.getTimestamp()) {
      editedRecord.setTimestamp(Date.now());
    } // Create an Edit Record from the Original and Edited


    let edit = new _edit.EditRecord(undefined, original, editedRecord); // Publish to chain

    let res = await this.broadcastRecord(edit, 'edit', options);
    return res;
  } // async transfer(record) {
  // } //ToDO
  // async deactivate(record) {
  // } //ToDo

  /**
   * Publish data that exceeds the maximum floData length in multiple parts
   * @param {string} data - The data you wish to publish
   * @return {Promise<Array.<String>>} txids - An array of transaction IDs
   * @example
   * let oip = new OIP(wif, "testnet")
   * let txArray = await oip.publishMultiparts(superLongStringData)
   * //For multipart publishing, use oip.publish() instead. Will auto redirect to this function
   */


  async publishMultiparts(data) {
    if (typeof data !== 'string') {
      throw new Error("Data must be of type string. Got: ".concat(typeof data));
    } // Make sure the wallet has had time to initialize


    if (!this.walletInitialized) {
      await this.wallet.initialize();
      this.walletInitialized = true;
    }

    let mpx = new _modules.MultipartX(data);
    let mps = mpx.getMultiparts();
    let txids = [];

    for (let mp of mps) {
      // set reference, addr, and sign
      mp.setAddress(this.options.publicAddress);

      if (txids.length > 0) {
        mp.setReference(txids[0]);
      }

      let {
        error
      } = await mp.signSelf(this.wallet.signMessage.bind(this.wallet));

      if (error) {
        throw new Error("Failed to sign multipart: ".concat(error));
      } // not going to be valid yet or will it


      if (!mp.isValid().success) {
        console.log(mp);
        throw new Error("Invalid multipart: ".concat(mp.isValid().error));
      }

      let txid;

      try {
        // console.log(mp.toString())
        // console.log(mp.toString().length)
        // throw new Error('STOP')
        txid = await this.wallet.sendDataToChain(mp.toString());
      } catch (err) {
        console.log(err.stack);
        throw new Error("Failed to broadcast multipart: ".concat(err));
      } // console.log(txid)


      txids.push(txid);
    }

    return txids;
  }
  /**
   * Wait for all Confirmation Subscriptions to complete, then resolves the Promise
   * @return {Promise} Returns a promise that resolves once all subscribed Confirmation callbacks have completed
   */


  waitForConfirmations() {
    return this.wallet.waitForConfirmations();
  }

}

var _default = OIP;
exports.default = _default;