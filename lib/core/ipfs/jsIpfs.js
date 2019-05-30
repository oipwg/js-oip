"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ipfs = _interopRequireDefault(require("ipfs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class JsIpfs {
  constructor() {
    this.node = new _ipfs.default();
    this.ready = false;
    this.node.once('ready', () => {
      this.ready = true;
      console.log('Ipfs node ready');
    });
    this.node.on('error', error => {
      console.error('Something went terribly wrong!', error);
    });
    this.node.once('stop', () => console.log('Ipfs node stopped!'));
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


  async addFiles(data) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    await this.readyCheck(); // get fileSize
    // options = options || {progress: (bytesAdded) => {console.log("Added " + toMB(bytesAdded) + " MB out of " + `${options.fileSize || "NaN"}` + " MB")}}

    let filesAdded;

    try {
      filesAdded = await this.node.files.add(data, options);
    } catch (err) {
      throw new Error(`Failed to add files: ${err}`);
    } // console.log('files added: ', filesAdded)


    return filesAdded;
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
    await this.readyCheck();

    try {
      return await this.node.files.cat(ipfsPath);
    } catch (err) {
      throw new Error(`Failed to get back file: ${err}`);
    }
  }

  isReady() {
    return this.ready;
  }

  async readyCheck() {
    return new Promise(resolve => {
      this.node.once('ready', resolve);

      if (this.isReady()) {
        resolve();
      }
    });
  }

  async stop() {
    try {
      await this.node.stop();
    } catch (error) {
      console.error('Node failed to stop cleanly!', error);
    }
  }

} // const toMB = function (num) {
//   return Math.round((num / 1024 / 1024) * 100) / 100
// }


var _default = JsIpfs;
exports.default = _default;