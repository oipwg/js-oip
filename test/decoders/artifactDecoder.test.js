import axios from 'axios'
import { decodeArtifact } from '../../src/decoders'
import { Artifacts } from '../../src/modules/records'

let daemonUrl = 'http://snowflake.oip.fun:1606' // ToDo: switch to snowflake for travis
let api = new axios.create({
  baseURL: daemonUrl,
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
})

describe('Decoders', () => {
  describe('Artifact Decoder', () => {
    it('decode alexandria-media artifact', async () => {
      let txid = '32dd84b5d756801b8050c7e2757c06cf73f1e5544e7c25afb0ef87e6ddbfba57'
      let res = (await api.get(`artifact/get/${txid}`)).data
      let [json] = res.results
      expect(json).toHaveProperty('artifact')
      expect(json).toHaveProperty('meta')
      let artifact = decodeArtifact(json)
      expect(artifact).toBeInstanceOf(Artifacts.Artifact)
      expect(artifact.getVersion()).toEqual('alexandria-media')
    })
    it('decode 041 artifact', async () => {
      let txid = 'a690609a2a8198fbf4ed3fd7e4987637a93b7e1cad96a5aeac2197b7a7bf8fb9'
      let res = (await api.get(`/artifact/get/${txid}`)).data
      let [json] = res.results
      expect(json).toHaveProperty('artifact')
      expect(json).toHaveProperty('meta')
      let artifact = decodeArtifact(json)
      expect(artifact).toBeInstanceOf(Artifacts.Artifact)
      expect(artifact.getVersion()).toEqual('oip041')
    })
    it('decode 042 artifact', async () => {
      let txid = '876a8ca134620909c2afe2d7a423525977ed0056da01e3b8adbf3d80c332787f'
      let res = (await api.get(`/artifact/get/${txid}`)).data
      let [json] = res.results
      expect(json).toHaveProperty('artifact')
      expect(json).toHaveProperty('meta')
      let artifact = decodeArtifact(json)
      expect(artifact).toBeInstanceOf(Artifacts.Artifact)
      expect(artifact.getVersion()).toEqual('oip042')
    })
    it('decode research tomogram artifact', async () => {
      let txid = 'cc9a11050acdc4401aec3f40c4cce123d99c0f2c27d4403ae4a2536ee38a4716'
      let res = (await api.get(`/artifact/get/${txid}`)).data
      let [json] = res.results
      expect(json).toHaveProperty('artifact')
      expect(json).toHaveProperty('meta')
      let artifact = decodeArtifact(json)
      expect(artifact).toBeInstanceOf(Artifacts.ResearchTomogram)
      expect(artifact.getType().toLowerCase()).toEqual('research')
      expect(artifact.getSubtype().toLowerCase()).toEqual('tomogram')
    })
    it('decode property party artifact', async () => {}) // on testnet
    it('decode property spacial unit artifact', async () => {}) // on testnet
    it('decode property tenure artifact', async () => {}) // on testnet
    it('decode invalid artifact', () => {
      let json = { name: 'junk', title: 'fake artifact' }
      let artifact = decodeArtifact(json)
      expect(artifact).toBeInstanceOf(Artifacts.Artifact)
      expect(artifact.isValid().success).toBeFalsy()
    })
  })
})
