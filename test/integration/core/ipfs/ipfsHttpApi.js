import fs from 'fs'
import IpfsHttpApi from '../../../../src/core/ipfs/ipfsHttpApi'

let godImgPath = '/home/orpheus/Pictures/Wallpapers/4rdYuG.jpg'
let godImgStats = fs.statSync(godImgPath)
let godImgSize = godImgStats.size
let godImgStream = fs.createReadStream(godImgPath)
let options = {
  filename: 'creator.mp4',
  filesize: godImgSize,
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
  let api = new IpfsHttpApi(godImgStream, options)
  let response = await api.start()
  console.log(response)
}

test()
