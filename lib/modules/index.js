"use strict";

require("core-js/modules/web.dom.iterable.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ArtifactFile", {
  enumerable: true,
  get: function get() {
    return _files.ArtifactFile;
  }
});
Object.defineProperty(exports, "FLOTransaction", {
  enumerable: true,
  get: function get() {
    return _flo.FLOTransaction;
  }
});
Object.defineProperty(exports, "FLOTransactionBuilder", {
  enumerable: true,
  get: function get() {
    return _flo.FLOTransactionBuilder;
  }
});
Object.defineProperty(exports, "FloTx", {
  enumerable: true,
  get: function get() {
    return _flo.FloTx;
  }
});
Object.defineProperty(exports, "MPSingle", {
  enumerable: true,
  get: function get() {
    return _multipart.MPSingle;
  }
});
Object.defineProperty(exports, "MultipartX", {
  enumerable: true,
  get: function get() {
    return _multipart.MultipartX;
  }
});
Object.defineProperty(exports, "Peer", {
  enumerable: true,
  get: function get() {
    return _flo.Peer;
  }
});
exports.Records = void 0;

var _files = require("./files");

var _flo = require("./flo");

var _multipart = require("./multipart");

var Records = _interopRequireWildcard(require("./records"));

exports.Records = Records;

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }