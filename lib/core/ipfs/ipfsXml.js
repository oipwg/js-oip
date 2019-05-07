"use strict";

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
  constructor(file, options) {
    this.file = file;
    this.options = options;
    this.uploadXmlhttprequest = new XMLHttpRequest(); // eslint-disable-line

    this.progressSubscribers = [];
  }
  /**
   * Subscribe to upload Progress events
   * @param  {Function} progressFunction - The function you want called when there is a progress update available
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


  onProgress(progressFunction) {
    this.progressSubscribers.push(progressFunction);
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


  start() {
    return new Promise((resolve, reject) => {
      // The "load" event is fired when the request has finished
      this.uploadXmlhttprequest.addEventListener('load', () => {
        var response = JSON.parse(this.uploadXmlhttprequest.responseText); // Normalize to match regular ipfs-api add output

        resolve({
          path: response.Name,
          hash: response.Hash,
          size: response.Size
        });
      });

      this.uploadXmlhttprequest.upload.onprogress = progress => {
        if (progress.lengthComputable) {
          var percent = parseFloat((progress.loaded / progress.total * 100).toFixed(2));

          for (var progressFunction of this.progressSubscribers) {
            progressFunction({
              upload_progress: percent,
              bytes_uploaded: progress.loaded,
              bytes_total: progress.total
            });
          }
        }
      }; // Create the upload URL


      var builtURL = '';
      builtURL += this.options.protocol + '://';
      builtURL += this.options.host;
      var addPort = true; // Don't add the port if the protocol matches the port

      if (this.options.protocol === 'http' && this.options.port === 80) {
        addPort = false;
      }

      if (this.options.protocol === 'https' && this.options.port === 443) {
        addPort = false;
      }

      if (addPort) {
        builtURL += ':' + this.options.port;
      } // Set the upload to use the URL


      this.uploadXmlhttprequest.open('POST', builtURL + '/api/v0/add?json=true'); // We are expecting a JSON response

      this.uploadXmlhttprequest.setRequestHeader('accept', 'application/json');
      this.uploadXmlhttprequest.setRequestHeader('OIP-Auth', JSON.stringify(this.options.oip_auth)); // Set the encoding type since we are going to be sending FormData

      this.uploadXmlhttprequest.enctype = 'multipart/form-data'; // Create a Form to send to the server

      var form = new FormData(); // eslint-disable-line

      form.append('path', this.file, this.file.name); // Start the upload

      this.uploadXmlhttprequest.send(form);
    });
  }

}

module.exports = IpfsXml;