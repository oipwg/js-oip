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


}

export default IpfsNode