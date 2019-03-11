import MultipartX from '../../../../src/modules/multipart/multipartx'
import Oipindex from '../../../../src/core/oipd-api/daemonApi'
let index = new Oipindex()

describe('MultipartX', () => {
  it('from Index', async () => {
    let assembled = '{"oip-041":{"artifact":{"type":"Audio-Basic","info":{"extraInfo":{"genre":"Acoustic"},"title":"Visionen_von_Marie"},"storage":{"network":"IPFS","files":[{"fname":"Visionen_von_Marie.mp3","fsize":3771195,"type":"Audio","duration":187}],"location":"QmZCcTJJUG2Dp1uLsMhe9bSWZbWp5hCprfjfBtJiLU67bf"},"payment":{"fiat":"USD","scale":"1000:1","maxdisc":30,"promoter":15,"retailer":15,"sugTip":[],"addresses":[]},"timestamp":1532864918,"publisher":"F95Q4zxMiafqyZDBaJRuLNyvGD7dCwjezX"},"signature":"IK9mtLY+sugytM4URKiRyRxUVtkeZGT5JaVYSw3tqlhnboRJo1HFcEv6mQjbUmkjVZ8TOgOilaBPZD+Kyj2E1sM="}}'
    let ref = 'd148b56799'
    let results = await index.getMultiparts(ref)
    let mps = results.multiparts

    let mpx = new MultipartX(mps)
    expect(mpx.toString()).toEqual(assembled)
    expect(mpx.getMultiparts().length).toEqual(2)
    for (let mp of mpx.getMultiparts()) {
      expect(mp.isValid().success).toBeTruthy()
      // console.log(mp.toString().length)
    }
  })
})
