"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _artifact = _interopRequireDefault(require("./artifact"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PropertyParty extends _artifact.default {
  constructor(artifact) {
    super(artifact);
    this.artifact.type = 'property';
    this.artifact.subtype = 'party';
  }
  /**
   * Returns the Artifact Type (to be used before class initialization)
   * @static
   * @returns {string}
   */


  static getArtifactType() {
    return 'property';
  }
  /**
   * Return the Artifact Subtype (to be used before class initialization)
   * @returns {string}
   */


  static getArtifactSubtype() {
    return 'party';
  }
  /**
   * Get Party Type
   * @returns {string}
   */


  getPartyType() {
    return this.artifact.details.partyType;
  }
  /**
   * Set Party Type
   * @param {string} partyType
   */


  setPartyType(partyType) {
    if (partyType) {
      this.artifact.details.partyType = partyType;
    }
  }
  /**
   * Get Members
   * @returns {Array.<Object>}
   */


  getMembers() {
    return this.artifact.details.members;
  }
  /**
   * Set Members
   * @param {Array.<Object>}members
   */


  setMembers(members) {
    if (members) {
      this.artifact.details.members = members;
    }
  }
  /**
   * Get Modified Date
   * ISO 8601 date string
   * @returns {"string"}
   */


  getModifiedDate() {
    return this.artifact.details.modifiedDate;
  }
  /**
   * Set Modified Date
   * ISO 8601 date string
   * @param {"string"} modifiedDate
   */


  setModifiedDate(modifiedDate) {
    if (modifiedDate) {
      this.artifact.details.modifiedDate = modifiedDate;
    }
  }
  /**
   * Get Namespace
   * @returns {string}
   */


  getNamespace() {
    return this.artifact.details.ns;
  }
  /**
   * Set Namespace
   * @param {string} ns
   */


  setNamespace(ns) {
    if (ns) {
      this.artifact.details.ns = ns;
    }
  }
  /**
   * Return Attributes
   * @returns {Object}
   */


  getAttributes() {
    return this.artifact.details.attrs;
  }
  /**
   * Set Attributes
   * @param {Object} attrs
   */


  setAttributes(attrs) {
    if (attrs) {
      this.artifact.details.attrs = {};

      for (let attr in attrs) {
        if (attrs[attr]) {
          this.artifact.details.attrs[attr] = attrs[attr];
        }
      }
    }
  }

}

var _default = PropertyParty;
exports.default = _default;