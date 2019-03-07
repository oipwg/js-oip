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

  /**
   * Squash a [RFC6902](https://tools.ietf.org/html/rfc6902) JSON patch down a little smaller
   * @param {RFC6902PatchJSON} RFC6902PatchJSON - An [RFC6902](https://tools.ietf.org/html/rfc6902) JSON patch
   * @returns {OIPSquashedPatch} Returns the Squashed Patch JSON
  */
  squashRFC6902Patch (RFC6902PatchJSON) {
    // Create fresh empty object
    let squashedPatch = {}

    // Iterate through each patch in the array, and squash each down
    for (let patch of RFC6902PatchJSON) {
      // Check which operation the Patch is using, and handle it accordingly
      // for "remove" operations, we store the "path"s in an array
      if (patch.op === 'remove') {
        if (!squashedPatch[patch.op]) { squashedPatch[patch.op] = [] }

        squashedPatch[patch.op].push(patch.path)
      }
      // For the "add", "replace", and "test" operations we use an Object to store patches.
      // To store a patch, we use "path" as the key and
      // "value" as the value in a key value pair on the operation Object.
      // i.e. { operation: { path: value } }
      if (['add', 'replace', 'test'].includes(patch.op)) {
        if (!squashedPatch[patch.op]) { squashedPatch[patch.op] = {} }

        squashedPatch[patch.op][patch.path] = patch.value
      }
      // The "move", and "copy" operations are also stored in an Object,
      // however, they use "from" as the key and "path" as the value
      // (take notice of how "path" went from the key to the value)
      if (['move', 'copy'].includes(patch.op)) {
        if (!squashedPatch[patch.op]) { squashedPatch[patch.op] = {} }

        squashedPatch[patch.op][patch.from] = patch.path
      }
    }

    // And finally, we return the squashed patch :)
    return squashedPatch
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
