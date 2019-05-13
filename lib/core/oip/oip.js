"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.FLODATA_MAX_LEN = void 0;

require("core-js/modules/es6.regexp.to-string");

var _bitcoinjsLib = _interopRequireDefault(require("bitcoinjs-lib"));

var _oipdApi = require("../oipd-api");

var _modules = require("../../modules");

var _records = require("../../modules/records");

var _edit = require("../../modules/records/edit");

var _wallets = require("../../modules/wallets");

var _config = require("../../config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// The maximum floData that fits in one transaction
const FLODATA_MAX_LEN = 1040;
/**
 * Class to publish, register, edit, transfer, and deactivate OIP Records
 */

exports.FLODATA_MAX_LEN = FLODATA_MAX_LEN;

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
   * @param {string} [options.explorerUrl] - api url to a blockchain explorer
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

      let ECPair = _bitcoinjsLib.default.ECPair.fromWIF(this.options.wif, tmpNetwork.network);

      this.options.publicAddress = _bitcoinjsLib.default.payments.p2pkh({
        pubkey: ECPair.publicKey,
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


      let _ref = await record.signSelf(this.wallet.signMessage.bind(this.wallet)),
          success = _ref.success,
          error = _ref.error;

      if (!success) {
        // If there was an error, log the stack, and then return the error.
        console.log(error.stack);
        throw new Error(`Failed to sign record: ${error}`);
      }
    } // Check if the record has a valid signature


    if (!record.hasValidSignature()) {
      throw new Error(`Invalid signature`);
    }
  }
  /**
   * Broadcast an OIP Record
   * @param {OIPRecord} record - Any Object whos class extends OIPRecord (Artifact, Publisher, Platform, Retailer, Influencer, EditRecord, etc)
   * @param {String} methodType - The method you are wanting to perform, i.e. `publish`, `edit`, `deactivate`, `transfer` etc
   * @return {Promise<Object>} response - An object that contains a var for `success`, the `record` that was published, and the `editRecord` if it is an edit
   * let oip = new OIP(wif, "testnet")
   * let artifact = new Artifact()
   * let result = await oip.broadcastRecord(artifact, 'publish')
   */


  async broadcastRecord(record, methodType) {
    // Verify that we are generally an OIPRecord (aka, we have the required signature and serialization functions)
    if (!(record instanceof _records.OIPRecord)) {
      throw new Error(`Record must be an instanceof OIPRecord`);
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
        error: `Error while Signing Record: ${error}`
      };
    } // Make sure the Record is valid


    let _record$isValid = record.isValid(),
        success = _record$isValid.success,
        error = _record$isValid.error;

    if (!success) {
      return {
        success: false,
        error: `Invalid record: ${error}`
      };
    } // Create the data we are broadcasting to the chain


    let broadcastString = record.serialize(methodType); // Array to store txids

    let txids = []; // Check if we need to publish it using Multiparts, or if it will fit into a single transaction

    if (broadcastString.length > FLODATA_MAX_LEN) {
      try {
        // Split the broadcast string up and publish the multiparts for it
        txids = await this.publishMultiparts(broadcastString);
      } catch (err) {
        return {
          success: false,
          error: `Failed to publish multiparts: ${err}`
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
          error: `Failed to broadcast message: ${err}`
        };
      }
    } // Set the txid to the Record


    record.setTXID(txids[0]); // Grab the data we need and bundle it for returning

    let response = {
      success: true,
      txids,
      record // If we are an edit record, also return the edit record :)

    };

    if (record instanceof _edit.EditRecord) {
      // Grab the patched record to return
      let patchedRecord = record.getPatchedRecord(); // Set the edit version to the EditRecord txid

      patchedRecord.setEditVersion(txids[0]); // Move EditRecord and set patchedRecord

      response.record = patchedRecord;
      response.editRecord = record;
    } // Return our built response


    return response;
  }
  /**
   * Publish OIP Records
   * @param {OIPRecord} record - an Artifact, Publisher, Platform, Retailer, or Influencer
   * @return {Promise<Object>} response - An object that contains a var for `success`, the `record` that was published
   * let oip = new OIP(wif, "testnet")
   * let artifact = new Artifact()
   * let result = await oip.publish(artifact)
   */


  async publish(record) {
    // Forward the publish directly on to the broadcastRecord method
    let res = await this.broadcastRecord(record, 'publish');
    return res;
  } // async register(record) {
  // } //ToDo

  /**
   * Publish an Edit for a Record
   * @param  {OIPRecord} editedRecord - The new version of the Record
   * @return {Promise<Object>} response - An object that contains a var for `success`, the `record` that was published, and the `editRecord`
   * @Example
   * let oip = new OIP(wif, "testnet")
   * let record = new Artifact(previousArtifactJSON)
   * record.setTitle('new title')
   * let result = await oip.edit(record)
   */


  async edit(editedRecord) {
    // Lookup the currently latest version of the Record
    let original;

    try {
      let _ref2 = await this.oipdAPI.getArtifact(editedRecord.getTXID()),
          success = _ref2.success,
          artifact = _ref2.artifact,
          error = _ref2.error; // If OIPd reported an error, then throw the error


      if (success) {
        original = artifact;
      } else {
        return {
          success: false,
          error: `Unable to load Original Record from OIP daemon: ${error}`
        };
      }
    } catch (e) {
      // Throw an error if the API request failed
      return {
        success: false,
        error: `Error while requesting Original Record from OIP daemon: ${e}`
      };
    } // Throw an Error if record does not exist


    if (!original) {
      return {
        success: false,
        error: `A Record with the txid ${editedRecord.getTXID()} was not found in OIP daemon! Please make sure you have set 'options.oipdURL' to your OIP daemon server!`
      };
    } // Set the Publisher Address before we sign


    editedRecord.setPubAddress(this.options.publicAddress); // Check if a timestamp is set, and if not, set it to the current date (in ms time)

    if (!editedRecord.getTimestamp()) {
      editedRecord.setTimestamp(Date.now());
    } // Create an Edit Record from the Original and Edited


    let edit = new _edit.EditRecord(undefined, original, editedRecord); // Publish to chain

    let res = await this.broadcastRecord(edit, 'edit');
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
      throw new Error(`Data must be of type string. Got: ${typeof data}`);
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

      let _ref3 = await mp.signSelf(this.wallet.signMessage.bind(this.wallet)),
          error = _ref3.error;

      if (error) {
        throw new Error(`Failed to sign multipart: ${error}`);
      } // not going to be valid yet or will it


      if (!mp.isValid().success) {
        console.log(mp);
        throw new Error(`Invalid multipart: ${mp.isValid().error}`);
      }

      let txid;

      try {
        // console.log(mp.toString())
        // console.log(mp.toString().length)
        // throw new Error('STOP')
        txid = await this.wallet.sendDataToChain(mp.toString());
      } catch (err) {
        console.log(err.stack);
        throw new Error(`Failed to broadcast multipart: ${err}`);
      } // console.log(txid)


      txids.push(txid);
    }

    return txids;
  }

}

var _default = OIP;
exports.default = _default;