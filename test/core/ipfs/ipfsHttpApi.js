import fs from 'fs'
import IpfsHttpApi from '../../../src/core/ipfs/ipfsHttpApi'

let godImg_path = '/home/orpheus/Pictures/Wallpapers/4rdYuG.jpg'
let godImg_stats = fs.statSync(godImg_path)
let godImg_size = godImg_stats.size
let godImg_stream = fs.createReadStream(godImg_path)
let options = {
  filename: 'creator.mp4',
  filesize: godImg_size,
  host: 'ipfs-dev.alexandria.io',
  port: 443,
  protocol: 'https',
  oip_auth: {
    address: 'oNRs1nuR1vUAjWJwhMtxJPQoTFAm9MWz1G',
    message: '1534278675842{"oip042":{}}',
    signature: 'Hw2iuomv/fhYYoKX8bNroVXmOvbh/e9gqZjP+I9kZymHD72mqtDw1qjN6/Qh4nhTDOHI8mkxbWtsaLSTuCkSihU='
  }
}

async function test () {
  let api = new IpfsHttpApi(godImg_stream, options)
  let response = await api.start()
  console.log(response)
}

test()
