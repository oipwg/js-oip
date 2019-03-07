import { createPatch } from 'rfc6902'

import OIPRecord from '../oip-record'

export default class EditRecord extends OIPRecord {
  constructor (editRecordJSON, originalRecord, patchedRecord) {
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

    if (originalRecord)
     this.setOriginalRecord(originalRecord)

    if (patchedRecord)
      this.setPatchedRecord(patchedRecord)

    if (editRecordJSON)
      this.fromJSON(editRecordJSON)
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

  /**
   * Create an RFC6902 JSON Patch
   * @param  {Object} originalJSON
   * @param  {Object} modifiedJSON 
   * @return {RFC6902PatchJSON} Returns the RFC6902 Patch JSON
   */
  createRFC6902Patch (originalJSON, modifiedJSON) {
    this.rfc6902Patch = createPatch(originalJSON, modifiedJSON)

    return this.rfc6902Patch
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

  /**
   * Un-Squash a OIPSquashedPatch into a [RFC6902](https://tools.ietf.org/html/rfc6902) JSON patch
   * @param {OIPSquashedPatch} squashedPatch - A [OIP Squashed Edit Patch](https://oip.wiki/index.php?title=Squash_Edit)
   * @returns {RFC6902PatchJSON} Returns the RFC6902 Patch JSON
  */
  unsquashRFC6902Patch (squashedPatch) {
    // Create an empty array to hold all of the patches
    let rfc6902Patch = []

    // Operations are stored at the key level, so we use `for in` here to loop through them
    for (let op in squashedPatch) {
      // remove operations are stored in an array
      if (op === 'remove'){
        for (let path of squashedPatch[op]) {
          rfc6902Patch.push({ op, path })
        }
      }

      // add, replace, and test operations are stored in an Object
      if (['add', 'replace', 'test'].includes(op)) {
        for (let path in squashedPatch[op]){
          let value = squashedPatch[op][path]

          rfc6902Patch.push({ op, path, value })
        }
      }

      // move, and copy operations are also stored in an Object
      if (['move', 'copy'].includes(op)) {
        // For move and copy operations, "from" is stored as the key
        for (let fromPath in squashedPatch[op]){
          // and "path" is stored as the value
          let path = squashedPatch[op][fromPath]

          rfc6902Patch.push({ op, from: fromPath, path })
        }
      }
    }

    // Return the array with unsquashed patches :)
    return rfc6902Patch
  }

  createPatch () {
    this.rfc6902Patch = this.createRFC6902Patch()
  }

  /**
   * Get the JSON version of the edit
   * @return {Object}
   */
  toJSON () {
    let cloneJSON = JSON.parse(JSON.stringify({
      edit: this.edit,
      meta: this.meta
    }))

    return cloneJSON
  }

  /**
   * Load an EditRecord from JSON
   * @param  {Object} editRecord - The Edit Record JSON
   */
  fromJSON (editRecord) {
    if (editRecord.edit) {
      if (editRecord.edit.txid)
        this.setOriginalRecordTXID(editRecord.edit.txid)
      if (editRecord.edit.timestamp)
        this.setTimestamp(editRecord.edit.timestamp)
      if (editRecord.edit.patch)
        this.setPatch(editRecord.edit.patch)
    }
    if (editRecord.meta) {
      this.meta = editRecord.meta
    }
  }

  serialize () {

  }
}
