"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bitcoinjsLib = require("bitcoinjs-lib");

var _mainnet = require("../../config/networks/flo/mainnet");

var _FLOTransaction = _interopRequireDefault(require("./FLOTransaction"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class FLOTransactionBuilder extends _bitcoinjsLib.TransactionBuilder {
  constructor() {
    let network = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _mainnet.network;
    let maximumFeeRate = arguments.length > 1 ? arguments[1] : undefined;
    super(network, maximumFeeRate);
    this.__TX = new _FLOTransaction.default();
    this.__TX.version = 2;
  }

  setFloData(data, dataType) {
    return this.__TX.setFloData(data, dataType);
  }

}

var _default = FLOTransactionBuilder;
exports.default = _default;