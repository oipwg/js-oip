/**
 * A Class used for uploading/adding files to IPFS inside the Browser
 */
class IpfsXml {
  /**
   * Create a new XML HTTP Request IPFS Uploader
   * @param  {File|Blob} file - The [File](https://developer.mozilla.org/en-US/docs/Web/API/File) or [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) you want added to IPFS.
   * @param {Object} options - The Options for this Upload
   * @param {String} options.host - The hostname of the IPFS API server to upload to (i.e. "ipfs-dev.alexandria.io")
   * @param {String} options.protocol - The Protocol of the IPFS API server to upload to (i.e. "https")
   * @param {Number} options.port - The Port of the IPFS API server to upload to (i.e. `443`)
   * @param {Object} options.oip_auth - An object that contains a signed message, the address that signed the message, and the signature for them both
   *
   * @example
   * let uploader = new XMLRequestIPFSAdd(input.files[0], {
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

    this.upload_xmlhttprequest = new XMLHttpRequest()

    this.progress_subscribers = []
  }
  /**
   * Subscribe to upload Progress events
   * @param  {Function} progress_function - The function you want called when there is a progress update available
   *
   * @example
   * let uploader = new XMLRequestIPFSAdd(input.files[0], {
   *  "host": "ipfs-dev.alexandria.io",
   *  "protocol": "https",
   *  "port": 443,
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
   * let uploader = new XMLRequestIPFSAdd(input.files[0], {
   *  "host": "ipfs-dev.alexandria.io",
   *  "protocol": "https",
   *  "port": 443,
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
  start () {
    return new Promise((resolve, reject) => {
      // The "load" event is fired when the request has finished
      this.upload_xmlhttprequest.addEventListener('load', () => {
        var response = JSON.parse(this.upload_xmlhttprequest.responseText)

        // Normalize to match regular ipfs-api add output
        resolve({
          path: response.Name,
          hash: response.Hash,
          size: response.Size
        })
      })

      this.upload_xmlhttprequest.upload.onprogress = (progress) => {
        if (progress.lengthComputable) {
          var percent = parseFloat(((progress.loaded / progress.total) * 100).toFixed(2))

          for (var progress_function of this.progress_subscribers) {
            progress_function({
              upload_progress: percent,
              bytes_uploaded: progress.loaded,
              bytes_total: progress.total
            })
          }
        }
      }

      // Create the upload URL
      var built_url = ''

      built_url += this.options.protocol + '://'
      built_url += this.options.host

      var add_port = true

      // Don't add the port if the protocol matches the port
      if (this.options.protocol === 'http' && this.options.port === 80) { add_port = false }
      if (this.options.protocol === 'https' && this.options.port === 443) { add_port = false }

      if (add_port) { built_url += ':' + this.options.port }

      // Set the upload to use the URL
      this.upload_xmlhttprequest.open('POST', built_url + '/api/v0/add?json=true')
      // We are expecting a JSON response
      this.upload_xmlhttprequest.setRequestHeader('accept', 'application/json')

      this.upload_xmlhttprequest.setRequestHeader('OIP-Auth', JSON.stringify(this.options.oip_auth))

      // Set the encoding type since we are going to be sending FormData
      this.upload_xmlhttprequest.enctype = 'multipart/form-data'

      // Create a Form to send to the server
      var form = new FormData()
      form.append('path', this.file, this.file.name)

      // Start the upload
      this.upload_xmlhttprequest.send(form)
    })
  }
}

module.exports = IpfsXml
