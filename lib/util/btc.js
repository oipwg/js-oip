"use strict";

var _varuintBitcoin = _interopRequireDefault(require("varuint-bitcoin"));

var _wif = _interopRequireDefault(require("wif"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Check if a WIF is valid for a specific CoinNetwork
 * @param  {string} key - Base58 WIF Private Key
 * @param  {CoinNetwork} network
 * @return {Boolean}
 */
function isValidWIF(key, network) {
  try {
    let dec = _wif.default.decode(key);

    if (network) {
      return dec.version === network.wif;
    } else {
      return true;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
}

module.exports = {
  isValidWIF,
  varIntBuffer: _varuintBitcoin.default.encode
};