import { sign } from 'bitcoinjs-message'
import { ECPair, payments } from 'bitcoinjs-lib'
import { floTestnet } from '../../../../src/config/networks'
import MPSingle from '../../../../src/modules/multipart/mpsingle'

describe('MPSingle', () => {
  describe('Construction', () => {
    it('Builds an empty MPS', () => {
      let mps = new MPSingle()
      expect(mps).toBeDefined()
      expect(mps).toBeInstanceOf(MPSingle)
      expect(mps.isValid().success).toBeFalsy()
    })
  })
  describe('fromInput', () => {
    it('from JSON', async () => {
      let mpo = {
        'reference': '8c204c5f39',
        'address': 'FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k',
        'data': '":"Single Track","duration":268},{"fname":"miltjordan-vanishingbreed.jpg","fsize":40451,"type":"Image","subtype":"album-art"},{"fname":"miltjordan-angelsgettheblues.jpg","fsize":54648,"type":"Image","subtype":"cover"}],"location":"QmWmth4ES4ZH9Wgz6Z7S7dRFF8MzJVGgDhit5KzH5uCvZz"},"payment":{"fiat":"USD","scale":"1000:1","maxdisc":30,"promoter":15,"retailer":15,"sugTip"',
        'max': 6,
        'signature': 'H9dqFw5Pd//qwHeEQA+ENifGvvs/0X1sLUXLQKj2L5qdI/BIJMBX2w3TKETHeNg3MMhA1i3PYVT2FnC8y/BxvUM=',
        'meta': {
          'stale': true,
          'block_hash': '455e5d41a5b9b90bd907d6828dbdcb721d82bdc2738ae8b4a5a54bb3869b02cd',
          'txid': '1d6392c44629a1fc3eafab4b564a003084e9afad055b5cbdb8fc8c1d3f042d1d',
          'block': 2950932,
          'time': 1536431891,
          'complete': false
        },
        'part': 4
      }
      let mps = new MPSingle(mpo)
      // console.log(mps)
      expect(mps.isValid().success).toBeTruthy()
      expect(mps.isStale()).toBeTruthy()
      expect(mps.isComplete()).toBeFalsy()
      expect(mps.getMeta()).toEqual({
        'stale': true,
        'block_hash': '455e5d41a5b9b90bd907d6828dbdcb721d82bdc2738ae8b4a5a54bb3869b02cd',
        'txid': '1d6392c44629a1fc3eafab4b564a003084e9afad055b5cbdb8fc8c1d3f042d1d',
        'block': 2950932,
        'time': 1536431891,
        'complete': false
      })
      expect(mps.getPart()).toEqual(4)
      expect(mps.getMax()).toEqual(6)
      expect(mps.getReference()).toEqual('8c204c5f39')
      expect(mps.getAddress()).toEqual('FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k')
      expect(mps.getSignature()).toEqual('H9dqFw5Pd//qwHeEQA+ENifGvvs/0X1sLUXLQKj2L5qdI/BIJMBX2w3TKETHeNg3MMhA1i3PYVT2FnC8y/BxvUM=')
      expect(mps.getData()).toEqual(
        '":"Single Track","duration":268},{"fname":"miltjordan-vanishingbreed.jpg","fsize":40451,"type":"Image","subtype":"album-art"},{"fname":"miltjordan-angelsgettheblues.jpg","fsize":54648,"type":"Image","subtype":"cover"}],"location":"QmWmth4ES4ZH9Wgz6Z7S7dRFF8MzJVGgDhit5KzH5uCvZz"},"payment":{"fiat":"USD","scale":"1000:1","maxdisc":30,"promoter":15,"retailer":15,"sugTip"'
      )
      expect(mps.getSignatureData()).toEqual(
        `4-6-FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k-8c204c5f39-${mps.getData()}`
      )
    })
  })
  describe('Signing', () => {
    it('Create and verify signature', async () => {
      let network = floTestnet.network
      let tmpECPair = ECPair.makeRandom({ network })

      let signMessage = async (message) => {
        let privateKeyBuffer = tmpECPair.privateKey

        let compressed = tmpECPair.compressed || true

        let signatureBuffer
        try {
          signatureBuffer = sign(message, privateKeyBuffer, compressed, tmpECPair.network.messagePrefix)
        } catch (e) {
          throw new Error(e)
        }

        let signature = signatureBuffer.toString('base64')

        return signature
      }

      let address = payments.p2pkh({ pubkey: tmpECPair.publicKey, network }).address
      let mps = new MPSingle({ part: 0, max: 1, reference: 'reference', address, data: 'data' })
      let { success, signature, error } = await mps.signSelf(signMessage)

      expect(success).toBeTruthy()
      expect(signature).toBeDefined()
      expect(error).toBeUndefined()

      expect(mps.hasValidSignature()).toBeTruthy()
    })
  })
  describe(`Getters & Setters`, () => {
    it('Get and Set Part [Number]', () => {
      let mps = new MPSingle()
      mps.setPart(0)
      expect(mps.getPart()).toEqual(0)
    })
    it('Get and Set Max [Part Number]', () => {
      let mps = new MPSingle()
      mps.setMax(1)
      expect(mps.getMax()).toEqual(1)
    })
    it('Get and Set Address', () => {
      let mps = new MPSingle()
      mps.setAddress('address')
      expect(mps.getAddress()).toEqual('address')
    })
    it('Get and Set Reference', () => {
      let mps = new MPSingle()
      mps.setReference('reference')
      expect(mps.getReference()).toEqual('reference')
    })
    it('Get and Set Signature', () => {
      let mps = new MPSingle()
      mps.setSignature('signature')
      expect(mps.getSignature()).toEqual('signature')
    })
    it('Get and Set Data', () => {
      let mps = new MPSingle()
      mps.setData('data')
      expect(mps.getData()).toEqual('data')
    })
    it('Get and Set Time', () => {
      let mps = new MPSingle()
      mps.setTime(1234)
      expect(mps.getTime()).toEqual(1234)
    })
    it('Get and Set TXID', () => {
      let mps = new MPSingle()
      mps.setTXID('txid')
      expect(mps.getTXID()).toEqual('txid')
    })
    it('Get and Set Block', () => {
      let mps = new MPSingle()
      mps.setBlock(1234)
      expect(mps.getBlock()).toEqual(1234)
    })
    it('Get and Set Block Hash', () => {
      let mps = new MPSingle()
      mps.setBlockHash('block_hash')
      expect(mps.getBlockHash()).toEqual('block_hash')
    })
    it('Get and Set Assembled', () => {
      let mps = new MPSingle()
      mps.setAssembled('assembled')
      expect(mps.getAssembled()).toEqual('assembled')
    })
    // it('Get and Set TX', () => {
    //  let mps = new MPSingle()
    //  mps.setTX({tx: 'tx'})
    //  expect(mps.getTX()).toEqual({tx: 'tx'})
    // })
    // it('Get _source', () => {
    //  let mps = new MPSingle()
    //  expect(mps._getSource()).toBeUndefined()
    // })
  })
})
