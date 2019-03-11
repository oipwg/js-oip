import MPSingle from '../../../../src/modules/multipart/mpsingle'
import Oipindex from '../../../../src/core/oipd-api/daemonApi'

const index = new Oipindex()

describe('MPSingle', () => {
  describe('fromInput', () => {
    it('from the DaemonApi', async () => {
      let mp = await index.getMultipart('1d6392c44629a1fc3eafab4b564a003084e9afad055b5cbdb8fc8c1d3f042d1d')
      expect(mp.success).toBeTruthy()
      let mps = new MPSingle(mp.multipart)
      expect(mps.isValid().success).toBeTruthy()
      expect(mps.getMeta()).toEqual({ complete: true,
        stale: false,
        time: 1536431891,
        txid: '1d6392c44629a1fc3eafab4b564a003084e9afad055b5cbdb8fc8c1d3f042d1d',
        block: 2950932,
        block_hash: '455e5d41a5b9b90bd907d6828dbdcb721d82bdc2738ae8b4a5a54bb3869b02cd',
        assembled: '{"oip-041":{"artifact":{"type":"Audio-Album","info":{"extraInfo":{"artist":"Milt Jordan","genre":"Country & Folk","company":"Vintage Heart Records"},"title":"Angels Get the Blues","year":2010,"description":"\\"Original Release Date: December 1, 2010\\\\n\\\\nTotal Length: 20:43\\\\nASIN: B005COCRBO\\\\n\\\\nCopyright: 2010 Milt Jordan\\""},"storage":{"network":"IPFS","files":[{"fname":"1 - Angels Get the Blues.aac","fsize":4861672,"dname":"Angels Get the Blues","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Album Track","duration":306},{"fname":"2 - How I Want My Heaven.aac","fsize":3241607,"dname":"How I Want My Heaven","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Album Track","duration":204},{"fname":"3 - Honey Gives Me Money.aac","fsize":3169998,"dname":"Honey Gives Me Money","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Album Track","duration":199},{"fname":"4 - Never Saw It Coming.aac","fsize":2580019,"dname":"Never Saw It Coming","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Album Track","duration":162},{"fname":"5 - Ride With Joe.aac","fsize":3490473,"dname":"Ride With Joe","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Album Track","duration":219},{"fname":"6 - Hot For You Baby.aac","fsize":2436918,"dname":"Hot For You Baby","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Album Track","duration":153},{"fname":"Vanishing Breed.aac","fsize":4261627,"dname":"Vanishing Breed","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Single Track","duration":268},{"fname":"miltjordan-vanishingbreed.jpg","fsize":40451,"type":"Image","subtype":"album-art"},{"fname":"miltjordan-angelsgettheblues.jpg","fsize":54648,"type":"Image","subtype":"cover"}],"location":"QmWmth4ES4ZH9Wgz6Z7S7dRFF8MzJVGgDhit5KzH5uCvZz"},"payment":{"fiat":"USD","scale":"1000:1","maxdisc":30,"promoter":15,"retailer":15,"sugTip":[],"addresses":[{"token":"BTC","address":"1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA"},{"token":"FLO","address":"FTogNNXik7eiHZw5uN2KMe4cvcr7GCEjbZ"},{"token":"LTC","address":"LUWPbpM43E2p7ZSh8cyTBEkvpHmr3cB8Ez"}]},"timestamp":1536429312,"publisher":"FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k"},"signature":"IGFvZmnnB7g2Q02zzzKwrgNelhUJv8D69J/HTa+IqHe3IWI/RaT3PLzKjfjeHWSjKC6PjF3EVKXAdibq+5DbYr4="}}',
        tx: undefined })
    })
  })
  describe(`To String`, () => {
    it('toString', async () => {
      let mp = await index.getMultipart('1d6392c44629a1fc3eafab4b564a003084e9afad055b5cbdb8fc8c1d3f042d1d')
      expect(mp.success).toBeTruthy()
      expect(mp.multipart).toBeInstanceOf(MPSingle)
      expect(mp.multipart.toString()).toEqual('oip-mp(4,6,FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k,8c204c5f39,H9dqFw5Pd//qwHeEQA+ENifGvvs/0X1sLUXLQKj2L5qdI/BIJMBX2w3TKETHeNg3MMhA1i3PYVT2FnC8y/BxvUM=):":"Single Track","duration":268},{"fname":"miltjordan-vanishingbreed.jpg","fsize":40451,"type":"Image","subtype":"album-art"},{"fname":"miltjordan-angelsgettheblues.jpg","fsize":54648,"type":"Image","subtype":"cover"}],"location":"QmWmth4ES4ZH9Wgz6Z7S7dRFF8MzJVGgDhit5KzH5uCvZz"},"payment":{"fiat":"USD","scale":"1000:1","maxdisc":30,"promoter":15,"retailer":15,"sugTip"')
      expect(mp.multipart.hasValidSignature()).toBeTruthy()
    })

    it('part 0 to string', async () => {
      let mp = await index.getMultipart('a690609a2a8198fbf4ed3fd7e4987637a93b7e1cad96a5aeac2197b7a7bf8fb9')
      let { success, multipart, error } = mp
      expect(success).toBeTruthy()
      expect(multipart).toBeInstanceOf(MPSingle)
      expect(error).toBeUndefined()
      expect(multipart.hasValidSignature()).toBeTruthy()
    })
  })
  describe(`Getters & Setters`, () => {
    it('Get Signature Data for a part 0', async () => {
      let multi = await index.getMultipart('d148b56799')
      multi = multi.multipart
      expect(multi.getSignatureData()).toEqual(
        '0-1-F95Q4zxMiafqyZDBaJRuLNyvGD7dCwjezX--{"oip-041":{"artifact":{"type":"Audio-Basic","info":{"extraInfo":{"genre":"Acoustic"},"title":"Visionen_von_Marie"},"storage":{"network":"IPFS","files":[{"fname":"Visionen_von_Marie.mp3","fsize":3771195,"type":"Audio","duration":187}],"location":"QmZCcTJJUG2Dp1uLsMhe9bSWZbWp5hCprfjfBtJiLU67bf"},"payment":{"fiat":"USD","scale":"1000:1","maxdisc":30,"promoter":15,"retai'
      )
    })
    it('Get Signature Data for a part > 0', async () => {
      let multi = await index.getMultipart('2b6036585a')
      multi = multi.multipart
      expect(multi.getSignatureData()).toEqual(
        '1-1-F95Q4zxMiafqyZDBaJRuLNyvGD7dCwjezX-d148b56799-ler":15,"sugTip":[],"addresses":[]},"timestamp":1532864918,"publisher":"F95Q4zxMiafqyZDBaJRuLNyvGD7dCwjezX"},"signature":"IK9mtLY+sugytM4URKiRyRxUVtkeZGT5JaVYSw3tqlhnboRJo1HFcEv6mQjbUmkjVZ8TOgOilaBPZD+Kyj2E1sM="}}')
    })
  })
})
