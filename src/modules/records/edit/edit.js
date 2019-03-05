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

  setUpdatedRecord (updatedRecord) {
    this.updatedRecordVersion = updatedRecord
  }

  setPreviousRecord (previousRecord) {
    this.previousRecordVersion = previousRecord
  }

  createRFC6902Patch () {

  }

  squashRFC6902Patch () {

  }

  unsquashRFC6902 () {

  }

  createPatch () {

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
