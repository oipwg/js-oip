import IPFS from 'ipfs'

class JsIpfs {
	constructor() {
		this.node = new IPFS()
		this.ready = false

		this.node.once('ready', () => {
			this.ready = true
			console.log("ipfs node ready")
		})

		this.node.on('error', error => {
			console.error('Something went terribly wrong!', error)
		})

		this.node.once('stop', () => console.log('Node stopped!'))

	}

	/**
	 * Add files and data to IPFS
	 * @param {Buffer|ReadableStream|PullStream|Array.<object>} data
	 * @param {object} [options] - see: {@link https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add} for options
	 * @example
	 * let content = ipfs.types.Buffer.from('ABC');
	 * let results = await ipfs.files.add(content);
	 * let hash = results[0].hash; // "Qm...WW"
	 * @example
	 * const files = [
	 *      {
	 *          path: '/tmp/myfile.txt', // the file path
	 *          content: <data> // A Buffer, Readable Stream or Pull Stream with the contents of the file
	 *      }
	 * ]
	 *
	 * const results = await ipfs.files.add(files)
	 * @example
	 * //results array
	 * [
	 *      {
	 *          "path": "tmp",
	 *          "hash": "QmWXdjNC362aPDtwHPUE9o2VMqPeNeCQuTBTv1NsKtwypg",
	 *          "size": 67
	 *      },
	 *      {
	 *          "path": "/tmp/myfile.txt",
	 *          "hash": "QmNz1UBzpdd4HfZ3qir3aPiRdX5a93XwTuDNyXRc6PKhWW",
	 *          "size": 11
	 *      }
	 * ]
	 */
	async addFiles(data, options = {}) {
		await this.readyCheck()

		//get fileSize
		// options = options || {progress: (bytesAdded) => {console.log("Added " + toMB(bytesAdded) + " MB out of " + `${options.fileSize || "NaN"}` + " MB")}}

		let filesAdded
		try {
			filesAdded = await this.node.files.add(data, options)
		} catch (err) {
			throw new Error(`Failed to add files: ${err}`)
		}

		// console.log('files added: ', filesAdded)
		return filesAdded
	}

	/**
	 * Returns a file addressed by a valid IPFS Path
	 * @param {CID|string} ipfsPath - type cid: (a CID instance, Buffer, the raw Buffer of the cid, String, the base58 encoded version of the cid.) type String: (including the ipfs handler, a cid and a path to traverse to)
	 * @param {object} [options]
	 * @param [options.offset] - an optional byte offset to start the stream at
	 * @param {number} [options.length] - an optional number of bytes to read from the stream
	 * @return {Promise<Buffer>}
	 */
	async catFile(ipfsPath, options) {
		await this.readyCheck()

		try {
			return await this.node.files.cat(ipfsPath)
		} catch (err) {
			throw new Error(`Failed to get back file: ${err}`)
		}
	}

	isReady() {
		return this.ready
	}

	async readyCheck() {
		return new Promise(res => {
			this.node.once('ready', res)
			if (this.isReady()) {res()}
		})
	}

	async stop() {

	}
}

const toMB = function(num){
	return Math.round((num  / 1024 / 1024) * 100) / 100;
}

export default JsIpfs