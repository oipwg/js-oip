import { floTestnet } from '../../../../src/config'
import { ExplorerWallet } from '../../../../src/modules/wallets'
import floTx from 'fcoin/lib/primitives/tx'

const wif = 'cRVa9rNx5N1YKBw8PhavegJPFCiYCfC4n8cYmdc3X1Y6TyFZGG4B'

describe(`ExplorerWallet`, () => {
  describe('Transaction Builder', () => {
    it('fetch UTXO | getUTXO', async () => {
      let wallet = new ExplorerWallet({ wif, network: 'testnet' })
      let utxo = await wallet.getUTXO()
      // console.log(utxo)
      expect(utxo).toBeDefined()
      expect(Array.isArray(utxo)).toBeTruthy()
    })
    it(`build Inputs and Outputs | buildInputsAndOutputs`, async () => {
      let wallet = new ExplorerWallet({ wif, network: 'testnet' })
      let { inputs, outputs, fee } = await wallet.buildInputsAndOutputs('floData')
      expect(inputs).toBeDefined()
      expect(outputs).toBeDefined()
      expect(fee).toBeDefined()
    })
    it('build tx hex | buildTXHex', async () => {
      let wallet = new ExplorerWallet({ wif, network: 'testnet' })
      let hex = await wallet.buildTXHex('floData')
      let ftx = floTx.fromRaw(hex, 'hex')
      // console.log(ftx)
      // ToDo: Test signature validation
      expect(ftx.strFloData).toEqual('floData')
    })
    // it.skip('test insight api update time', async (done) => {
    //  let wallet = new ExplorerWallet({ wif, network: "testnet" })
    //
    //  for (let i = 0; i < 5; i++) {
    //    let txid = await wallet.sendDataToChain('11:22')
    //    console.log(txid)
    //    let start = Date.now(), finish;
    //    // console.log(utxo)
    //    const slam = async () => {
    //      // console.log('slam')
    //      let utxo
    //      try {
    //        utxo = await wallet.getUTXO()
    //
    //      } catch(err) {console.log('err', err)}
    //      for (let u of utxo) {
    //        if (u.txid === txid) {
    //          finish = Date.now()
    //        }
    //      }
    //    }
    //    while (!finish) {
    //      await slam()
    //    }
    //    console.log(finish - start)
    //  }
    //  done()
    // }, 250 * 100 * 100)
    it.skip('build and broadcast TX hex | sendDataToChain', async () => {
      let wallet = new ExplorerWallet({ wif, network: 'testnet' })
      let txid = await wallet.sendDataToChain(`RC`)
      expect(typeof txid === 'string').toBeTruthy()
      // console.log(txid)
    })
    it.skip('flotx w custom output | sendTx', async () => {
      let wallet = new ExplorerWallet(wif, 'testnet')
      let output = {
        address: 'oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S',
        value: Math.floor(0.0001 * floTestnet.satPerCoin)
      }
      let txid = await wallet.sendTx(output, 'to testnet')
      // console.log(txid)
      expect(txid).toBeDefined()
      expect(typeof txid === 'string').toBeTruthy()
    })
    it('add and remove spent transaction from utxo', async () => {
      let wallet = new ExplorerWallet({ wif, network: 'testnet' })
      let utxo = await wallet.getUTXO()
      // console.log(utxo)
      let [firstUTXO] = utxo
      let txid = firstUTXO.txid
      wallet.addSpentTransaction(txid)
      let filtedUtxos = wallet.removeSpent(utxo)
      for (let tx of filtedUtxos) {
        expect(tx.txid).not.toEqual(txid)
      }
      let spentTx = wallet.getSpentTransactions()[wallet.getSpentTransactions().length - 1]
      expect(txid).toEqual(spentTx)
    })
  })
})
