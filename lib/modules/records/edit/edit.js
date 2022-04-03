"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom.iterable.js");

var _rfc = require("rfc6902");

var _oipRecord = _interopRequireDefault(require("../oip-record"));

var _decoders = require("../../../decoders");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class EditRecord extends _oipRecord.default {
  constructor(editRecordJSON, originalRecord, patchedRecord) {
    super();
    this.oipRecordType = 'artifact'; // Define the edit information

    this.edit = {
      txid: undefined,
      timestamp: undefined,
      patch: undefined
    };
    this.meta = {
      applied: undefined
    };
    this.signature = undefined;

    if (originalRecord) {
      this.setOriginalRecord(originalRecord);
    }

    if (patchedRecord) {
      this.setPatchedRecord(patchedRecord);
    }

    if (editRecordJSON) {
      this.fromJSON(editRecordJSON);
    }
  }
  /**
   * Signs the PatchedRecord and EditRecord
   * @param  {Function} signMessage - A function (provided by a wallet) that allows a message to be signed with the approapriate private address
   * @return {Object} Returns `{success: true, signature}` if signing was successful
   */


  async signSelf(signMessage) {
    // If we have a patched record, attempt to sign it
    if (this.getPatchedRecord()) {
      try {
        await this.getPatchedRecord().signSelf(signMessage);
      } catch (e) {
        return {
          success: false,
          error: "Unable to sign Patched Record: ".concat(e)
        };
      } // Make sure the Record is valid


      let {
        success,
        error
      } = this.getPatchedRecord().isValid();

      if (!success) {
        return {
          success: false,
          error: "Patched Record is not valid: ".concat(error)
        };
      } // Now that we know the patched record is valid, create the latest patch version


      if (this.getOriginalRecord()) {
        this.createPatch();
      }
    }

    let signature;

    try {
      signature = await _oipRecord.default.prototype.signSelf.call(this, signMessage);
    } catch (e) {
      return {
        success: false,
        error: "Unable to create EditRecord signature: ".concat(e)
      };
    }

    return {
      success: true,
      signature
    };
  }

  setPatchedRecord(patchedRecord) {
    this.patchedRecord = patchedRecord;

    if (this.originalRecord) {
      // If the Patched Record has the same Timestamp as the Original Record, update it.
      if (this.getOriginalRecord().getTimestamp() === this.getPatchedRecord().getTimestamp()) {
        this.getPatchedRecord().setTimestamp(Date.now());
      }

      if (this.getOriginalRecord().getSignature() === this.getPatchedRecord().getSignature()) {
        this.getPatchedRecord().setSignature('');
      }

      this.createPatch();
    } else {
      this.setOriginalRecordTXID(patchedRecord.getOriginalTXID());
    }
  }

  setOriginalRecord(originalRecord) {
    this.originalRecord = originalRecord;
    this.setOriginalRecordTXID(originalRecord.getOriginalTXID());
  }

  setOriginalRecordTXID(originalTXID) {
    this.edit.txid = originalTXID;
  }

  setTimestamp(timestamp) {
    this.edit.timestamp = timestamp;
  }

  setPatch(rfc6902Patch) {
    this.edit.patch = rfc6902Patch;

    if (this.originalRecord && !this.patchedRecord) {
      let patchedRecord = this.createPatchedRecord(this.originalRecord, this.edit.patch);
      this.setPatchedRecord(patchedRecord);
    }
  }

  setTXID(txid) {
    this.meta.txid = txid;
  }

  getPatchedRecord() {
    return this.patchedRecord;
  }

  getOriginalRecord() {
    return this.originalRecord;
  }

  getOriginalRecordTXID() {
    return this.edit.txid;
  }

  getTimestamp() {
    return this.edit.timestamp;
  }

  getPatch() {
    return this.edit.patch;
  }

  getTXID() {
    return this.meta.txid;
  }
  /**
   * Apply an RFC6902 patch to an OIP Record
   * @param  {OIPRecord} originalRecord           - The Original Record
   * @param  {RFC6902PatchJSON} rfc6902Patch - The RFC6902 Patch JSON
   * @return {OIPRecord} Returns an OIP Record with the Edit Patch applied
   */


  createPatchedRecord(originalRecord, rfc6902Patch) {
    let clonedJSON = originalRecord.toJSON();
    let patchOperations = (0, _rfc.applyPatch)(clonedJSON.artifact, rfc6902Patch);

    for (let op of patchOperations) {
      if (op !== null) {
        throw new Error('Patch Application had an Error! ' + JSON.stringify(patchOperations, null, 4));
      }
    }

    let patchedRecord = (0, _decoders.decodeArtifact)(clonedJSON);
    this.setPatchedRecord(patchedRecord);
    return patchedRecord;
  }
  /**
   * Create an RFC6902 JSON Patch
   * @param  {Object} originalJSON
   * @param  {Object} modifiedJSON
   * @return {RFC6902PatchJSON} Returns the RFC6902 Patch JSON
   */


  createRFC6902Patch(originalJSON, modifiedJSON) {
    this.rfc6902Patch = (0, _rfc.createPatch)(originalJSON, modifiedJSON);
    return this.rfc6902Patch;
  }
  /**
   * Create the RFC6902 Patch based on the Original Record and the Patched Record
   */


  createPatch() {
    // Verify that we have the Records we need
    if (!this.originalRecord || !this.patchedRecord) {
      throw new Error('Cannot create Patch without an Original Record and the Patched Record!');
    } // Create the rfc6902 JSON patch from the Record JSON


    let originalJSON = this.originalRecord.toJSON().artifact;
    let patchedJSON = this.patchedRecord.toJSON().artifact;
    this.rfc6902Patch = this.createRFC6902Patch(originalJSON, patchedJSON); // Set the RFC6902 Patch

    this.setPatch(this.rfc6902Patch);
  }

  createPreimage() {
    this.preimage = "".concat(this.getOriginalRecordTXID(), "-").concat(this.getTimestamp());
    return this.preimage;
  }
  /**
   * Get the JSON version of the edit
   * @return {Object}
   */


  toJSON() {
    let cloneJSON = JSON.parse(JSON.stringify({
      edit: this.edit,
      meta: this.meta
    }));
    return cloneJSON;
  }
  /**
   * Load an EditRecord from JSON
   * @param  {Object} editRecord - The Edit Record JSON
   */


  fromJSON(editRecord) {
    if (editRecord.edit) {
      if (editRecord.edit.txid) {
        this.setOriginalRecordTXID(editRecord.edit.txid);
      }

      if (editRecord.edit.timestamp) {
        this.setTimestamp(editRecord.edit.timestamp);
      }

      if (editRecord.edit.patch) {
        this.setPatch(editRecord.edit.patch);
      }
    }

    if (editRecord.signature) {
      this.signature = editRecord.signature;
    }

    if (editRecord.meta) {
      this.meta = editRecord.meta;
    }
  }

  serialize() {
    let serializedJSON = {};
    serializedJSON[this.oipRecordType] = this.edit;
    serializedJSON.signature = this.getSignature();
    return "json:".concat(JSON.stringify({
      oip042: {
        edit: serializedJSON
      }
    }));
  }
  /**
   * Get the Class Name.
   * @return {string} Returns "EditRecord"
   */


  getClassName() {
    return 'EditRecord';
  }

  isValid() {
    if (!this.edit.txid || this.edit.txid === '') {
      return {
        success: false,
        error: 'Original Record TXID is a Required Field!'
      };
    }

    if (!this.edit.timestamp || this.edit.timestamp === '') {
      return {
        success: false,
        error: 'Having a timestamp is Required!'
      };
    }

    if (!this.edit.patch || this.edit.patch === '') {
      return {
        success: false,
        error: 'Having an Edit Patch is Required!'
      };
    } // Check if we only have [{ op: 'replace', path: '/timestamp', value: 123 }]


    let onlyReplace = true;
    let onlyTimestampAndSignature = true;

    for (let operation of this.edit.patch) {
      if (operation.op !== 'replace') {
        onlyReplace = false;
      }

      if (operation.op === 'replace') {
        if (operation.path !== '/timestamp' && operation.path !== '/signature') {
          onlyTimestampAndSignature = false;
        }
      }
    }

    if (JSON.stringify(this.edit.patch) === '{}' || onlyReplace && onlyTimestampAndSignature) {
      return {
        success: false,
        error: 'Empty Patch! You must modify the Record in order to edit it!'
      };
    }

    if (!this.signature || this.signature === '') {
      return {
        success: false,
        error: 'Having a Signature is Required!'
      };
    }

    return {
      success: true
    };
  }

}

exports.default = EditRecord;