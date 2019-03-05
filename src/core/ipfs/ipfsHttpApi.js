import ipfsClient from 'ipfs-http-client'

/**
 * A Class used for uploading/adding files to IPFS
 */
class IpfsHttpApi {
  /**
   * Create a new IPFS Node.js Add
   *
   * @param {Buffer|ReadableStream|PullStream} file - The [File](https://developer.mozilla.org/en-US/docs/Web/API/File) or [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) you want added to IPFS.
   * @param {Object} options - The Options for this Upload
   * @param {String} options.host - The hostname of the IPFS API server to upload to (i.e. "ipfs-dev.alexandria.io")
   * @param {String} options.protocol - The Protocol of the IPFS API server to upload to (i.e. "https")
   * @param {Number} options.port - The Port of the IPFS API server to upload to (i.e. `443`)
   * @param {Object} options.oip_auth - An object that contains a signed message, the address that signed the message, and the signature for them both
   * @param {String} [options.filename] - The filename/path of the Item you are uploading
   * @param {String} [options.filesize] - The size of the Item you are uploading. You must include this if you want valid progress reports.
   *
   * @example
   * let uploader = new IPFSNodejsAdd(file_readable_stream, {
   *  "filename": "example_file.mp4",
   *  "host": "ipfs-dev.alexandria.io",
   *  "protocol": "https",
   *  "port": 443,
   *  "oip_auth": {
   *    address:"oNRs1nuR1vUAjWJwhMtxJPQoTFAm9MWz1G",
   *    message:'1534278675842{"oip042":{}}',
   *    signature:"Hw2iuomv/fhYYoKX8bNroVXmOvbh/e9gqZjP+I9kZymHD72mqtDw1qjN6/Qh4nhTDOHI8mkxbWtsaLSTuCkSihU="
   *  }
   * })
   */
  constructor (file, options) {
    this.file = file
    this.options = options

    this.ipfs = new ipfsClient({
      host: options.host,
      port: options.port,
      protocol: options.protocol,
      headers: {
        'OIP-Auth': JSON.stringify(options.oip_auth)
      }
    })

    this.progress_subscribers = []
  }
  /**
   * Subscribe to upload Progress events
   * @param  {Function} progress_function - The function you want called when there is a progress update available
   *
   * @example
   * let uploader = new IPFSBrowserAdd(input.files[0], {
   *  "api_url": "https://ipfs-dev.alexandria.io",
   *  "oip_auth": {
   *    address:"oNRs1nuR1vUAjWJwhMtxJPQoTFAm9MWz1G",
   *    message:'1534278675842{"oip042":{}}',
   *    signature:"Hw2iuomv/fhYYoKX8bNroVXmOvbh/e9gqZjP+I9kZymHD72mqtDw1qjN6/Qh4nhTDOHI8mkxbWtsaLSTuCkSihU="
   *  }
   * })
   *
   * uploader.onProgress((progress_message) => {
   *  console.log("Progress! " + JSON.stringify(progress_message))
   * })
   */
  onProgress (progress_function) {
    this.progress_subscribers.push(progress_function)
  }
  /**
   * Start the File Upload to the server
   * @return {Promise<Object>} Returns a Promise that will resolve to the IPFS Added object JSON
   *
   * @example
   * let uploader = new IPFSBrowserAdd(input.files[0], {
   *  "api_url": "https://ipfs-dev.alexandria.io",
   *  "oip_auth": {
   *    address:"oNRs1nuR1vUAjWJwhMtxJPQoTFAm9MWz1G",
   *    message:'1534278675842{"oip042":{}}',
   *    signature:"Hw2iuomv/fhYYoKX8bNroVXmOvbh/e9gqZjP+I9kZymHD72mqtDw1qjN6/Qh4nhTDOHI8mkxbWtsaLSTuCkSihU="
   *  }
   * })
   *
   * uploader.onProgress((progress_message) => {
   *  console.log("Progress! " + JSON.stringify(progress_message))
   * })
   *
   * uploader.start().then((success_response) => {
   *  console.log("Upload Complete! " + JSON.stringify(success_response))
   * })
   */
  async start () {
    let file_object = {
      path: this.options.filename || '',
      content: this.file
    }
    let onProgressFunc = (bytesAdded) => {
      let progress_object = {
        bytes_uploaded: bytesAdded
      }

      if (this.options.filesize) {
        let percent = parseFloat(((bytesAdded / this.options.filesize) * 100).toFixed(2))

        progress_object.upload_progress = percent
        progress_object.bytes_total = this.options.filesize
      }

      for (let progress_function of this.progress_subscribers) { progress_function(progress_object) }
    }

    let response
    try {
      response = await this.ipfs.add(file_object, { progress: onProgressFunc })
    } catch (err) {
      throw new Error(`Failed to add file to ipfs: ${err}`)
    }

    // Return the first element in the Array
    return response[0]
  }
}

export default IpfsHttpApi
