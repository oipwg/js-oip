import { OIP } from '../../../../src'

const wif = 'cRVa9rNx5N1YKBw8PhavegJPFCiYCfC4n8cYmdc3X1Y6TyFZGG4B'

describe(`OIP`, () => {
  describe('Initialization', () => {
    it(`Should construct successfully with valid WIF`, () => {
      let pub = new OIP(wif, 'testnet')
      expect(pub.options.publicAddress).toBe('ofbB67gqjgaYi45u8Qk2U3hGoCmyZcgbN4')
    })
  })
})
