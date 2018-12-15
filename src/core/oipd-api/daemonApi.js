import axios from 'axios';
import {MPSingle} from '../../modules'
import {decodeArtifact} from '../../decoders'

/**
 * The Transaction ID on the Blockchain.
 * @typedef {string} TXID
 * @example <caption>Full TXID Reference</caption>
 * 8a83ecb7812ca2770814d996529e153b07b103424cd389b800b743baa9604c5b
 * @example <caption>Shortened TXID Reference</caption>
 * 8a83ec
 */

const hydrateArray = (artifacts) => {
	let tmpArray = []
	for (let art of artifacts) {
		tmpArray.push(decodeArtifact(art))
	}
	return tmpArray
}

//ToDo: change to 'https' when ready
const localhost = "http://localhost:1606"
const defaultOIPdURL = "http://snowflake.oip.fun:1606";

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
	 * @param  {Object} [daemonUrl="http://snowflake.oip.fun:1606"] - The URL of an OIP Daemon
	 */
	constructor(daemonUrl) {
		if (daemonUrl) {
			this.setUrl(daemonUrl)
		} else {
			this.setUrl(defaultOIPdURL) //ToDo: switch back to default
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
	setUrl(daemonUrl) {
		this.url = daemonUrl;

		this.index = new axios.create({
			baseURL: this.url,
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
		})
	}

	/**
	 * Get current DaemonUrl
	 * @return {String} daemonUrl
	 * @example
	 * let url = DaemonUrl.getUrl()
	 */
	getUrl() {
		return this.url
	}

	/**
	 * Get Axios Instance
	 * @return {axios}
	 */
	getNetwork() {
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
	async searchArtifacts(query, limit) {
		if (typeof query !== 'string') {
			return {success: false, error: `'query' must be of type string`}
		}
		let res;
		try {
			res = await this.index.get(`/artifact/search`, {
				params: {
					q: query
				},
				limit
			})
		} catch (err) {
			throw new Error(`Failed to search artifacts for: ${query} -- ${err}`)
		}
		if (res && res.data) {
			let artifacts = res.data.results
			return {success: true, artifacts: hydrateArray(artifacts)}
		} else {
			return {success: false, error: `Missing response data: ${res.data}`}
		}
	}

	/**
	 * Get an Artifact from the Index by TXID
	 * @param {TXID} txid  - transaction id of the artifact you wish to retrieve
	 * @return {Promise<Object>}
	 * @example
	 * let txid = 'cc9a11050acdc4401aec3f40c4cce123d99c0f2c27d4403ae4a2536ee38a4716'
	 * let {success, artifact, error} = await DaemonApi.getArtifact(txid)
	 */
	async getArtifact(txid) {
		let res
		try {
			res = await this.index.get(`/artifact/get/${txid}`);
		} catch (err) {
			return new ErrorX(`Failed to get artifact: ${txid}`, err)
		}
		if (res && res.data) {
			let [artifact] = res.data.results
			return {success: true, artifact: decodeArtifact(artifact)} //ToDO: OIPDecoder
		} else {
			return {success: false, error: `Missing response data: ${res.data}`}
		}
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
	async getArtifacts(txids) {
		if (!Array.isArray(txids)) {
			return {success: false, error: `'txids' must be an Array of transaction IDs`}
		}
		let artifacts = []
		for (let txid of txids) {
			let res
			try {
				res = await this.getArtifact(txid)
			} catch (err) {
				throw new ErrorX(`Failed to get artifacts: ${txids}`, err)
			}
			if (res.success) artifacts.push(res.artifact)
		}
		return {success: true, artifacts: artifacts}
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
	async getLatestArtifacts(limit = 100, nsfw = false) {
		let res
		try {
			res = await this.index.get(`/artifact/get/latest/${limit}`, {
				params: {
					nsfw
				}
			});
		} catch (err) {
			throw new ErrorX(`Failed to get latest artifacts`, err)
		}
		if (res && res.data) {
			let artifacts = res.data.results
			return {success: true, artifacts: hydrateArray(artifacts)}
		} else {
			return {success: false, error: `Missing response data: ${res.data}`}
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
	async getLatest041Artifacts(limit = 100, nsfw = false) {
		let res
		try {
			res = await this.index.get(`/oip041/artifact/get/latest/${limit}`, {
				params: {
					nsfw
				}
			});
		} catch (err) {
			throw new ErrorX(`Failed to get latest 041 artifacts`, err)
		}

		if (res && res.data) {
			let artifacts = res.data.results
			return {success: true, artifacts: hydrateArray(artifacts)}
		} else {
			return {success: false, error: `Missing response data: ${res.data}`}
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
	async get041Artifact(txid) {
		let res
		try {
			res = await this.index.get(`/oip041/artifact/get/${txid}`);
		} catch (err) {
			throw new ErrorX(`Failed to get 041 artifact: ${txid}`, err)
		}
		if (res && res.data) {
			let [artifact] = res.data.results
			return {success: true, artifact: decodeArtifact(artifact)} //ToDo: OIPDecoder
		} else {
			return {success: false, error: `Missing response data: ${res.data}`}
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
	async get041Artifacts(txids) {
		if (!Array.isArray(txids)) {
			return {success: false, error: `'txids' must be an Array of transaction IDs`}
		}
		let artifacts = []
		for (let txid of txids) {
			let res
			try {
				res = await this.get041Artifact(txid)
			} catch (err) {
				throw new ErrorX(`Failed to get 041 artifacts: ${txids}`, err)
			}
			if (res.success) artifacts.push(res.artifact)
		}
		return {success: true, artifacts: artifacts}
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
	async getLatest042Artifacts(limit = 100, nsfw = false) {
		let res
		try {
			res = await this.index.get(`/oip042/artifact/get/latest/${limit}`, {
				params: {
					nsfw
				}
			});
		} catch (err) {
			throw new ErrorX(`Failed to get latest 042 artifacts`, err)
		}
		if (res && res.data) {
			let artifacts = res.data.results
			return {success: true, artifacts: hydrateArray(artifacts)}
		} else {
			return {success: false, error: `Missing response data: ${res.data}`}
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
	async getLatestAlexandriaMediaArtifacts(limit = 100, nsfw = false) {
		let res
		try {
			res = await this.index.get(`/alexandria/artifact/get/latest/${limit}`, {
				params: {
					nsfw
				}
			});
		} catch (err) {
			throw new ErrorX(`Failed to get latest alexandria media artifacts`, err)
		}
		if (res && res.data) {
			let artifacts = res.data.results
			return {success: true, artifacts: hydrateArray(artifacts)}
		} else {
			return {success: false, error: `Missing response data: ${res.data}`}
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
	async getAlexandriaMediaArtifact(txid) {
		let res
		try {
			res = await this.index.get(`/alexandria/artifact/get/${txid}`);
		} catch (err) {
			throw new ErrorX(`Failed to get alexandria media artifact: ${txid}`, err)
		}
		if (res && res.data) {
			let [artifact] = res.data.results
			return {success: true, artifact: decodeArtifact(artifact)} //ToDo: OIPDecoder
		} else {
			return {success: false, error: `Missing response data: ${res.data}`}
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
	async getAlexandriaMediaArtifacts(txids) {
		if (!Array.isArray(txids)) {
			return {success: false, error: `'txids' must be an Array of transaction IDs`}
		}
		let artifacts = []
		for (let txid of txids) {
			let res
			try {
				res = await this.getAlexandriaMediaArtifact(txid)
			} catch (err) {
				throw new ErrorX(`Failed to get alexandria media artifacts: ${txids}`, err)
			}
			if (res.success) artifacts.push(res.artifact)

		}
		return {success: true, artifacts: artifacts}
	}

	/**
	 * Search the floData from FLO provided by the Daemon's Index
	 * @param {string} query - your search query
	 * @param {number} [limit] - max num of results
	 * @return {Promise<Object>} Returns FLO transactions that contain your query in their respective floData
	 * @example
	 * let query = 'myQuery'
	 * let {success, txs, error} = await DaemonApi.searchFloData(query)
	 * for (let tx of txs) {
	 *     let floData = tx.floData
	 * }
	 */
	async searchFloData(query, limit) {
		if (typeof query !== 'string') {
			return {success: false, error: `'query' must be of type string`}
		}
		let res;
		try {
			res = await this.index.get(`/floData/search`, {
				params: {
					q: query
				},
				limit
			})
		} catch (err) {
			throw new ErrorX(`Failed to search flo data for: ${query}`, err)
		}
		if (res && res.data) {
			let txs = res.data.results
			return {success: true, txs}
		} else {
			return {success: false, error: `Missing response data: ${res.data}`}
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
	async getFloData(txid) {
		let res;
		try {
			res = await this.index.get(`/floData/get/${txid}`)
		} catch (err) {
			throw new ErrorX(`Failed to get flo tx: ${txid}`, err)
		}
		if (res && res.data) {
			let [tx] = res.data.results
			return {success: true, tx}
		} else {
			return {success: false, error: `Missing response data: ${res.data}`}
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
	async getMultipart(txid) {
		let res;
		try {
			res = await this.index.get(`/multipart/get/id/${txid}`)
		} catch (err) {
			throw new ErrorX(`Failed to get multipart by txid: ${txid}`, err)
		}
		if (res && res.data) {
			let [mp] = res.data.results
			return {success: true, multipart: new MPSingle(mp)}

		} else {
			return {success: false, error: `Missing response data: ${res.data}`}
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
	async getMultiparts(ref, limit) {
		let res;
		let querystring = `/multipart/get/ref/${ref}`
		if (limit) querystring += `/${limit}`
		try {
			res = await this.index.get(querystring)
		} catch (err) {
			throw new ErrorX(`Failed to get multiparts by ref: ${ref}`, err)
		}
		if (res && res.data) {
			let results = res.data.results
			let multiparts = []
			for (let mp of results) {
				multiparts.push(new MPSingle(mp))
			}
			multiparts.sort((a, b) => a.getPart() - b.getPart())
			return {success: true, multiparts}

		} else {
			return {success: false, error: `Missing response data: ${res.data}`}
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
	async getHistorianData(txid) {
		let res
		try {
			res = await this.index.get(`historian/get/${txid}`)
		} catch (err) {
			throw new ErrorX(`Failed to get historian data by txid: ${txid}`, err)
		}
		if (res && res.data) {
			let [hdata] = res.data.results
			return {success: true, hdata}
		} else {
			return {success: false, error: `Missing response data: ${res.data}`}
		}
	}

	/**
	 * Get the latest historian data points
	 * @param {number} [limit=100]
	 * @return {Promise<Object>}
	 * @example
	 * let {success, hdata, error} = await DaemonApi.getLastestHistorianData()
	 */
	async getLastestHistorianData(limit = 100) {
		let res
		try {
			res = await this.index.get(`historian/get/latest/${limit}`)
		} catch (err) {
			throw new ErrorX(`Failed to get latest historian data`, err)
		}
		if (res && res.data) {
			let hdata = res.data.results
			return {success: true, hdata}
		} else {
			return {success: false, error: `Missing response data: ${res.data}`}
		}
	}

	/**
	 * Get OIP Daemon specs
	 * @return {Promise<Object>}
	 * @example
	 * let versionData = await DaemonApi.getVersion()
	 */
	async getVersion() {
		let res
		try {
			res = await this.index.get('/daemon/version')
		} catch (err) {
			throw new Error(`Failed to get daemon version: ${err}`)
		}
		return res.data
	}

	async getSyncStatus() {
		let res
		try {
			res = await this.index.get('/sync/status')
		} catch (err) {
			throw new ErrorX(`Failed to get sync status`, err)
		}
		return res.data
	}
}

export default DaemonApi