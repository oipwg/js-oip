import bitcoin from 'bitcoinjs-lib'
import {flo_testnet} from '../../../src/config'
import {isValidWIF} from '../../../src/util/btc'
import {OIP} from '../../../src'
import floTx from 'fcoin/lib/primitives/tx'
import Network from 'fcoin/lib/protocol/network'
import {artifactSmall, artifactLarge} from '../../../examples/exampleArtifact'
import Artifact from "../../../src/modules/records/artifact/artifact";

const network = flo_testnet.network

// const keypair = bitcoin.ECPair.makeRandom({network})
// const tmpWif = keypair.toWIF()
// console.log(isValidWIF(tmpWif, network))

if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
	if (typeof localStorage === "undefined") {
		//var is needed her for the javascript hoisting effect or else localstorage won't be scoped
		var LocalStorage = require('node-localstorage').LocalStorage;
		var localStorage = new LocalStorage('./localStorage');
	}
} else {
	localStorage = window.localStorage
}

const wif = 'cRVa9rNx5N1YKBw8PhavegJPFCiYCfC4n8cYmdc3X1Y6TyFZGG4B'
const ECPair = bitcoin.ECPair.fromWIF(wif, network)
// const p2pkh = bitcoin.payments.p2pkh({pubkey: ECPair.publicKey, network}).address

describe(`OIP`, () => {
	describe('Initialization', () => {
		it(`Should construct successfully with valid WIF`, () => {
			let pub = new OIP(wif, "testnet")
			expect(pub).toBeInstanceOf(OIP)
		})
		it(`Should construct unsuccessfully with an invalid WIF`, () => {
			let pub = new OIP(wif, "mainnet")
			expect(pub.success).toBeFalsy()
		})
	})
	describe('ECPair', () => {
		it('ECPair from WIF', () => {
			expect(isValidWIF(wif, network)).toBeTruthy()
			expect(ECPair.publicKey).toBeDefined()
			expect(ECPair.privateKey).toBeDefined()
			// console.log(typeof ECPair, ECPair.network)
		})
	})
	describe('Transaction Builder', () => {
		it('fetch UTXO | getUTXO', async () => {
			let oip = new OIP(wif, "testnet")
			let utxo = await oip.getUTXO()
			console.log(utxo)
			expect(utxo).toBeDefined()
			expect(Array.isArray(utxo)).toBeTruthy()
		})
		it(`build Inputs and Outputs | buildInputsAndOutputs`, async () => {
			let oip = new OIP(wif, "testnet")
			let {inputs, outputs, fee} = await oip.buildInputsAndOutputs("floData")
			expect(inputs).toBeDefined()
			expect(outputs).toBeDefined()
			expect(fee).toBeDefined()
		})
		it('build tx hex | buildTXHex', async () => {
			let op = new OIP(wif, "testnet")
			let hex = await op.buildTXHex("floData")
			let ftx = floTx.fromRaw(hex, 'hex')
			// console.log(ftx)
			// ToDo: Test signature validation
			expect(ftx.strFloData).toEqual("floData")
		})
	})
	describe('Publishing', () => {
		it('publish test artifact', async () => {
			let oip = new OIP(wif, "testnet")
			expect(artifactSmall).toBeInstanceOf(Artifact)
			let txid = await oip.publish(artifactSmall)
			expect(txid).toBeDefined()
			expect(typeof txid).toEqual('string')
			// console.log(txid)
		})
		it('publish multiparted artifact', async (done) => {
			// let str = '1d6392c44629a1fc3eafab4b564a003084e9afad055b5cbdb8fc8c1d3f042d1d,H9dqFw5Pd//qwHeEQA+ENifGvvs/0X1sLUXLQKj2L5qdI/BIJMBX2w3TKETHeNg3MMhA1i3PYVT2FnC8y/BxvUM=,FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k,'
			// console.log(str.length)
			let oip = new OIP(wif, "testnet")
			// oip.deleteHistory()
			expect(artifactLarge).toBeInstanceOf(Artifact)
			let txids = await oip.publish(artifactLarge)
			expect(txids).toBeDefined()
			expect(Array.isArray(txids)).toBeTruthy()
			// console.log('final return: ', txids)
			done()
		}, 250 * 100 * 100)
	})
	describe('Chain API', () => {
		it.skip('test insight api update time', async (done) => {
			let oip = new OIP(wif, 'testnet')

			for (let i = 0; i < 5; i++) {
				let txid = await oip.sendToFloChain('11:22')
				console.log(txid)
				let start = Date.now(), finish;
				// console.log(utxo)
				const slam = async () => {
					// console.log('slam')
					let utxo
					try {
						utxo = await oip.getUTXO()

					} catch(err) {console.log('err', err)}
					for (let u of utxo) {
						if (u.txid === txid) {
							finish = Date.now()
						}
					}
				}
				while (!finish) {
					await slam()
				}
				console.log(finish - start)
			}
			done()
		}, 250 * 100 * 100)
		it('build and broadcast TX hex | sendToFloChain', async () => {
			let pub = new OIP(wif, "testnet")
			let txid = await pub.sendToFloChain(`RC`)
			expect(typeof txid === 'string').toBeTruthy()
			// console.log(txid)
		})
		it('Create and Send a FLO TX', async () => {
			let pub = new OIP(wif,  "testnet")
			let output = {
				address: "oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S",
				value: Math.floor(0.0001 * flo_testnet.satPerCoin)
			}
			let txid = await pub.createAndSendFloTx(output, "to testnet")
			// console.log(txid)
			expect(txid).toBeDefined()
			expect(typeof txid === 'string').toBeTruthy()
		})
	})
	describe('Spent Transactions', () => {
		it('add spent remove spent transaction from utxo', async () => {
			let oip = new OIP(wif, "testnet")
			let utxo = await oip.getUTXO()
			// console.log(utxo)
			let [firstUTXO] = utxo
			let txid = firstUTXO.txid
			oip.addSpentTransaction(txid)
			let filtedUtxos = oip.removeSpent(utxo)
			for (let tx of filtedUtxos) {
				expect(tx.txid).not.toEqual(txid)
			}
			let spentTx = oip.getSpentTransactions()[oip.getSpentTransactions().length-1]
			expect(txid).toEqual(spentTx)
		})
		it('loop through history', () => {
			let oip = new OIP(wif, "testnet")
			// console.log(oip.ECPair)
			// const p2pkh = bitcoin.payments.p2pkh({pubkey: ECPair.publicKey, network}).address
			// console.log(p2pkh)

			let unspents = []
			for (let txObj of oip.history) {
				let match = false
				for (let tx of oip.getSpentTransactions()) {
					for (let txid in txObj) {
						if (txid === tx) {
							match = true
						}
					}
				}
				if (!match) {
					unspents.push(txObj)
				}
			}

			for (let txObj of unspents) {
				let ftx;
				for (let tx in txObj) {
					ftx = floTx.fromRaw(txObj[tx], 'hex')
				}
				//grab output addresses from ftx and convert them to testnet addresses

				// console.log(ftx)
				// let [addr] = ftx.getOutputAddresses()
				// addr = addr.toBase58()
				// let addrBuffer = Buffer.from(addr,  'base58')
				// console.log(addrBuffer)
				// console.log(addr.toBase58(network))
			}
		})
	})
	describe('Local Storage', () => {
		it(`serialize and delete tx history `, () => {
			let oip = new OIP(wif, "testnet")
			oip.addSpentTransaction("0")
			oip.addSpentTransaction("1")
			oip.serialize()
			expect(localStorage).toBeDefined()
			expect(localStorage.getItem('tx_history')).toBeDefined()
			let ls = localStorage.getItem('tx_history')
			ls = JSON.parse(ls)
			expect(ls.spentTransactions).toBeDefined()
			expect(ls.history).toBeDefined()
			expect(Array.isArray(ls.spentTransactions)).toBeTruthy()
			expect(Array.isArray(ls.history)).toBeTruthy()
			expect(ls.spentTransactions[0]).toEqual('0')
			expect(ls.spentTransactions[1]).toEqual('1')
			oip.deleteHistory()
			expect(localStorage.getItem('tx_history')).toBeNull()
		})
		it('deserialize', () => {
			let oip = new OIP(wif, "testnet")
			oip.addSpentTransaction("0")
			oip.addSpentTransaction("1")
			oip.serialize()
			let oip2 = new OIP(wif, "testnet")
			expect(oip2.getSpentTransactions()).toEqual(["0", "1"])
			oip.deleteHistory()
			expect(localStorage.getItem('tx_history')).toBeNull()
		})
		it('save and get history', () => {
			let oip = new OIP(wif, "testnet")
			oip.save('tx', 'hex')
			let hist = localStorage.getItem('tx_history')
			expect(hist).toBeDefined()
			let pHist = JSON.parse(hist)
			expect(pHist.history).toEqual([{"tx": 'hex'}])
			oip.deleteHistory()
			expect(localStorage.getItem('tx_history')).toBeNull()
			expect(oip.getTxHistory()).toEqual({
				history: [{"tx": 'hex'}],
				spentTransactions: []
			})
		})
	})
})
