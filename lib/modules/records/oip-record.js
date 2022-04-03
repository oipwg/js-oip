"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bitcoinjsMessage = require("bitcoinjs-message");

class OIPRecord {
  constructor() {
    this.preimage = undefined;
    this.signature = undefined;
    this.pubAddress = undefined;
  }
  /**
   * Signs the record for publishing purposes
   * @param  {Function} signMessage - A function (provided by a wallet) that allows a message to be signed with the approapriate private address
   * @return {Object} Returns `{success: true, signature}` if signing was successful
   */


  async signSelf(signMessage) {
    if (!signMessage) {
      return {
        success: false,
        error: 'Must provide a function to sign with!'
      };
    }

    let preimage = this.createPreimage();
    let signature;

    try {
      signature = await signMessage(preimage);
    } catch (e) {
      return {
        success: false,
        error: e
      };
    }

    this.setSignature(signature);
    return {
      success: true,
      signature
    };
  }
  /**
   * Checks signature validity
   * @param {string} [message_prefix=\u001bFlorincoin Signed Message:]
   * @return {boolean}
   */


  hasValidSignature() {
    let message_prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '\u001bFlorincoin Signed Message:\n';
    return (0, _bitcoinjsMessage.verify)(this.getPreimage(), this.getPubAddress(), this.getSignature(), message_prefix);
  }
  /**
   * Sets the signature to `this.signature`
   * @param sig
   */


  setSignature(sig) {
    this.signature = sig;
  }
  /**
   * Retrieves the signature
   * @return {string}
   */


  getSignature() {
    return this.signature;
  }
  /**
   * Sets the publisher/public address to `this.pubAddress`
   * @param pubAddress
   */


  setPubAddress(pubAddress) {
    this.pubAddress = pubAddress;
  }
  /**
   * Retrieves the publisher/public address
   * @return {string}
   */


  getPubAddress() {
    return this.pubAddress;
  }
  /**
   * Default method. Classes that extend OIPRecord must override this method with a unique preimage generator
   * @example
   * createPreimage() {
   *     return `${uniqueVariable}-${publisherAddress}-${timestamp}`
   * }
   */


  createPreimage() {
    throw new Error("Classes that extend OIPRecord must contain a 'createPreimage' method");
  }
  /**
   * Returns the preimage that was generated on signature creation. (to be used for validation)
   * @return {string}
   */


  getPreimage() {
    return this.preimage;
  }
  /**
   * Default method. Classes that extend OIPRecord must override this method with a unique serialize method to format it for publishing. See Artifact.serialize() for an example.
   */


  serialize() {
    throw new Error("Classes that extend OIPRecord must contain a 'serialize' method");
  }
  /**
   * Turn the OIP Record to JSON
   * @return {Object} Returns the json version of the OIP Record
   */


  toJSON() {
    return {
      preimage: this.preimage,
      signature: this.signature,
      pubAddress: this.pubAddress
    };
  }
  /**
   * Load an OIP Record from JSON
   * @param {Object} recordJSON - json containing a preimage, signature, and/or pubAddress
   */


  fromJSON(recordJSON) {
    this.preimage = recordJSON.preimage;
    this.signature = recordJSON.signature;
    this.pubAddress = recordJSON.pubAddress;
  }
  /**
   * Default Method. Classes that extend OIPRecord must override this method with validity check that returns an object with a 'success' property
   * @example
   * isValid() {
   *  let valid = someValiditycheck
   *  if (valid) {
   *      return {success: true, error: undefined}
   *  } else {
   *      return {success: false, error: "Error message"}
   *  }
   * }
   */


  isValid() {
    throw new Error("Classes that extend OIPRecord must contain a 'isValid' method");
  }

}

var _default = OIPRecord;
exports.default = _default;