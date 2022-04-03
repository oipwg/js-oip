"use strict";

require("core-js/modules/web.dom.iterable.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Artifacts = void 0;
Object.defineProperty(exports, "Influencer", {
  enumerable: true,
  get: function get() {
    return _influencer.Influencer;
  }
});
Object.defineProperty(exports, "OIPRecord", {
  enumerable: true,
  get: function get() {
    return _oipRecord.default;
  }
});
Object.defineProperty(exports, "Platform", {
  enumerable: true,
  get: function get() {
    return _platform.Platform;
  }
});
Object.defineProperty(exports, "Publisher", {
  enumerable: true,
  get: function get() {
    return _publisher.Publisher;
  }
});

var _oipRecord = _interopRequireDefault(require("./oip-record"));

var Artifacts = _interopRequireWildcard(require("./artifact"));

exports.Artifacts = Artifacts;

var _influencer = require("./influencer");

var _platform = require("./platform");

var _publisher = require("./publisher");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }