import OIPRecord from '../oip-record'

export default class EditRecord extends OIPRecord {
  constructor () {
    super()

    // Define the edit information
    this.edit = {
      txid: undefined,
      timestamp: undefined,
      patch: undefined
    }

    this.meta = {
      applied: undefined
    }

    // Define variables to hold the current latest version record and the updated record
    this.previousRecordVersion = undefined
    this.updatedRecordVersion = undefined

    // Var to hold the internal rfc patch
    this.rfc6902Patch = undefined
  }

  setPatchedRecord (patchedRecord) {
    this.patchedRecord = patchedRecord
  }

  setOriginalRecord (originalRecord) {
    this.originalRecord = originalRecord
  }

  setOriginalRecordTXID (originalTXID) {
    this.edit.txid = originalTXID
  }

  setTimestamp (timestamp) {
    this.edit.timestamp = timestamp
  }

  setPatch (squashedPatch) {
    this.edit.patch = squashedPatch
  }

  getPatchedRecord () {
    return this.updatedRecordVersion
  }

  getOriginalRecord () {
    return this.previousRecordVersion
  }

  getOriginalRecordTXID () {
    return this.edit.txid
  }

  getTimestamp () {
    return this.edit.timestamp
  }

  getPatch () {
    return this.edit.patch
  }

  createRFC6902Patch (originalJSON, modifiedJSON) {

  }

  squashRFC6902Patch (RFC6902PatchJSON) {

  }

  unsquashRFC6902Patch (squashedPatch) {

  }

  createPatch () {
    this.rfc6902Patch = this.createRFC6902Patch()
  }

  /**
   * Get the JSON version of the edit
   * @return {[type]} [description]
   */
  toJSON () {

  }

  fromJSON () {

  }

  serialize () {

  }
}
