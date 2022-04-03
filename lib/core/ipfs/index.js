"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "IpfsHttpApi", {
  enumerable: true,
  get: function get() {
    return _ipfsHttpApi.default;
  }
});
Object.defineProperty(exports, "IpfsXml", {
  enumerable: true,
  get: function get() {
    return _ipfsXml.default;
  }
});

var _ipfsHttpApi = _interopRequireDefault(require("./ipfsHttpApi"));

var _ipfsXml = _interopRequireDefault(require("./ipfsXml"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }