import MultipartX, { CHOP_MAX_LEN, FLODATA_MAX_LEN } from '../../../../src/modules/multipart/multipartx'
import { ExplorerWallet } from '../../../../src/modules/wallets'

const pair = {
  public: 'oV5qwoq9CSaXersHk4DQVHhoMTDjRNWRF2',
  private: 'cUeMZ4m4bNCnnbshaPjefvwJyN95dRJfhZRszTHcsm5hydtJFH5T'
}
const createTestWallet = () => {
  return new ExplorerWallet({
    network: 'testnet',
    wif: pair.private
  })
}

describe('MultipartX', () => {
  it(`from JSON string`, async () => {
    let assembled = '{"oip-041":{"artifact":{"type":"Audio-Album","info":{"extraInfo":{"artist":"Milt Jordan","genre":"Country & Folk","company":"Vintage Heart Records"},"title":"Angels Get the Blues","year":2010,"description":"\\"Original Release Date: December 1, 2010\\\\n\\\\nTotal Length: 20:43\\\\nASIN: B005COCRBO\\\\n\\\\nCopyright: 2010 Milt Jordan\\""},"storage":{"network":"IPFS","files":[{"fname":"1 - Angels Get the Blues.aac","fsize":4861672,"dname":"Angels Get the Blues","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Album Track","duration":306},{"fname":"2 - How I Want My Heaven.aac","fsize":3241607,"dname":"How I Want My Heaven","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Album Track","duration":204},{"fname":"3 - Honey Gives Me Money.aac","fsize":3169998,"dname":"Honey Gives Me Money","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Album Track","duration":199},{"fname":"4 - Never Saw It Coming.aac","fsize":2580019,"dname":"Never Saw It Coming","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Album Track","duration":162},{"fname":"5 - Ride With Joe.aac","fsize":3490473,"dname":"Ride With Joe","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Album Track","duration":219},{"fname":"6 - Hot For You Baby.aac","fsize":2436918,"dname":"Hot For You Baby","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Album Track","duration":153},{"fname":"Vanishing Breed.aac","fsize":4261627,"dname":"Vanishing Breed","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Single Track","duration":268},{"fname":"miltjordan-vanishingbreed.jpg","fsize":40451,"type":"Image","subtype":"album-art"},{"fname":"miltjordan-angelsgettheblues.jpg","fsize":54648,"type":"Image","subtype":"cover"}],"location":"QmWmth4ES4ZH9Wgz6Z7S7dRFF8MzJVGgDhit5KzH5uCvZz"},"payment":{"fiat":"USD","scale":"1000:1","maxdisc":30,"promoter":15,"retailer":15,"sugTip":[],"addresses":[{"token":"BTC","address":"1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA"},{"token":"FLO","address":"FTogNNXik7eiHZw5uN2KMe4cvcr7GCEjbZ"},{"token":"LTC","address":"LUWPbpM43E2p7ZSh8cyTBEkvpHmr3cB8Ez"}]},"timestamp":1536429312,"publisher":"FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k"},"signature":"IGFvZmnnB7g2Q02zzzKwrgNelhUJv8D69J/HTa+IqHe3IWI/RaT3PLzKjfjeHWSjKC6PjF3EVKXAdibq+5DbYr4="}}'
    let mpx = new MultipartX(assembled)
    // console.log(mpx)
    expect(mpx.getMultiparts().length).toEqual(3)
    expect(mpx.toString()).toEqual(assembled)
  })

  it(`handles parts in group larger than 10`, async () => {
    const groupSize = 11
    const arbitraryTxid = '6ffbffd475c7eabe0acc664087ac56c13ac7c2084746619182b360c2f19e430e'
    const assembled = new Array(CHOP_MAX_LEN * groupSize).join('a')
    const wallet = createTestWallet()

    let mpx = new MultipartX(assembled)
    let txid; let i = 0
    for (var multipart of mpx.multiparts) {
      if (txid) { multipart.setReference(txid) }

      multipart.setAddress(pair.public)
      await multipart.signSelf(wallet.signMessage.bind(wallet))

      txid = arbitraryTxid

      const result = multipart.toString()
      expect(result.length, `exceeded max FLODATA length on part ${i}: '${result}'`).toBeLessThanOrEqual(FLODATA_MAX_LEN)
      i++
    }

    expect(mpx.getMultiparts().length).toEqual(groupSize)
    expect(mpx.toString()).toEqual(assembled)
  })
})
