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
			// console.log(utxo)
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
		// it.skip('test insight api update time', async (done) => {
		// 	let oip = new OIP(wif, 'testnet')
		//
		// 	for (let i = 0; i < 5; i++) {
		// 		let txid = await oip.sendToFloChain('11:22')
		// 		console.log(txid)
		// 		let start = Date.now(), finish;
		// 		// console.log(utxo)
		// 		const slam = async () => {
		// 			// console.log('slam')
		// 			let utxo
		// 			try {
		// 				utxo = await oip.getUTXO()
		//
		// 			} catch(err) {console.log('err', err)}
		// 			for (let u of utxo) {
		// 				if (u.txid === txid) {
		// 					finish = Date.now()
		// 				}
		// 			}
		// 		}
		// 		while (!finish) {
		// 			await slam()
		// 		}
		// 		console.log(finish - start)
		// 	}
		// 	done()
		// }, 250 * 100 * 100)
		it('build and broadcast TX hex | sendToFloChain', async () => {
			let pub = new OIP(wif, "testnet")
			let txid = await pub.sendToFloChain(`RC`)
			expect(typeof txid === 'string').toBeTruthy()
			// console.log(txid)
		})
		it('flotx w custom output | sendTx', async () => {
			let pub = new OIP(wif,  "testnet")
			let output = {
				address: "oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S",
				value: Math.floor(0.0001 * flo_testnet.satPerCoin)
			}
			let txid = await pub.sendTx(output, "to testnet")
			// console.log(txid)
			expect(txid).toBeDefined()
			expect(typeof txid === 'string').toBeTruthy()
		})
		it('add and remove spent transaction from utxo', async () => {
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
		it('create manual utxos', () => {
			let oip = new OIP(wif, "testnet")
			let utxos = oip.createManualUtxos()
			expect(Array.isArray(utxos)).toBeTruthy();
			// console.log(utxos)
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
		it('publish test multipart', async (done) => {
			let oip = new OIP(wif, "testnet")
			// oip.deleteHistory()
			expect(artifactLarge).toBeInstanceOf(Artifact)
			let txids = await oip.publish(artifactLarge)
			expect(txids).toBeDefined()
			expect(Array.isArray(txids)).toBeTruthy()
			expect(txids.length).toEqual(8)
			// console.log('final return: ', txids)
			done()
		}, 250 * 100 * 100)
	})
	describe('Local Storage', () => {
		it(`serialize and delete tx history `, () => {
			let oip = new OIP(wif, "testnet")
			// oip.deleteHistory()
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
			expect(ls.spentTransactions[ls.spentTransactions.length-2]).toEqual('0')
			expect(ls.spentTransactions[ls.spentTransactions.length-1]).toEqual('1')
			let pop1 = oip.spentTransactions.pop()
			expect(pop1).toEqual("1")
			let pop0 = oip.spentTransactions.pop()
			expect(pop0).toEqual("0")
			oip.serialize()
		})
		it('deserialize', () => {
			let oip = new OIP(wif, "testnet")
			// oip.deleteHistory()
			oip.addSpentTransaction("0")
			oip.addSpentTransaction("1")
			oip.serialize()
			let oip2 = new OIP(wif, "testnet")
			let spents = oip2.getSpentTransactions()
			expect(spents[spents.length-2]).toEqual("0")
			expect(spents[spents.length-1]).toEqual("1")
			let one = oip2.spentTransactions.pop()
			expect(one).toEqual("1")
			let zero = oip2.spentTransactions.pop()
			expect(zero).toEqual("0")
			oip2.serialize()

		})
		it('save and get history', () => {
			let oip = new OIP(wif, "testnet")
			oip.save('tx', 'hex')
			let serialized = localStorage.getItem('tx_history')
			expect(serialized).toBeDefined()
			let serializedParsed = JSON.parse(serialized)
			expect(serializedParsed.history[serializedParsed.history.length-1]).toEqual({"tx": 'hex'})
			expect(oip.history[oip.history.length-1]).toEqual({"tx": 'hex'})
			let pop = oip.history.pop()
			expect(pop).toEqual({"tx": "hex"})
			oip.serialize()
		})
	})
})
