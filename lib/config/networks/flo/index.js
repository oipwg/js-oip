"use strict";

var _mainnet = _interopRequireDefault(require("./mainnet"));

var _testnet = _interopRequireDefault(require("./testnet"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  mainnet: _mainnet.default,
  testnet: _testnet.default
};