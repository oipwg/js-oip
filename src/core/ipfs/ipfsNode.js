import IPFS from 'ipfs'

class IpfsNode {
	constructor() {
		this.node = new IPFS()

		node.on('ready', () => {
			console.log("I'm ready!")
		})

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
	 *          path: '/tmp/myfile.txt',
	 *          content: ipfs.types.Buffer.from('ABC)
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
	async addFiles(data, options) {
		let filesAdded
		try {
			filesAdded = await this.node.files.add(data)
		} catch (err) {
			throw new Error(`Failed to add files: ${err}`)
		}

		console.log(filesAdded)
	}

	/**
	 * Returns a file addressed by a valid IPFS Path
	 * @param {CID|string} ipfsPath - type cid: (a CID instance, Buffer, the raw Buffer of the cid, String, the base58 encoded version of the cid.) type String: (including the ipfs handler, a cid and a path to traverse to)
	 * @param {object} [options]
	 * @param [options.offset] - an optional byte offset to start the stream at
	 * @param {number} [options.length] - an optional number of bytes to read from the stream
	 * @return {Promise<string>}
	 */
	async getFile(ipfsPath, options) {
		this.readyCheck()

		let fileBuffer
		try {
			fileBuffer = await node.cat(ipfsPath)
		} catch (err) {
			throw new Error(`Failed to get back file: ${err}`)
		}

		return fileBuffer.toString()
	}

	isReady() {
		return this.ready
	}

	readyCheck() {
		if (!this.isReady()) {
			throw new Error(`Node not ready`)
		}
	}
}

}

export default IpfsNode