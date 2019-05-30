"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _artifact = _interopRequireDefault(require("./artifact"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PropertyTenure extends _artifact.default {
  constructor(artifact) {
    super(artifact);
    this.artifact.type = 'property';
    this.artifact.subtype = 'tenure';
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
    return 'tenure';
  }
  /**
  * Set Tenure Type
  * @returns {string}
  */


  getTenureType() {
    return this.artifact.details.tenureType;
  }
  /**
  * Set Tenure type
  * @param {string} tenureType
  */


  setTenureType(tenureType) {
    if (tenureType) {
      this.artifact.details.tenureType = tenureType;
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
  * @param {string} ns
  */


  setNamespace(ns) {
    if (ns) {
      this.artifact.details.ns = ns;
    }
  }
  /**
  * Get Spatial Unit
  * @returns {Array<String>}
  */


  getSpatialUnits() {
    return this.artifact.details.spatialUnits;
  }
  /**
  * Set Spatial Unit
  * @param {Array<string>} spatialUnits
  */


  setSpatialUnits(spatialUnits) {
    if (spatialUnits) {
      if (!Array.isArray(spatialUnits)) {
        throw new Error(`spatialUnits must be an array`);
      }

      if (spatialUnits.length > 0) {
        this.artifact.details.spatialUnits = spatialUnits;
      }
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
  * Get Effective Date
  * ISO 8601 date string
  * @returns {"string"}
  */


  getEffectiveDate() {
    return this.artifact.details.effectiveDate;
  }
  /**
  * Set Effective Date
  * ISO 8601 date string
  * @param {"string"} effectiveDate
  */


  setEffectiveDate(effectiveDate) {
    if (effectiveDate) {
      this.artifact.details.effectiveDate = effectiveDate;
    }
  }
  /**
  * Get Expiration Date
  * ISO 8601 date string
  * @returns {"string"}
  */


  getExpirationDate() {
    return this.artifact.details.expirationDate;
  }
  /**
  * Set Expiration Date
  * ISO 8601 date string
  * @param {"string"} expirationDate
  */


  setExpirationDate(expirationDate) {
    if (expirationDate) {
      this.artifact.details.expirationDate = expirationDate;
    }
  }
  /**
  * Get Parties
  * @returns {string}
  */


  getParties() {
    return this.details.parties;
  }
  /**
  * Set parties
  * @param {Array} parties
  */


  setParties(parties) {
    if (parties) {
      if (!Array.isArray(parties)) {
        throw new Error(`parties must be an array of objects`);
      }

      if (parties.length > 0) {
        this.artifact.details.parties = [];

        for (let party of parties) {
          if (!party.role) {
            throw new Error(`Objects in parties must contain role property.`);
          }

          if (!party.party) {
            throw new Error(`Objects in parties must contain party property.`);
          }

          this.artifact.details.parties.push({
            role: party.role,
            party: party.party
          });
        }
      }
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

var _default = PropertyTenure;
exports.default = _default;