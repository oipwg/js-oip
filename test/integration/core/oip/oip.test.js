import { OIP } from '../../../../src'
import { artifactSmall, artifactLarge } from '../../../../examples/exampleArtifact'
import Artifact from '../../../../src/modules/records/artifact/artifact'

const wif = 'cRVa9rNx5N1YKBw8PhavegJPFCiYCfC4n8cYmdc3X1Y6TyFZGG4B'

const rpcSettings = {
  port: 17313,
  host: '127.0.0.1',
  username: 'username',
  password: 'password'
}

describe(`OIP`, () => {
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
    it.skip('Publish EditRecord RPCWallet', async (done) => {
      let oip = new OIP(wif, 'testnet', { rpc: { ...rpcSettings }, oipdURL: 'http://35.188.207.8:1606' })

      // Grab the Record TXID
      let txid = '2b083d53facd09efd6d9f8a92f2806bf78912885f90e52c9518ac0c163abfefb'

      let editedRecord = new Artifact()
      editedRecord.setTXID(txid) // Set the txid to be able to perform an Edit!
      editedRecord.setType('Text')
      editedRecord.setTitle('js-oip Post-Edit Title')

      let { success, txids, record, editRecord } = await oip.edit(editedRecord)
      console.log(txids)

      expect(success).toBe(true)
      expect(record).toBeDefined()
      expect(record.getEditVersion()).toBe(txids[0])
      expect(editRecord).toBeDefined()
      expect(editRecord.getTXID()).toBe(txids[0])
      expect(editRecord.getTimestamp()).toBeDefined()

      expect(txids).toBeDefined()
      expect(Array.isArray(txids)).toBeTruthy()
      expect(txids.length).toEqual(1)

      done()
    }, 10 * 60 * 1000)
    it('Filler test', () => { expect(true).toBe(true) })
  })
})
