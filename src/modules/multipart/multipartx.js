import MPSingle from './mpsingle'

import { FLODATA_MAX_LEN } from '../flo/FLOTransaction'
export const CHOP_MAX_LEN = 837
/**
 * An OIP Multipart Converter (X); converts large data into OIP Multiparts and vice versa
 * @param {string|Array.<MPSingle>} input - String data or OIP Multiparts (MPSingle)s (hint: can pass in an JSON object)
 * @class
 */
class MultipartX {
  constructor (input) {
    this.multiparts = []

    if (typeof input === 'string') {
      if (input.length < FLODATA_MAX_LEN) {
        return { success: false, error: 'Data does not exceed max floData length of 1040 bytes. MPX not needed.' }
      }
      this.fromString(input)
    } else if (Array.isArray(input)) {
      this.fromMultiparts(input)
    } else if (typeof input === 'object' && input !== null) {
      this.fromJSON(input)
    } else {
      return { success: false, error: 'Invalid input type. Must provide string, object, or array of multiparts' }
    }
  }

  /**
   * Splits the jsonString input into multiparts
   * @param {string} jsonString - string data that is too long to fit onto one FLO transaction
   */
  fromString (jsonString) {
    let chunks = []

    // ToDo:: FLODATA_MAX_LEN vs CHOP_MAX_LEN
    let maximumLength = CHOP_MAX_LEN

    // If we have between 100 and 999 parts, our max length needs to be reduced by a few
    if (jsonString.length / maximumLength >= 99) { maximumLength = CHOP_MAX_LEN - 4 }
    // If we have a 1,000 part multipart transaction, we really need to be rethinking our plan and instead store
    // data inside IPFS or something else...

    while (jsonString.length > maximumLength) {
      chunks.push(jsonString.slice(0, maximumLength))
      jsonString = jsonString.slice(maximumLength)
    }
    chunks.push(jsonString)

    let max = chunks.length - 1

    // We can do part, max, and data here | ref, sig, and addr are done in publisher
    let multiparts = []
    for (let i = 0; i < chunks.length; i++) {
      let tmpObj = {}
      tmpObj.part = i
      tmpObj.max = max
      tmpObj.data = chunks[i]
      let mps = new MPSingle(tmpObj)
      multiparts.push(mps)
    }

    this.multiparts = multiparts
  }

  /**
   * Returns the assembled data from the multiparts
   * @return {string} assembled
   */
  toString () {
    if (!this.getMultiparts()) {
      return { success: false, error: `No mulitparts found.` }
    }
    let datastring = ''
    for (let mp of this.multiparts) {
      datastring += mp.getData()
    }
    return datastring
  }

  fromJSON (json) {
    this.fromString(JSON.stringify(json))
  }

  /**
   * Takes in an array of {MPSingle} for later method use
   * @param {Array.<MPSingle>} MPSingles - an array of multiparts {MPSingle}
   */
  fromMultiparts (MPSingles) {
    for (let mp of MPSingles) {
      if (!(mp instanceof MPSingle)) { throw new Error('Input must be instanceof MPSingle') }
    }
    MPSingles.sort((a, b) => a.getPart() - b.getPart())
    this.multiparts = MPSingles
  }

  /**
   * Return Multiparts array
   * @return {Array.<MPSingle>} multiparts
   */
  getMultiparts () {
    return this.multiparts || []
  }
}

export default MultipartX
