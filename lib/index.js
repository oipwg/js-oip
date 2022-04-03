"use strict";

require("core-js/modules/web.dom.iterable.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "DaemonApi", {
  enumerable: true,
  get: function get() {
    return _core.DaemonApi;
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
exports.Networks = exports.Modules = void 0;
Object.defineProperty(exports, "OIP", {
  enumerable: true,
  get: function get() {
    return _core.OIP;
  }
});
Object.defineProperty(exports, "decodeArtifact", {
  enumerable: true,
  get: function get() {
    return _decoders.decodeArtifact;
  }
});

var _core = require("./core");

var Modules = _interopRequireWildcard(require("./modules"));

exports.Modules = Modules;

var Networks = _interopRequireWildcard(require("./config/networks"));

exports.Networks = Networks;

var _decoders = require("./decoders");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }