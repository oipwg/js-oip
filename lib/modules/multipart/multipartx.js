"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.FLODATA_MAX_LEN = exports.CHOP_MAX_LEN = void 0;

var _mpsingle = _interopRequireDefault(require("./mpsingle"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CHOP_MAX_LEN = 839;
exports.CHOP_MAX_LEN = CHOP_MAX_LEN;
const FLODATA_MAX_LEN = 1040;
/**
 * An OIP Multipart Converter (X); converts large data into OIP Multiparts and vice versa
 * @param {string|Array.<MPSingle>} input - String data or OIP Multiparts (MPSingle)s (hint: can pass in an JSON object)
 * @class
 */

exports.FLODATA_MAX_LEN = FLODATA_MAX_LEN;

class MultipartX {
  constructor(input) {
    this.multiparts = [];

    if (typeof input === 'string') {
      if (input.length < FLODATA_MAX_LEN) {
        return {
          success: false,
          error: 'Data does not exceed max floData length of 1040 bytes. MPX not needed.'
        };
      }

      this.fromString(input);
    } else if (Array.isArray(input)) {
      this.fromMultiparts(input);
    } else if (typeof input === 'object' && input !== null) {
      this.fromJSON(input);
    } else {
      return {
        success: false,
        error: 'Invalid input type. Must provide string, object, or array of multiparts'
      };
    }
  }
  /**
   * Splits the jsonString input into multiparts
   * @param {string} jsonString - string data that is too long to fit onto one FLO transaction
   */


  fromString(jsonString) {
    let chunks = []; // ToDo:: FLODATA_MAX_LEN vs CHOP_MAX_LEN

    while (jsonString.length > CHOP_MAX_LEN) {
      chunks.push(jsonString.slice(0, CHOP_MAX_LEN));
      jsonString = jsonString.slice(CHOP_MAX_LEN);
    }

    chunks.push(jsonString);
    let max = chunks.length - 1; // We can do part, max, and data here | ref, sig, and addr are done in publisher

    let multiparts = [];

    for (let i = 0; i < chunks.length; i++) {
      let tmpObj = {};
      tmpObj.part = i;
      tmpObj.max = max;
      tmpObj.data = chunks[i];
      let mps = new _mpsingle.default(tmpObj);
      multiparts.push(mps);
    }

    this.multiparts = multiparts;
  }
  /**
   * Returns the assembled data from the multiparts
   * @return {string} assembled
   */


  toString() {
    if (!this.getMultiparts()) {
      return {
        success: false,
        error: `No mulitparts found.`
      };
    }

    let datastring = '';

    for (let mp of this.multiparts) {
      datastring += mp.getData();
    }

    return datastring;
  }

  fromJSON(json) {
    this.fromString(JSON.stringify(json));
  }
  /**
   * Takes in an array of {MPSingle} for later method use
   * @param {Array.<MPSingle>} MPSingles - an array of multiparts {MPSingle}
   */


  fromMultiparts(MPSingles) {
    for (let mp of MPSingles) {
      if (!(mp instanceof _mpsingle.default)) {
        throw new Error('Input must be instanceof MPSingle');
      }
    }

    MPSingles.sort((a, b) => a.getPart() - b.getPart());
    this.multiparts = MPSingles;
  }
  /**
   * Return Multiparts array
   * @return {Array.<MPSingle>} multiparts
   */


  getMultiparts() {
    return this.multiparts || [];
  }

}

var _default = MultipartX;
exports.default = _default;