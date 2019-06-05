import axios from 'axios'
import { MPSingle } from '../../modules'
import { decodeArtifact } from '../../decoders'

/**
 * The Transaction ID on the Blockchain.
 * @typedef {string} TXID
 * @example <caption>Full TXID Reference</caption>
 * 8a83ecb7812ca2770814d996529e153b07b103424cd389b800b743baa9604c5b
 * @example <caption>Shortened TXID Reference</caption>
 * 8a83ec
 */

/**
 * Objects that are used to build an elasticsearch complex query
 * @typedef {Object} queryObject
 * @property {string} field - artifact property ex. artifact.info.title
 * @property {string} query - the query term that will be searched on the field ex. 'Some title'
 * @property {string} operator - Can be: "AND", "OR", "NOT", or "wrap" (wrap objects will also have a property called 'type' which can be either 'start', 'end', or 'all')
 * @property {string} type - Can be: 'start', 'end', or 'all'
 * @example <caption>Search a query on a specific field</caption>
 * let fieldObject = {field: "artifact.title", query: "Some Title"}
 * @example <caption>Search a query on all fields</caption>
 * let queryObject = {query: "cats"}
 * @example <caption>Add a Complex Operator (AND, OR, or NOT)</caption>
 * let complexObject = {operator: "AND"}
 * @example <caption>Wrap parenthesis around the entire search query</caption>
 * let wrapAll = {operator: "wrap", type: "all"}
 * @example <caption>Add a beginning parenthesis</caption>
 * let wrapStart = {operator: "wrap", type: "start"}
 * @example <caption> Add an ending parenthesis</caption>
 * let wrapEnd = {operator: "wrap", type: "end"}
 * @example <caption>Build a search query</caption>
 * let searchQuery = [
 *      {operator: "wrap", type: "start"},
 *      {field: "artifact.type", query: "research"},
 *      {operator: "AND"}
 *      {field: "artifact.info.year", query: "2017"}
 *      {operator: "wrap", type: "end"},
 *      {operator: "OR"},
 *      {operator: "wrap", type: "start"},
 *      {field: "artifact.info.year", query: "2016"},
 *      {operator: "AND"},
 *      {field: "artifact.type", query: "music"},
 *      {operator: "wrap", type: "end"},
 * ]
 * let query = DaemonApi.createQs(searchQuery)
 * //query === "( artifact.type:"research" AND artifact.info.year:"2017" ) OR ( artifact.info.year:"2016" AND artifact.type:"music" )"
 * let {artifacts} = await DaemonApi.searchArtifacts(query)
 * @example <caption>Make things easier on yourself with constants and functions</caption>
 * const field = (field, query) => {return {field, query}}
 * const query = query => {return {query}}
 * const WrapAll = {operator: "wrap", type: "all"}
 * const WrapStart = {operator: "wrap", type: "start"}
 * const WrapEnd = {operator: "wrap", type: "end"}
 * const AND = {operator: "AND"}
 * const OR  = {operator: "OR"}
 * const NOT = {operator: "NOT"}
 *
 * let query = [
 *      field("artifact.type", "research"),
 *      AND,
 *      field("artifact.info.year", "2017"),
 *      WrapAll,
 *      OR,
 *      WrapStart,
 *      field("artifact.type", "music",
 *      AND,
 *      field("artifact.info.year", "2016"),
 *      WrapEnd
 * ]
 * let qs = DaemonApi.createQs(query)
 */

const decodeArray = (artifacts) => {
  let tmpArray = []
  for (let art of artifacts) {
    tmpArray.push(decodeArtifact(art))
  }
  return tmpArray
}

// ToDo: change to 'https' when ready
const localhost = 'http://localhost:1606/oip'
const defaultOIPdURL = 'https://api.oip.io/oip'
const VERIFIED_PUBLISHER_TEMPLATE = 'tmpl_F471DFF9'
const verifyApiEndpoint = 'https://snowflake.oip.fun/verified/publisher/check/'

/**
 * Class to make HTTP calls to an OIP Daemon
 */
class DaemonApi {
  /**
   * ##### Examples
   * Spawn an OIP Daemon API (OIPdAPI) that connects to a local running daemon
   * ```javascript
   * import {DaemonApi} from 'js-oip'
   *
   * let oipd = new DaemonApi("localhost:1606") //leave blank for default API URL
   * let latestArtifacts = await oipd.getLatestArtifacts()
   * ```
   * @param  {string} [daemonUrl="https://api.oip.io/oip"] - The URL of an OIP Daemon
   */
  constructor (daemonUrl) {
    if (daemonUrl) {
      if (daemonUrl === 'localhost') {
        this.setUrl(localhost)
      } else {
        this.setUrl(daemonUrl)
      }
    } else {
      this.setUrl(defaultOIPdURL) // ToDo: default for prod
    }
  }

  /**
   * Set the DaemonUrl
   * @param {string} daemonUrl - the URL of an OIP Daemon (OIPd)
   * @example
   * DaemonApi.setUrl('snowflake.oip.fun:1606')
   * let url = DaemonUrl.getUrl()
   * url === 'snowflake.oip.fun:1606' //true
   */
  setUrl (daemonUrl) {
    this.url = daemonUrl

    this.index = new axios.create({ // eslint-disable-line
      baseURL: this.url
    })
  }

  /**
   * Get current DaemonUrl
   * @return {String} daemonUrl
   * @example
   * let url = DaemonUrl.getUrl()
   */
  getUrl () {
    return this.url
  }

  /**
   * Get Axios Instance
   * @return {axios}
   */
  getNetwork () {
    return this.index
  }

  /**
   * Search the Index for artifacts by query
   * @param {string} query - your search query
   * @param {number} [limit=100] - max num of results
   * @return {Promise<Object>}
   * @example
   * let {success, artifacts, error} = await DaemonApi.search('myQuery')
   */
  async searchArtifacts (query, limit) {
    if (typeof query !== 'string') {
      return { success: false, error: `'query' must be of type string` }
    }

    let res
    try {
      res = await this.index.get(`/artifact/search`, {
        params: {
          q: query,
          limit
        }
      })
    } catch (err) {
      throw new Error(`Failed to search artifacts for: ${query} -- ${err}`)
    }
    if (res && res.data) {
      let { count, total, results } = res.data
      return { success: true, artifacts: decodeArray(results), count, total }
    } else {
      return { success: false, error: `Missing response data: ${res.data}` }
    }
  }

  /**
   * Search Artifacts by type and subtype
   * @param {string} type - options: video, music, audio, image, text, research, and property (as of 12/15/18)
   * @param {string} [subtype] - options: tomogram (as of (12/15/18)
   * @return {Promise<Object>}
   * @example
   * let {success, artifacts, error} = await DaemonApi.searchArtifactsByType('research', 'tomogram')
   */
  async searchArtifactsByType (type, subtype) {
    if (type.split('-').length === 2) {
      let split = type.split('-')[0]
      type = split[0]
      subtype = split[1]
    }

    const typeQs = `artifact.type:`
    const subtypeQs = `artifact.subtype:`

    type = type.toLowerCase()
    subtype = subtype ? subtype.toLowerCase() : null

    let typeArr = []
    switch (type) {
      // 40 and 41s
      case 'video':
        typeArr.push('video', 'Video', 'Video-Basic', 'Video-Series')
        break
      case 'music':
        typeArr.push('music')
        break
      case 'image':
        typeArr.push('Image-Basic', 'Image-Gallery')
        break
      case 'audio':
        typeArr.push('Audio-Basic', 'music')
        break
      case 'text':
        typeArr.push('Text-Basic')
        break
      // 42s
      case 'research':
        typeArr.push('research')
        break
      case 'property':
        typeArr.push('Property')
        break
      default:
        throw new Error(`invalid type: ${type}`)
    }

    let typeQuery = ``
    let subtypeQuery = ``
    const OR = 'OR'
    const AND = 'AND'
    for (let i = 0; i < typeArr.length; i++) {
      typeQuery += `${typeQs}${typeArr[i]}`
      if (i !== typeArr.length - 1) {
        typeQuery += ` ${OR} `
      }
    }

    let query = `(${typeQuery}) `
    if (subtype) {
      subtypeQuery += `${AND} `
      subtypeQuery += `${subtypeQs}${subtype}`
      query += subtypeQuery
    }

    try {
      return await this.searchArtifacts(query)
    } catch (err) {
      throw err
    }
  }

  /**
   * Generate a complex querystring for elasticsearch
   * @param {Array.<queryObject>} args - An array of objects that follow given example
   * @return {string}
   * @example <caption>Search for both Research and Music artifact types that were created in 2017</caption>
   * let args = [
   *      {operator: "wrap", type: 'start'},
   *      {field: "artifact.details.defocus", query: "-10"},
   *      {operator: "AND"},
   *      {field: "artifact.details.microscopist", query: "Yiwei Chang"},
   *      {operator: "wrap", type: "end"},
   *      {operator: "OR"},
   *      {operator: "wrap", type: "start"},
   *      {field: "artifact.details.defocus", query: "-8"},
   *      {operator: "AND"},
   *      {field: "artifact.details.microscopist", query: "Ariane Briegel"},
   *      {operator: "wrap", type: "end"},
   * ]
   * //the query would end up looking something like:
   * let query = "(artifact.details.defocus:"-10" AND artifact.details.microscopist:"Yiwei Chang") OR (artifact.details.defocus:"-8" AND artifact.details.microscopist:"Ariane Briegel")"
   * @example
   * let querystring = this.generateQs(args)
   * querystring === query //true
   * let {artifacts} = await this.searchArtifacts(querystring)
   */
  createQs (args) {
    let query = ``
    const AND = 'AND'
    const OR = 'OR'
    const NOT = 'NOT'
    for (let i = 0; i < args.length; i++) {
      if (i !== 0) {
        query += ' '
      }
      if (args[i].operator) {
        if (args[i].operator.toUpperCase() === AND || args[i].operator.toUpperCase() === OR || args[i].operator.toUpperCase() === NOT) {
          args[i] = args[i].operator.toUpperCase()
          query += `${args[i]}`
        } else if (args[i].operator.toLowerCase() === 'wrap') {
          if (args[i]['type'] === 'start') {
            query += '('
          } else if (args[i]['type'] === 'end') {
            query += ')'
          } else if (args[i]['type'] === 'all') {
            query = query.slice(0, -1) // this is arbitrary--just to standardize return vals
            query = `(${query})`
          }
        } else {
          throw new Error(`Provided invalid operator: Options: "AND", "OR", "NOT", "wrap"`)
        }
      } else {
        if (args[i].field) {
          query += `${args[i].field}:"${args[i].query}"`
        } else {
          query += `${args[i].query}` // do these need to be wrapped in quotes?
        }
      }
    }
    // console.log(query)
    return query
  }

  /**
   * Get an Artifact from the Index by TXID
   * @param {TXID} txid  - transaction id of the artifact you wish to retrieve
   * @return {Promise<Object>}
   * @example
   * let txid = 'cc9a11050acdc4401aec3f40c4cce123d99c0f2c27d4403ae4a2536ee38a4716'
   * let {success, artifact, error} = await DaemonApi.getArtifact(txid)
   */
  async getArtifact (txid) {
    let res
    try {
      res = await this.index.get(`/artifact/get/${txid}`)
    } catch (err) {
      return new Error(`Failed to get artifact: ${txid} -- ${err}`)
    }
    if (!res || !res.data) {
      return { success: false, error: `Missing response data: ${res.data} for txid ${txid}` }
    }

    if (!res.data.results || !Array.isArray(res.data.results) || res.data.results.length < 1) {
      return { success: false, error: `No results found for txid ${txid}` }
    }

    let [artifact] = res.data.results

    return { success: true, artifact: decodeArtifact(artifact) } // ToDO: OIPDecoder
  }

  /**
   * Get multiple artifacts by TXID
   * @param {Array.<TXID>} txids - an array of transaction IDs
   * @return {Promise<Object>}
   * @example
   * const txid1 = '6ffbffd475c7eabe0acc664087ac56c13ac7c2084746619182b360c2f19e430e'
   * const txid2 = 'f72c314d257d8062581788ab56bbe4ab1dc09dafb7961866903d1144575a3b48'
   * const txid3 = '0be3e260a9ff71464383e328d05d9e85984dd6636626bc0356eae8440de150aa'
   * let txArray = [txid1, txid2, txid3]
   * let {success, artifacts, error} = await DaemonApi.getArtifacts(txArray)
   */
  async getArtifacts (txids) {
    if (!Array.isArray(txids)) {
      return { success: false, error: `'txids' must be an Array of transaction IDs` }
    }
    let artifacts = []
    for (let txid of txids) {
      let res
      try {
        res = await this.getArtifact(txid)
      } catch (err) {
        throw new Error(`Failed to get artifacts: ${txids} -- ${err}`)
      }
      if (res.success) artifacts.push(res.artifact)
    }
    return { success: true, artifacts: artifacts }
  }

  /**
   * Get the latest artifacts published to the Index
   * @param {number} [limit=100] - The amount of artifact you want returns ( max: 1000 )
   * @param {boolean} [nsfw=false] - not safe for work
   * @return {Promise<Object>}
   * @example
   * let limit = 50
   * let {success, artifacts, error} = await DaemonApi.getLatestArtifacts(limit)
   */
  async getLatestArtifacts (limit = 100, nsfw = false) {
    let res
    try {
      res = await this.index.get(`/artifact/get/latest`, {
        params: {
          nsfw,
          limit
        }
      })
    } catch (err) {
      throw new Error(`Failed to get latest artifacts: ${err}`)
    }
    if (res && res.data) {
      let artifacts = res.data.results
      return { success: true, artifacts: decodeArray(artifacts) }
    } else {
      return { success: false, error: `Missing response data: ${res.data}` }
    }
  }

  /**
   * Get the latest version 41 artifacts published to the Index
   * @param {number} [limit=100] - The amount of artifact you want returns ( max: 1000 )
   * @param {boolean} [nsfw=false] - not safe for work
   * @return {Promise<Object>}
   * @example
   * const limit = 50
   * let {success, artifacts, error} = await DaemonApi.getLatest041Artifacts(limit)
   */
  async getLatest041Artifacts (limit = 100, nsfw = false) {
    let res
    try {
      res = await this.index.get(`/oip041/artifact/get/latest`, {
        params: {
          nsfw,
          limit
        }
      })
    } catch (err) {
      throw new Error(`Failed to get latest 041 artifacts -- ${err}`)
    }

    if (res && res.data) {
      let artifacts = res.data.results
      return { success: true, artifacts: decodeArray(artifacts) }
    } else {
      return { success: false, error: `Missing response data: ${res.data}` }
    }
  }

  /**
   * Get a version 41 Artifact from the Index by TXID
   * @param {TXID} txid  - transaction id of the artifact you wish to retrieve
   * @return {Promise<Object>}
   * @example
   * let txid = '8c204c5f39b67431c59c7703378b2cd3b746a64743e130de0f5cfb2118b5136b'
   * let {success, artifact, error} = await DaemonApi.get041Artifact(txid)
   */
  async get041Artifact (txid) {
    let res
    try {
      res = await this.index.get(`/oip041/artifact/get/${txid}`)
    } catch (err) {
      throw new Error(`Failed to get 041 artifact: ${txid} -- ${err}`)
    }
    if (res && res.data) {
      let [artifact] = res.data.results
      return { success: true, artifact: decodeArtifact(artifact) }
    } else {
      return { success: false, error: `Missing response data: ${res.data}` }
    }
  }

  /**
   * Get multiple OIP041 artifact by their TXID
   * @param {Array.<TXID>} txids - an array of transaction IDs
   * @return {Promise<Object>}
   * @example
   * const txid1 = '8c204c5f39b67431c59c7703378b2cd3b746a64743e130de0f5cfb2118b5136b'
   * const txid2 = 'a690609a2a8198fbf4ed3fd7e4987637a93b7e1cad96a5aeac2197b7a7bf8fb9'
   * const txid3 = 'b4e6c9e86d14ca3565e57fed8b482d742a7a1cff0dd4cabfe9e3ea29efb3211c'
   * let txArray = [txid1, txid2, txid3]
   * let {success, artifacts, error} = await DaemonApi.get041Artifacts(txArray)
   */
  async get041Artifacts (txids) {
    if (!Array.isArray(txids)) {
      return { success: false, error: `'txids' must be an Array of transaction IDs` }
    }
    let artifacts = []
    for (let txid of txids) {
      let res
      try {
        res = await this.get041Artifact(txid)
      } catch (err) {
        throw new Error(`Failed to get 041 artifacts: ${txids} -- ${err}`)
      }
      if (res.success) artifacts.push(res.artifact)
    }
    return { success: true, artifacts: artifacts }
  }

  /**
   * Get the version 42 artifacts published to the Index
   * @param {number} [limit=100] - The amount of artifact you want returns ( max: 1000 )
   * @param {boolean} [nsfw=false] - not safe for work artifact
   * @return {Promise<Object>}
   * @example
   * const limit = 50
   * let {success, artifacts, error} = await DaemonApi.getLatest042Artifacts(limit)
   */
  async getLatest042Artifacts (limit = 100, nsfw = false) {
    let res
    try {
      res = await this.index.get(`/oip042/artifact/get/latest`, {
        params: {
          nsfw,
          limit
        }
      })
    } catch (err) {
      throw new Error(`Failed to get latest 042 artifacts: ${err}`)
    }
    if (res && res.data) {
      let artifacts = res.data.results
      return { success: true, artifacts: decodeArray(artifacts) }
    } else {
      return { success: false, error: `Missing response data: ${res.data}` }
    }
  }

  /**
   * Get the latest Alexandria Media artifacts (version "40") published to the Index
   * @param {number} [limit=100] - The amount of artifact you want returns ( max: 1000 )
   * @param {boolean} [nsfw=false] - not safe for work
   * @return {Promise<Object>}
   * @example
   * const limit = 50
   * let {success, artifacts, error} = await DaemonApi.getLatestAlexandriaMediaArtifacts(limit)
   */
  async getLatestAlexandriaMediaArtifacts (limit = 100, nsfw = false) {
    let res
    try {
      res = await this.index.get(`/alexandria/artifact/get/latest`, {
        params: {
          nsfw,
          limit
        }
      })
    } catch (err) {
      throw new Error(`Failed to get latest alexandria media artifacts -- ${err}`)
    }
    if (res && res.data) {
      let artifacts = res.data.results
      return { success: true, artifacts: decodeArray(artifacts) }
    } else {
      return { success: false, error: `Missing response data: ${res.data}` }
    }
  }

  /**
   * Get an Alexandria Media Artifact (version "40") from the Index by TXID
   * @param {TXID} txid  - transaction id of the artifact you wish to retrieve
   * @return {Promise<Object>}
   * @example
   * let txid = '756f9199c8992cd42c750cbd73d1fa717b31feafc3b4ab5871feadae9848acac'
   * let {success, artifact, error} = await DaemonApi.getAlexandriaMediaArtifact(txid)
   */
  async getAlexandriaMediaArtifact (txid) {
    let res
    try {
      res = await this.index.get(`/alexandria/artifact/get/${txid}`)
    } catch (err) {
      throw new Error(`Failed to get alexandria media artifact: ${txid} -- ${err}`)
    }
    if (res && res.data) {
      let [artifact] = res.data.results
      return { success: true, artifact: decodeArtifact(artifact) } // ToDo: OIPDecoder
    } else {
      return { success: false, error: `Missing response data: ${res.data}` }
    }
  }

  /**
   * Get one or more Alexandria Media (version "40") artifacts by their TXID
   * @param {Array.<TXID>} txids - an array of transaction IDs
   * @return {Promise<Object>}
   * @example
   * const txid1 = '33e04cb2dcf7004a460d0719eea36129ebaf48fb10cffff19653bfeeca9bc7ad'
   * const txid2 = 'a2110a1058b620d91bc78ad71e466d736f6b8b078025d19c23ddac6a3c0355ee'
   * const txid3 = 'b6f89f3c6410276f7d4cf9c3c58c4f0577495650e742e71dddc669c9e912217c'
   * let txArray = [txid1, txid2, txid3]
   * let {success, artifacts, error} = await DaemonApi.getAlexandriaMediaArtifacts(txArray)
   */
  async getAlexandriaMediaArtifacts (txids) {
    if (!Array.isArray(txids)) {
      return { success: false, error: `'txids' must be an Array of transaction IDs` }
    }
    let artifacts = []
    for (let txid of txids) {
      let res
      try {
        res = await this.getAlexandriaMediaArtifact(txid)
      } catch (err) {
        throw new Error(`Failed to get alexandria media artifacts: ${txids} -- ${err}`)
      }
      if (res.success) artifacts.push(res.artifact)
    }
    return { success: true, artifacts: artifacts }
  }

  /**
   * Search the floData from FLO provided by the Daemon's Index
   * @param {string} query - your search query
   * @param {number} [limit] - max num of results
   * @return {Promise<Object>} Returns FLO transactions that contain your query in their respective floData
   * @example
   * let query = 'myQuery'
   * let {success, txs, error} = await DaemonApi.searchFloData(query)
   * for (let i of txs) {
   *     let floData = i.tx.floData
   * }
   */
  async searchFloData (query, limit) {
    if (typeof query !== 'string') {
      return { success: false, error: `'query' must be of type string` }
    }
    let res
    try {
      res = await this.index.get(`/floData/search`, {
        params: {
          q: query,
          limit
        }
      })
    } catch (err) {
      throw new Error(`Failed to search flo data for: ${query} -- ${err}`)
    }
    if (res && res.data) {
      let txs = res.data.results
      return { success: true, txs }
    } else {
      return { success: false, error: `Missing response data: ${res.data}` }
    }
  }

  /**
   * Get floData by TXID
   * @param {TXID} txid - the transaction id you wish to grab the floData from
   * @return {Promise.<Object>}
   * @example
   * let txid = '83452d60230d3c2c69000c2a79da79fe60cdf63012f946ac46e6df3409fb1fa7'
   * let {success, tx, error} = await DaemonApi.getFloData(txid)
   * let floData = tx.floData
   */
  async getFloData (txid) {
    let res
    try {
      res = await this.index.get(`/floData/get/${txid}`)
    } catch (err) {
      throw new Error(`Failed to get flo tx: ${txid} -- ${err}`)
    }
    if (res && res.data) {
      let [tx] = res.data.results
      return { success: true, tx }
    } else {
      return { success: false, error: `Missing response data: ${res.data}` }
    }
  }

  /**
   * Get a Multipart Single by its TXID
   * @param {TXID} txid - transaction id of the single multipart
   * @return {Promise<Object>}
   * @example
   * let txid = 'f550b9739e7453224075630d44cba24c31959af913aeb7cb364a563f96f54548'
   * let {success, multipart, error} = await DaemonApi.getMultipart(txid)
   */
  async getMultipart (txid) {
    let res
    try {
      res = await this.index.get(`/multipart/get/id/${txid}`)
    } catch (err) {
      throw new Error(`Failed to get multipart by txid: ${txid} -- ${err}`)
    }
    if (res && res.data) {
      let [mp] = res.data.results
      return { success: true, multipart: new MPSingle(mp) }
    } else {
      return { success: false, error: `Missing response data: ${res.data}` }
    }
  }

  /**
   * Get OIP Multiparts by the First TXID Reference
   * @param {string} ref - the TXID reference of the first multipart
   * @param {number} [limit] - max num of results
   * @return {Promise<Object>}
   * @example
   * let ref = '8c204c5f39'
   * let {success, multiparts, error} = await DaemonApi.getMultiparts(ref)
   */
  async getMultiparts (ref, limit) {
    let res
    let querystring = `/multipart/get/ref/${ref}`
    try {
      res = await this.index.get(querystring, {
        params: {
          limit
        }
      })
    } catch (err) {
      throw new Error(`Failed to get multiparts by ref: ${ref} -- ${err}`)
    }
    if (res && res.data) {
      let results = res.data.results
      let multiparts = []
      for (let mp of results) {
        multiparts.push(new MPSingle(mp))
      }
      multiparts.sort((a, b) => a.getPart() - b.getPart())
      return { success: true, multiparts }
    } else {
      return { success: false, error: `Missing response data: ${res.data}` }
    }
  }

  /**
   * Get a historian data point by its txid
   * @param {TXID} txid
   * @return {Promise<Object>}
   * @example
   * let id = '83452d60230d3c2c69000c2a79da79fe60cdf63012f946ac46e6df3409fb1fa7'
   * let {success, hdata, error} = await DaemonApi.getHistorianData(id)
   */
  async getHistorianData (txid) {
    let res
    try {
      res = await this.index.get(`historian/get/${txid}`)
    } catch (err) {
      throw new Error(`Failed to get historian data by txid: ${txid} -- ${err}`)
    }
    if (res && res.data) {
      let [hdata] = res.data.results
      return { success: true, hdata }
    } else {
      return { success: false, error: `Missing response data: ${res.data}` }
    }
  }

  /**
   * Get the latest historian data points
   * @param {number} [limit=100]
   * @return {Promise<Object>}
   * @example
   * let {success, hdata, error} = await DaemonApi.getLastestHistorianData()
   */
  async getLastestHistorianData (limit = 100) {
    let res
    try {
      res = await this.index.get(`historian/get/latest`, {
        params: {
          limit
        }
      })
    } catch (err) {
      throw new Error(`Failed to get latest historian data: ${err}`)
    }
    if (res && res.data) {
      let hdata = res.data.results
      return { success: true, hdata }
    } else {
      return { success: false, error: `Missing response data: ${res.data}` }
    }
  }

  /**
   * Get OIP Daemon specs
   * @return {Promise<Object>}
   * @example
   * let versionData = await DaemonApi.getVersion()
   */
  async getVersion () {
    let res
    try {
      res = await this.index.get('daemon/version')
    } catch (err) {
      throw new Error(`Failed to get daemon version: ${err}`)
    }
    return res.data
  }

  /**
   * Get the Daemon's sync status
   * @return {Promise<Object>}
   */
  async getSyncStatus () {
    let res
    try {
      res = await this.index.get('/sync/status')
    } catch (err) {
      throw new Error(`Failed to get sync status: ${err}`)
    }
    return res.data
  }

  /**
   * Get latest oip5 records
   * @param {Object} [options]
   * @param {number} [options.limit=10] - max num of results
   * @param {string} [options.after] - the string ID returned on response to get the next set of data
   * @param {number} [options.pages] - page number
   * @param {string} [options.sort] - sort field ascending or descending. Format must match: ([0-9a-zA-Z._-]+:[ad]$?)+
   * @return {Promise<Object>}
   */
  async getLatestOip5Records (options) {
    let res
    try {
      res = await this.index.get('o5/record/get/latest', {
        params: {
          ...options
        }
      })
    } catch (err) {
      throw new Error(`Failed to get latest oip5 records: ${err}`)
    }
    if (res && res.data) {
      res = { success: true, payload: decodeResponseData(res.data) }
      return res
    } else {
      return { success: false, error: `No data returned from axios response on getLatestOip5Records` }
    }
  }

  /**
   * Get latest oip5 templates
   * @param {Object} [options]
   * @param {number} [options.limit=10] - max num of results
   * @param {string} [options.after] - the string ID returned on response to get the next set of data
   * @param {number} [options.pages] - page number
   * @param {string} [options.sort] - sort field ascending or descending. Format must match: ([0-9a-zA-Z._-]+:[ad]$?)+
   * @return {Promise<Object>}
   */
  async getLatestOip5Templates (options) {
    let res
    try {
      res = await this.index.get('o5/template/get/latest', {
        params: {
          ...options
        }
      })
    } catch (err) {
      throw new Error(`failed to get latest oip5 templates: ${err}`)
    }
    if (res && res.data) {
      res = { success: true, payload: decodeResponseData(res.data) }
      return res
    } else {
      return { success: false, error: `Failed to get data back from axios response` }
    }
  }

  /**
   * Get oip5 record
   * @param {string} [txid] - transaction id of record
   * @return {Promise<Object>}
   */
  async getOip5Record (txid) {
    let res
    try {
      res = await this.index.get(`o5/record/get/${txid}`)
    } catch (err) {
      return { success: false, error: err }
    }
    if (res && res.data) {
      res = { success: true, payload: decodeResponseData(res.data) }
      return res
    } else {
      return { success: false, error: `no data returned from axios response getOip5Record: ${txid}` }
    }
  }

  /**
   * Get oip5 records
   * @param {Array.<string>|string} txids - transaction id of record
   * @return {Promise<Array.<Object>>}
   */
  async getOip5Records (txids) {
    if (typeof txids === 'string') {
      return this.getOip5Record(txids)
    }
    let promiseArray = []
    for (let txid of txids) {
      promiseArray.push(this.getOip5Record(txid))
    }
    let responseArray = []
    for (let promise of promiseArray) {
      let resolvedPromise
      try {
        resolvedPromise = await promise
      } catch (err) {
        throw new Error(`Failed to get oip5 records: ${err}`)
      }
      responseArray.push(resolvedPromise)
    }
    return responseArray
  }

  /**
   * Get oip5 template
   * @param {string} [txid] - transaction id of record
   * @return {Promise<Object>}
   */
  async getOip5Template (txid) {
    let res
    try {
      res = await this.index.get(`o5/template/get/${txid}`)
    } catch (err) {
      throw new Error(`Failed to get oip5 template: ${err}`)
    }
    if (res && res.data) {
      res = { success: true, payload: decodeResponseData(res.data) }
      return res
    } else {
      return { success: false, error: `No data returned from axios request getOip5Template: ${txid}` }
    }
  }

  /**
   * Get oip5 templates
   * @param {string|Array.<string>} txids - transaction ids of record
   * @return {Promise<Array.<Object>>}
   */
  async getOip5Templates (txids) {
    if (typeof txids === 'string') {
      return this.getOip5Template(txids)
    }
    if (!Array.isArray(txids)) {
      throw new Error(`The param "txids" must be an array of txids or a single txid string`)
    }
    let promiseArray = []
    for (let txid of txids) {
      promiseArray.push(this.getOip5Template(txid))
    }
    let responseArray = []
    for (let promise of promiseArray) {
      let resolvedPromise
      try {
        resolvedPromise = await promise
      } catch (err) {
        throw new Error(`Could not get oip5 templates: ${err}`)
      }

      responseArray.push(resolvedPromise)
    }
    return responseArray
  }

  /**
   * Get oip5 template
   * @param {string|Array<string>} [tmplIdentifiers] - 'template identifiers' transaction IDs'
   * @return {Promise<Object>}
   */
  async getOip5Mapping (tmplIdentifiers) {
    if (typeof tmplIdentifiers === 'string') {
      tmplIdentifiers = [tmplIdentifiers]
    }
    let res
    try {
      res = await this.index.get(`o5/record/mapping/${tmplIdentifiers}`)
    } catch (err) {
      throw new Error(`Failed to get oip5 mappings: ${err}`)
    }

    if (res && res.data) {
      res = { success: true, payload: res.data }
      return res
    } else {
      return { success: false, error: `Failed to get data back from axios request trying to get oip5 mappings` }
    }
  }

  /**
   * Search oip5 templates
   * @param {Object} options
   * @param {string} options.q - query string query
   * @param {number} [options.limit=10] - max num of results (limited to 10 on backend)
   * @param {string} [options.after] - the string ID returned on response to get the next set of data
   * @param {number} [options.pages] - page number
   * @param {string} [options.sort] - sort field ascending or descending. Format must match: ([0-9a-zA-Z._-]+:[ad]$?)+
   * @return {Promise<Object>}
   */
  async searchOip5Records (options) {
    let res
    try {
      res = await this.index.get(`o5/record/search`, {
        params: {
          ...options
        }
      })
    } catch (err) {
      throw new Error(`Failed to search oip5 records: ${err}`)
    }

    if (res && res.data) {
      res = { success: true, payload: decodeResponseData(res.data) }
      return res
    } else {
      return { success: false, error: 'Did not receive data back from axios request trying to search oip5 records' }
    }
  }

  /**
   * Search oip5 templates
   * @param {Object} options
   * @param {string} options.q - query string query
   * @param {number} [options.limit=10] - max num of results (limited to 10 on backend)
   * @param {string} [options.after] - the string ID returned on response to get the next set of data
   * @param {number} [options.pages] - page number
   * @param {string} [options.sort] - sort field ascending or descending. Format must match: ([0-9a-zA-Z._-]+:[ad]$?)+
   * @return {Promise<Object>}
   */
  async searchOip5Templates (options) {
    let res
    try {
      res = await this.index.get(`o5/template/search`, {
        params: {
          ...options
        }
      })
    } catch (err) {
      throw new Error(`Failed to search oip5 templates: ${err}`)
    }

    if (res && res.data) {
      res = { success: true, payload: decodeResponseData(res.data) }
      return res
    } else {
      return { success: false, error: 'Did not receive data back from axios request trying to search oip5 templates' }
    }
  }
  async isVerifiedPublisher (pubAddr) {
    const q = `_exists_:record.details.${VERIFIED_PUBLISHER_TEMPLATE} && meta.signed_by:${pubAddr}`
    let results
    try {
      results = await this.searchOip5Records({ q })
    } catch (err) {
      throw Error(`Failed to search oip5 record for verified publisher: \n ${err}`)
    }
    const { success, payload } = results
    if (success) {
      const { results } = payload
      const { meta } = results[0]
      const { txid } = meta

      let res
      try {
        res = await axios.get(`${verifyApiEndpoint}${txid}`)
      } catch (err) {
        throw Error(`Failed to hit verify api endpoint url: ${verifyApiEndpoint} \n ${err}`)
      }
      return res.data
    } else {
      return { success: false, error: `Did not receive data back from axios request trying to search oip5 verified publisher: ${txid}` }
    }
  }
}

function decodeResponseData (payload) {
  const { next, ...rest } = payload
  return {
    next: decodeURI(next),
    ...rest
  }
}

export default DaemonApi
