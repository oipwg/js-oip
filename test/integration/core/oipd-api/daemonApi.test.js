import { DaemonApi } from '../../../../src/core'
import { MPSingle } from '../../../../src/modules'
import { Artifact } from '../../../../src/modules/records/artifact'

let index = new DaemonApi()

const localhost = 'http://127.0.0.1:1606/oip'

describe('DaemonApi', () => {
  it('GET search index by query | searchArtifacts()', async () => {
    let q = 'ryan'
    let response = await index.searchArtifacts(q)
    // console.log(response)
    let { success, error, artifacts } = response
    expect(success).toBeTruthy()
    expect(error).toBeUndefined()
    expect(artifacts).toBeDefined()
    for (let art of artifacts) {
      expect(art.isValid().success).toBeTruthy()
    }
  })
  it('GET complex search by type and subtype | searchArtifactsByType()', async () => {
    let type = 'research'
    let subtype = 'tomogram'
    let { success, error, artifacts } = await index.searchArtifactsByType(type, subtype)
    expect(success).toBeTruthy()
    expect(error).toBeUndefined()
    expect(artifacts).toBeDefined()
    for (let art of artifacts) {
      expect(art.isValid().success).toBeTruthy()
    }
  })

  it('GET Artifact by TXID | getArtifact()', async () => {
    let txid = 'cc9a11050acdc4401aec3f40c4cce123d99c0f2c27d4403ae4a2536ee38a4716'
    let { success, error, artifact } = await index.getArtifact(txid)
    expect(success).toBeTruthy()
    expect(error).toBeUndefined()
    expect(artifact).toBeDefined()
    expect(artifact).toBeInstanceOf(Artifact)
  })
  it('GET multiple artifact by TXID | getArtifacts()', async () => {
    const txid1 = '6ffbffd475c7eabe0acc664087ac56c13ac7c2084746619182b360c2f19e430e'
    const txid2 = 'f72c314d257d8062581788ab56bbe4ab1dc09dafb7961866903d1144575a3b48'
    const txid3 = '0be3e260a9ff71464383e328d05d9e85984dd6636626bc0356eae8440de150aa'
    let txArray = [txid1, txid2, txid3]
    let { success, error, artifacts } = await index.getArtifacts(txArray)
    expect(success).toBeTruthy()
    expect(error).toBeUndefined()
    expect(artifacts).toBeDefined()
    expect(artifacts.length).toEqual(txArray.length)
    for (let art of artifacts) {
      expect(art).toBeInstanceOf(Artifact)
    }
  })
  it('GET latest artifact | getLatestArtifacts()', async () => {
    const limit = 50
    let { success, artifacts, error } = await index.getLatestArtifacts(limit)
    expect(success).toBeTruthy()
    expect(error).toBeUndefined()
    expect(artifacts).toBeDefined()
    for (let art of artifacts) {
      expect(art).toBeInstanceOf(Artifact)
    }
  })
  it('GET latest OIP041 artifact | getLatest041Artifacts()', async () => {
    const limit = 50
    let { success, artifacts, error } = await index.getLatest041Artifacts(limit)
    expect(success).toBeTruthy()
    expect(error).toBeUndefined()
    expect(artifacts).toBeDefined()
    for (let art of artifacts) {
      expect(art.getVersion()).toEqual('oip041')
      expect(art).toBeInstanceOf(Artifact)
    }
  })
  it('GET an OIP041 Artifact by TXID | get041Artifact()', async () => {
    let txid = '8c204c5f39b67431c59c7703378b2cd3b746a64743e130de0f5cfb2118b5136b'
    let { success, artifact, error } = await index.get041Artifact(txid)
    expect(success).toBeTruthy()
    expect(error).toBeUndefined()
    expect(artifact).toBeDefined()
    expect(artifact.getVersion()).toEqual('oip041')
  })
  it('GET multiple OIP041 artifact by ID | get041Artifacts()', async () => {
    const txid1 = '8c204c5f39b67431c59c7703378b2cd3b746a64743e130de0f5cfb2118b5136b'
    const txid2 = 'a690609a2a8198fbf4ed3fd7e4987637a93b7e1cad96a5aeac2197b7a7bf8fb9'
    const txid3 = 'b4e6c9e86d14ca3565e57fed8b482d742a7a1cff0dd4cabfe9e3ea29efb3211c'
    let txArray = [txid1, txid2, txid3]
    let { success, artifacts, error } = await index.get041Artifacts(txArray)
    expect(success).toBeTruthy()
    expect(error).toBeUndefined()
    expect(artifacts).toBeDefined()
    for (let art of artifacts) {
      expect(art.getVersion()).toEqual('oip041')
      expect(art).toBeInstanceOf(Artifact)
    }
  })
  it('GET latest OIP042 artifact | getLatest042Artifacts()', async () => {
    const limit = 50
    let { success, artifacts, error } = await index.getLatest042Artifacts(limit)
    expect(success).toBeTruthy()
    expect(error).toBeUndefined()
    expect(artifacts).toBeDefined()
    for (let art of artifacts) {
      expect(art).toBeInstanceOf(Artifact)
      expect(art.getVersion()).toEqual('oip042')
    }
  })
  it('GET latest Alexandria Media artifacts | getLatestAlexandriaMediaArtifacts()', async () => {
    const limit = 50
    let { success, artifacts, error } = await index.getLatestAlexandriaMediaArtifacts(limit)
    expect(success).toBeTruthy()
    expect(error).toBeUndefined()
    expect(artifacts).toBeDefined()
    for (let art of artifacts) {
      expect(art).toBeInstanceOf(Artifact)
      expect(art.getVersion()).toEqual('alexandria-media')
    }
  })
  it('GET an Alexandria Media Artifact by TXID | getAlexandriaMediaArtifact()', async () => {
    let txid = '756f9199c8992cd42c750cbd73d1fa717b31feafc3b4ab5871feadae9848acac'
    let { success, artifact, error } = await index.getAlexandriaMediaArtifact(txid)
    expect(success).toBeTruthy()
    expect(error).toBeUndefined()
    expect(artifact).toBeDefined()
    expect(artifact.getVersion()).toEqual('alexandria-media')
  })
  it('GET multiple Alexandria Media artifact by ID | getAlexandriaMediaArtifacts()', async () => {
    const txid1 = '33e04cb2dcf7004a460d0719eea36129ebaf48fb10cffff19653bfeeca9bc7ad'
    const txid2 = 'a2110a1058b620d91bc78ad71e466d736f6b8b078025d19c23ddac6a3c0355ee'
    const txid3 = 'b6f89f3c6410276f7d4cf9c3c58c4f0577495650e742e71dddc669c9e912217c'
    let txArray = [txid1, txid2, txid3]
    let { success, artifacts, error } = await index.getAlexandriaMediaArtifacts(txArray)
    expect(success).toBeTruthy()
    expect(error).toBeUndefined()
    expect(artifacts).toBeDefined()
    for (let art of artifacts) {
      expect(art).toBeInstanceOf(Artifact)
      expect(art.getVersion()).toEqual('alexandria-media')
    }
  })
  it('GET search floData by query | searchFloData()', async () => {
    let q = 'ryan'
    let { success, txs, error } = await index.searchFloData(q)
    // console.log(txs)
    expect(success).toBeTruthy()
    expect(txs).toBeDefined()
    expect(error).toBeUndefined()
  })
  it('GET search floData by query WITH LIMIT | searchFloData()', async () => {
    let q = 'ryan'
    let limit = 5
    let { txs, success, error } = await index.searchFloData(q, limit)
    expect(txs.length).toEqual(5)
    expect(success).toBeTruthy()
    expect(txs).toBeDefined()
    expect(error).toBeUndefined()
  })
  it('GET floData by txid', async () => {
    let txid = '83452d60230d3c2c69000c2a79da79fe60cdf63012f946ac46e6df3409fb1fa7'
    let { success, tx, error } = await index.getFloData(txid)
    expect(success).toBeTruthy()
    expect(tx).toBeDefined()
    expect(error).toBeUndefined()
  })
  it('GET Multipart via TXID', async () => {
    let txid = 'f550b9739e7453224075630d44cba24c31959af913aeb7cb364a563f96f54548'
    let { success, multipart, error } = await index.getMultipart(txid)
    expect(success).toBeTruthy()
    expect(multipart).toBeDefined()
    expect(multipart).toBeInstanceOf(MPSingle)
    expect(error).toBeUndefined()
  })
  it('GET Multiparts via Reference', async () => {
    let ref = '8c204c5f39'
    let { success, multiparts, error } = await index.getMultiparts(ref)
    expect(success).toBeTruthy()
    expect(multiparts).toBeDefined()
    expect(error).toBeUndefined()
    for (let mp of multiparts) {
      expect(mp instanceof MPSingle).toBeTruthy()
    }
  })
  it('GET Multiparts via Reference w/ Limit', async () => {
    let ref = '8c204c5f39'
    let limit = 3
    let { success, multiparts, error } = await index.getMultiparts(ref, limit)
    expect(success).toBeTruthy()
    expect(multiparts).toBeDefined()
    expect(error).toBeUndefined()
    expect(multiparts.length).toEqual(limit)
    for (let mp of multiparts) {
      expect(mp instanceof MPSingle).toBeTruthy()
    }
  })
  it(`GET historian data point by ID | getHistorianData`, async () => {
    let id = '83452d60230d3c2c69000c2a79da79fe60cdf63012f946ac46e6df3409fb1fa7'
    let { success, hdata, error } = await index.getHistorianData(id)
    expect(success).toBeTruthy()
    expect(hdata).toBeDefined()
    expect(error).toBeUndefined()
  })
  it(`GET latest historian data point | getLastestHistorianData`, async () => {
    let { success, hdata, error } = await index.getLastestHistorianData()
    expect(success).toBeTruthy()
    expect(hdata).toBeDefined()
    expect(error).toBeUndefined()
  })
  it('GET version', async () => {
    let d = new DaemonApi()
    let v = await d.getVersion()
    expect(v).toBeDefined()
  })
  it.skip('GET sync status', async () => {
    let d = new DaemonApi()
    let v = await d.getSyncStatus()
    // console.log(v)
    expect(v).toBeDefined()
  })
  it.skip('GET latest o5 records', async () => {
    let d = new DaemonApi(localhost)
    const options = {
      limit: 1
    }
    const response = await d.getLatestOip5Records(options)
    const { success, payload, error } = response
    expect(error).toBeUndefined()
    expect(success).toBeTruthy()
    expect(payload.results).toBeDefined()
  })
  it.skip('GET o5 record', async () => {
    let d = new DaemonApi(localhost)
    const txid = '66d635a9858dec440fb0ed2e249d1566479c4a09265b712c8da3563fe8c6326b'
    const response = await d.getOip5Record(txid)
    const { success, payload, error } = response
    expect(error).toBeUndefined()
    expect(success).toBeTruthy()
    expect(payload.results).toBeDefined()
  })
  it.skip('GET latest o5 templates', async () => {
    let d = new DaemonApi(localhost)
    const options = {
      limit: 3
    }
    const response = await d.getLatestOip5Templates(options)
    const { success, payload, error } = response
    expect(error).toBeUndefined()
    expect(success).toBeTruthy()
    expect(payload.results).toBeDefined()
  })
  it.skip('GET o5 template', async () => {
    let d = new DaemonApi(localhost)
    const txid = 'dc6ca90cfd3f92b421509db714d039e556386b3ec2b16bec49de743534ccc320'
    const response = await d.getOip5Template(txid)
    const { success, payload, error } = response
    expect(error).toBeUndefined()
    expect(success).toBeTruthy()
    expect(payload.results).toBeDefined()
  })
  it.skip('GET o5 mapping', async () => {
    let d = new DaemonApi(localhost)
    const tmplIdents = [
      'tmpl_000000000000F113',
      'tmpl_00000000000BA51C',
      'tmpl_8D66C6AFF9BDD8EE'
    ]
    const response = await d.getOip5Mapping(tmplIdents)
    const { success, payload, error } = response
    expect(error).toBeUndefined()
    expect(success).toBeTruthy()
    expect(payload).toBeDefined()
  })
  it.skip('GET multiple oip5 records', async () => {
    let d = new DaemonApi(localhost)
    const txids = [
      '66d635a9858dec440fb0ed2e249d1566479c4a09265b712c8da3563fe8c6326b',
      '403bdc7c76a7564da04621036fe36e856d7f1336220ef7e24f12e0b68caa457f'
    ]
    const response = await d.getOip5Records(txids)
    expect(Array.isArray(response)).toBeTruthy()
    for (let result of response) {
      expect(result.success).toBeTruthy()
      expect(result.payload.total).toEqual(1)
      expect(Array.isArray(result.payload.results)).toBeTruthy()
    }
  })
  it.skip('GET multiple oip5 templates', async () => {
    let d = new DaemonApi(localhost)
    const txids = [
      'dc6ca90cfd3f92b421509db714d039e556386b3ec2b16bec49de743534ccc320',
      'd5725a4b0b17f17117dd3e587af1d87a9211afe253c967dd37cf67e7acba333e'
    ]
    const response = await d.getOip5Templates(txids)
    expect(Array.isArray(response)).toBeTruthy()
    for (let result of response) {
      expect(result.success).toBeTruthy()
      expect(result.payload.total).toEqual(1)
      expect(Array.isArray(result.payload.results)).toBeTruthy()
    }
  })
  it.skip('GET search oip5 records', async () => {
    let d = new DaemonApi(localhost)
    const q = 'music'
    const response = await d.searchOip5Records({ q })
    expect(response.success).toBeTruthy()
    expect(response.payload.results.length).toBeGreaterThan(0)
    expect(response.payload.count).toBeGreaterThan(0)
    expect(response.payload.total).toBeGreaterThan(0)
    expect(response.payload.next).toBeDefined()
  })
  it.skip('GET search oip5 templates', async () => {
    let d = new DaemonApi(localhost)
    const q = 'Music'
    const response = await d.searchOip5Templates({ q })
    expect(response.success).toBeTruthy()
    expect(response.payload.results.length).toBeGreaterThan(0)
    expect(response.payload.count).toBeGreaterThan(0)
    expect(response.payload.total).toBeGreaterThan(0)
    expect(response.payload.next).toBeDefined()
  })
  it.skip('isVerifiedPublisher', async () => {
    let d = new DaemonApi(localhost)
    const signedByAddress = 'FEve6MXM44auHKbqeijfQdXtGgnYRkNG1S'
    let res = await d.isVerifiedPublisher(signedByAddress)
    let keys = Object.keys(res)
    expect(keys).toEqual(['twitter', 'gab'])
  })
})
