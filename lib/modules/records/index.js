"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "OIPRecord", {
  enumerable: true,
  get: function get() {
    return _oipRecord.default;
  }
});
Object.defineProperty(exports, "Influencer", {
  enumerable: true,
  get: function get() {
    return _influencer.Influencer;
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
exports.Artifacts = void 0;

var _oipRecord = _interopRequireDefault(require("./oip-record"));

var Artifacts = _interopRequireWildcard(require("./artifact"));

exports.Artifacts = Artifacts;

var _influencer = require("./influencer");

var _platform = require("./platform");

var _publisher = require("./publisher");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }