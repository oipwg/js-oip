import bitcoin from 'bitcoinjs-lib'
import {flo_testnet} from '../../../src/config'
import {isValidWIF} from '../../../src/util/btc'
import {OIP} from '../../../src'
import floTx from 'fcoin/lib/primitives/tx'
import testArtifact from '../../../examples/exampleArtifact'
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
		it('build and broadcast TX hex | publishData', async () => {
			let pub = new OIP(wif, "testnet")
			let txid = await pub.publishData(`RC`)
			expect(typeof txid === 'string').toBeTruthy()
			// console.log(txid)
		})
		it('publish test artifact', async () => {
			let oip = new OIP(wif, "testnet")
			expect(testArtifact).toBeInstanceOf(Artifact)
			let txid = await oip.publish(testArtifact)
			 console.log(txid)
		})
	})
	describe('Chain Functions', () => {
		it('Send a TX', async () => {
			let pub = new OIP(wif,  "testnet")
			let output = {
				address: "oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S",
				value: Math.floor(0.0001 * flo_testnet.satPerCoin)
			}
			let txid = await pub.sendTX(output, "to testnet")
			console.log(txid)
			expect(txid).toBeDefined()
			expect(typeof txid === 'string').toBeTruthy()
		})
	})
	describe('Spent Transactions', () => {
		it('add spent transaction and remove spent transaction from utxo', async () => {
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
