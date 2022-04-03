"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _artifact = _interopRequireDefault(require("./artifact"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PropertySpatialUnit extends _artifact.default {
  constructor(artifact) {
    super(artifact);
    this.artifact.type = 'property';
    this.artifact.subtype = 'spatialUnit';
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
    return 'spatialUnit';
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
   * Get Spatial Type
   * @returns {string}
   */


  getSpatialType() {
    return this.artifact.details.spatialType;
  }
  /**
   * Set Spatial type
   * @param {string} spatialType
   */


  setSpatialType(spatialType) {
    if (spatialType) {
      this.artifact.details.spatialType = spatialType;
    }
  }
  /**
   * Get Spatial Data Type
   * @returns {string}
   */


  getSpatialDataType() {
    return this.artifact.details.spatialDataType;
  }
  /**
   * Set Spatial Data type
   * @param {string} spatialDataType
   */


  setSpatialDataType(spatialDataType) {
    if (spatialDataType) {
      this.artifact.details.spatialDataType = spatialDataType;
    }
  }
  /**
   * Get Spatial Data
   * @returns {Object}
   */


  getSpatialData() {
    return this.artifact.details.spatialData;
  }
  /**
   * Set Spatial Data
   * @param {Object} spatialData
   */


  setSpatialData(spatialData) {
    if (spatialData) {
      this.artifact.details.spatialData = spatialData;
    }
  }
  /**
   * Get Textual Data
   * @returns {string}
   */


  getTextualData() {
    return this.artifact.details.textualData;
  }
  /**
   * Set Textual Data
   * @param {string} textualData
   */


  setTextualData(textualData) {
    if (textualData) {
      this.artifact.details.textualData = textualData;
    }
  }
  /**
   * Get Address Data
   * @returns {Object}
   */


  getAddressData() {
    return this.artifact.details.addressData;
  }
  /**
   * Set Address Data
   * @param {Object} addressData
   */


  setAddressData(addressData) {
    if (addressData) {
      this.artifact.details.addressData = addressData;
    }
  }
  /**
   * Get Official ID
   * @returns {string}
   */


  getOfficialID() {
    return this.artifact.details.officialID;
  }
  /**
   * Set Official ID
   * @param {string} officialID
   */


  setOfficialID(officialID) {
    if (officialID) {
      this.artifact.details.officialID = officialID;
    }
  }
  /**
   * Get Parent ID
   * @returns {string}
   */


  getParentID() {
    return this.artifact.details.parentID;
  }
  /**
   * Set Parent ID
   * @param {string} parentID
   */


  setParentID(parentID) {
    if (parentID) {
      this.artifact.details.parentID = parentID;
    }
  }
  /**
   * Get Namespace
   * @returns {*}
   */


  getNamespace() {
    return this.artifact.details.ns;
  }
  /**
   * Set Namespace
   * @param ns
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

var _default = PropertySpatialUnit;
exports.default = _default;