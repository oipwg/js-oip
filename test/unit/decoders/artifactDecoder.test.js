import { decodeArtifact } from '../../../src/decoders'
import { Artifacts } from '../../../src/modules/records'

describe('Decoders', () => {
  describe('Artifact Decoder', () => {
    it('decode alexandria-media artifact', async () => {})
    it('decode 041 artifact', async () => {})
    it('decode 042 artifact', async () => {})
    it('decode research tomogram artifact', async () => {})
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
