"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// ToDo: Fill out/finish class
class FloTx {
  constructor(floData) {
    this._source = floData;
    this.floData = undefined;
    this.blockhash = undefined;
    this.size = undefined;
    this.txid = undefined;
    this.time = undefined;
    this.fromJSON(floData);
  }
  /**
   * Return FloData
   * @returns {*}
   */


  getFloData() {
    return this.floData;
  }
  /**
   * Return Block Hash
   * @returns {*}
   */


  getBlockHash() {
    return this.blockhash;
  }
  /**
   * Return Size
   * @returns {*}
   */


  getSize() {
    return this.size;
  }
  /**
   * Get TXID
   * @returns {string|*}
   */


  getTXID() {
    return this.txid;
  }
  /**
   * Get Time
   * @returns {string|*}
   */


  getTime() {
    return this.time;
  }

  isValid() {
    return !!(this.blockhash && this.txid && this.floData);
  }

  fromJSON(floData) {
    if (typeof floData === 'string') {
      floData = JSON.parse(floData);
    }

    floData = floData.tx;

    if (floData.floData) {
      this.floData = floData.floData;
    }

    if (floData.blockhash) {
      this.blockhash = floData.blockhash;
    }

    if (floData.size) {
      this.size = floData.size;
    }

    if (floData.txid) {
      this.txid = floData.txid;
    }

    if (floData.time) {
      this.time = floData.time;
    }
  }

}

var _default = FloTx;
exports.default = _default;