"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "OIP", {
  enumerable: true,
  get: function get() {
    return _core.OIP;
  }
});
Object.defineProperty(exports, "DaemonApi", {
  enumerable: true,
  get: function get() {
    return _core.DaemonApi;
  }
});
Object.defineProperty(exports, "JsIpfs", {
  enumerable: true,
  get: function get() {
    return _core.JsIpfs;
  }
});
Object.defineProperty(exports, "IpfsHttpApi", {
  enumerable: true,
  get: function get() {
    return _core.IpfsHttpApi;
  }
});
Object.defineProperty(exports, "IpfsXml", {
  enumerable: true,
  get: function get() {
    return _core.IpfsXml;
  }
});
Object.defineProperty(exports, "decodeArtifact", {
  enumerable: true,
  get: function get() {
    return _decoders.decodeArtifact;
  }
});
exports.Networks = exports.Modules = void 0;

var _core = require("./core");

var Modules = _interopRequireWildcard(require("./modules"));

exports.Modules = Modules;

var Networks = _interopRequireWildcard(require("./config/networks"));

exports.Networks = Networks;

var _decoders = require("./decoders");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }