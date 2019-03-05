import { OIP } from '../../../src'
import { artifactSmall, artifactLarge } from '../../../examples/exampleArtifact'
import Artifact from '../../../src/modules/records/artifact/artifact'

// const keypair = bitcoin.ECPair.makeRandom({network})
// const tmpWif = keypair.toWIF()
// console.log(isValidWIF(tmpWif, network))

if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
  if (typeof localStorage === 'undefined') { // eslint-disable-line
    // var is needed her for the javascript hoisting effect or else localstorage won't be scoped
    var LocalStorage = require('node-localstorage').LocalStorage
    var localStorage = new LocalStorage('./localStorage')
  }
} else {
  localStorage = window.localStorage
}

const wif = 'cRVa9rNx5N1YKBw8PhavegJPFCiYCfC4n8cYmdc3X1Y6TyFZGG4B'

const rpcSettings = {
  port: 17313,
  host: '127.0.0.1',
  username: 'username',
  password: 'password'
}

describe(`OIP`, () => {
  describe('Initialization', () => {
    it(`Should construct successfully with valid WIF`, () => {
      let pub = new OIP(wif, 'testnet')
      expect(pub.options.publicAddress).toBe('ofbB67gqjgaYi45u8Qk2U3hGoCmyZcgbN4')
    })
  })
  describe('Publishing', () => {
    it.skip('publish test artifact ExplorerWallet', async () => {
      let oip = new OIP(wif, 'testnet')
      expect(artifactSmall).toBeInstanceOf(Artifact)
      let txids = await oip.publish(artifactSmall)
      expect(txids).toBeDefined()
      expect(typeof txids[0]).toEqual('string')
    })
    it.skip('publish test artifact RPCWallet', async () => {
      let oip = new OIP(wif, 'testnet', { rpc: { ...rpcSettings } })
      expect(artifactSmall).toBeInstanceOf(Artifact)
      let txids = await oip.publish(artifactSmall)
      console.log(txids)
      expect(txids).toBeDefined()
      expect(typeof txids[0]).toEqual('string')
    })
    it.skip('publish test multipart ExplorerWallet', async (done) => {
      let oip = new OIP(wif, 'testnet')
      // oip.deleteHistory()
      expect(artifactLarge).toBeInstanceOf(Artifact)
      let txids = await oip.publish(artifactLarge)
      expect(txids).toBeDefined()
      expect(Array.isArray(txids)).toBeTruthy()
      expect(txids.length).toEqual(8)
      // console.log('final return: ', txids)
      done()
    })
    it.skip('publish test multipart RPCWallet', async (done) => {
      let oip = new OIP(wif, 'testnet', { rpc: { ...rpcSettings } })
      // oip.deleteHistory()
      expect(artifactLarge).toBeInstanceOf(Artifact)
      let txids = await oip.publish(artifactLarge)
      expect(txids).toBeDefined()
      expect(Array.isArray(txids)).toBeTruthy()
      expect(txids.length).toEqual(8)
      // console.log('final return: ', txids)
      done()
    })
  })
})
