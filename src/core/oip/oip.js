import bitcoin from 'bitcoinjs-lib'
import coinselect from 'coinselect'
import {isValidWIF, ErrorX} from '../../util'
import {MultipartX} from '../../modules'
import {flo_mainnet, flo_testnet} from '../../config'

if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
	if (typeof localStorage === "undefined") {
		//var is needed her for the javascript hoisting effect or else localstorage won't be scoped
		var LocalStorage = require('node-localstorage').LocalStorage;
		var localStorage = new LocalStorage('./localStorage');
	}
} else {
	localStorage = window.localStorage
}

const FLODATA_MAX_LEN = 1040;

/**
 * @typedef {Object} utxo
 * @param {string} address - pay to public key hash (pub address)
 * @param {TXID} txid - transaction id
 * @param {number} vout - index of output in transaction
 * @param {string} scriptPubKey -  script which ensures that the script supplied in the redeeming transaction hashes to the script used to create the address
 * @param {number} amount - the amount spent
 * @param {number} satoshis - the amount spent in satoshis
 * @param {number} height - the block height of the transaction
 * @param {number} confirmations - number of blocks that have been confirmed after the transaction's block
 *
 * @example
 * {
 *     address: 'ofbB67gqjgaYi45u8Qk2U3hGoCmyZcgbN4',
 *     txid: '40bf49a02731b04b71951d2e7782b93bd30678c5f5608f0cfe9cdaed6d392903',
 *     vout: 1,
 *     scriptPubKey: '76a914f93aef4f4ef998b7ae44bd5bc8f6627b79cdc07588ac',
 *     amount: 659.9999325,
 *     satoshis: 65999993250,
 *     height: 295680,
 *     confirmations: 6933
 * }
 */

/**
 * Class to publish, register, edit, transfer, and deactivate OIP Records
 */
class OIP {
	/**
	 * ##### Example
	 * ```javascript
	 * import {OIP} from 'js-oip'
	 *
	 * let wif = "cRVa9rNx5N1YKBw8PhavegJPFCiYCfC4n8cYmdc3X1Y6TyFZGG4B"
	 * let oip = new OIP(wif, "testnet")
	 * ```
	 * @param {string} wif - private key in Wallet Import Format (WIF)
	 * @param {string} [network="mainnet"] - Use "testnet" for testnet
	 */
	//ToDo:: Switch to mainnet for prod
	constructor(wif, network = "testnet") {
		if (network === "testnet")
			network = flo_testnet
		else network = flo_mainnet

		if (!isValidWIF(wif, network.network)) {
			return {success: false, message: "Invalid WIF", wif, network: network.network}
		}

		this.coin = network
		this.network = network.network
		this.explorer = network.explorer
		this.ECPair = bitcoin.ECPair.fromWIF(wif, this.network)
		this.p2pkh = bitcoin.payments.p2pkh({pubkey: this.ECPair.publicKey, network: this.network}).address
		this.spentTransactions = []
		this.history = []

		this.deserialize()
	}


	/**
	 * Publish OIP Records
	 * @param {OIPRecord} record - an Artifact, Publisher, Platform, Retailer, or Influencer
	 * @return {Promise<string|Array<string>>} txid - a txid or an array of txids (if your record is too large to fit onto one tx)
	 */
	async publish(record) {
		if (!(record instanceof OIPRecord)) {
			throw new Error(`Record must be an instanceof OIPRecord`)
		}
		//if not signed, then sign
		if (!record.getSignature() || record.getSignature() === "") {
			const ECPair = bitcoin.ECPair.fromWIF(wif, this.network)
			record.signSelf(ECPair)
		}
		const methodType = 'publish'
		let broadcast_string = record.serialize(methodType)

		if (broadcast_string.length > FLODATA_MAX_LEN) {
			let txids
			try {
				txids = await this.publishMultiparts(broadcast_string)
			} catch (err) {
				throw new Error(`Failed to publish multiparts: ${err}`)
			}
			return txids
		} else {
			let txid
			try {
				txid = await this.sendToFloChain(broadcast_string)
			} catch (err) {
				throw new Error(`Failed to broadcast message: ${err}`)
			}
			return txid
		}
	}

	// async register(record) {
	// } //ToDo
	// async edit(record) {
	// } //ToDo
	// async transfer(record) {
	// } //ToDO
	// async deactivate(record) {
	// } //ToDo

	/**
	 * Send string data to the FLO Chain in a FLO tx
	 * @param {string} data - String data. Must be below or equal to 1040 characters
	 * @return {Promise<string>} txid - Returns the id of the transaction that contains the published data
	 */
	async sendToFloChain(data) {
		if (typeof data !== 'string') {
			throw new Error(`Data must be of type string. Got: ${typeof data}`)
		}
		if (data.length > 1040) {
			return `Error: data length exceeds 1040 characters. Try using OIPPublisher.publish(data) instead.`
		}
		let hex
		try {
			hex = await this.buildTXHex(data)
		} catch (err) {
			throw new Error(`Error building TX Hex: ${err}`)
		}
		let txid
		try {
			txid = await this.broadcastRawHex(hex)
		} catch (err) {
			throw new Error(`Error broadcasting TX Hex: ${err}`)
		}

		// Add txid to spentTransactions for each spent input
		for (let inp of this.selected.inputs) {
			if (this.p2pkh === inp.address) {
				this.addSpentTransaction(inp.txId)
			}
		}

		this.save(txid, hex)

		return txid
	}

	/**
	 * Publish data that exceeds the maximum floData length in multiple parts
	 * @param {string} data - The data you wish to publish
	 * @return {Promise<Array.<String>>} txids - An array of transaction IDs
	 */
	async publishMultiparts(data) {
		if (typeof data !== 'string') {
			throw new Error(`Data must be of type string. Got: ${typeof data}`)
		}
		let mpx = new MultipartX(data)
		let mps = mpx.getMultiparts()

		let txids = []

		for (let mp of mps) {
			if (txids.length > 0) {
				//set reference, addr, and sign
				mp.setReference(txids[0])
				mp.setAddress(this.p2pkh)
				let {success, signature, error} = mp.signSelf(this.ECPair)
				if (success) {
					mp.setSignature(signature)
				} else {
					throw new Error(error)
				}
			}
			if (!mp.isValid().success)
				throw new Error(`Invalid multipart: ${mp.isValid().message}`)

			let txid
			try {
				txid = await this.sendToFloChain(mp.toString())
			} catch (err) {
				throw new Error(`Failed to broadcast multipart: ${err}`)
			}
			txids.push(txid)
		}
		return txids
	}

	/**
	 * Build a valid FLO Raw TX Hex containing floData
	 * @param {String} [floData=""] - String data to send with tx. Defaults to an empty string
	 * @param {Object} [output] - custom output object
	 * @return {Promise<string>} hex - Returns raw transaction hex
	 * @example
	 * //if no output is designed, it will send 0.0001 * 1e8 FLO to yourself
	 * let output = {
	 *     address: "ofbB67gqjgaYi45u8Qk2U3hGoCmyZcgbN4",
	 *     value: 1e8 //satoshis
	 * }
	 * let op = new OIP(wif, "testnet")
	 * let hex = await op.buildTXHex("floData", output)
	 */
	async buildTXHex(floData = "", output) {
		let selected
		try {
			selected = await this.buildInputsAndOutputs(floData, output)
		} catch (err) {
			throw new Error(`Failed to build inputs and outputs: ${err}`)
		}

		this.selected = selected
		// console.log('selected: ', selected)
		let {inputs, outputs, fee} = selected

		// inputs and outputs will be undefined if no solution was found
		if (!inputs || !outputs) {
			throw new Error("No Inputs or Outputs selected! Fail!")
		}

		let txb = new bitcoin.TransactionBuilder(this.network)

		txb.setVersion(this.coin.txVersion) //1: w/o floData, 2: w/ floData

		inputs.forEach(input => txb.addInput(input.txId, input.vout))

		// Check if we are paying to ourself, if so, merge the outputs to just a single output.
		// Check if we have two outputs (i.e. pay to and change)
		if (outputs.length === 2) {
			// If the first input is sending to the from address, and there is a change output,
			// then merge the outputs.
			if (outputs[0].address === this.p2pkh && !outputs[1].address) {
				let totalToSend = outputs[0].value + outputs[1].value
				outputs = [{
					address: this.p2pkh,
					value: totalToSend
				}]
			} else {
				//send the original amount to the first address and send the rest to yourself as change
				if (outputs[0].address !== this.p2pkh && !outputs[1].address) {
					outputs[1].address = this.p2pkh
				}
			}
		}

		outputs.forEach(output => {
			if (!output.address) {
				throw new Error(`Missing output address: ${outputs}`)
			}
			txb.addOutput(output.address, output.value)
		})

		let extraBytes = this.coin.getExtraBytes({floData})

		for (let i in inputs) {
			if (this.p2pkh !== inputs[i].address) throw new Error(`Invalid inputs. Addresses don't match: ${inputs} & ${this.p2pkh}`)
			this.coin.sign(txb, extraBytes, parseInt(i), this.ECPair)
		}

		let builtHex

		try {
			builtHex = txb.build().toHex();
		} catch (e) {
			throw new Error("Unable to build Transaction Hex! \n" + e)
		}

		builtHex += extraBytes

		return builtHex
	}

	/**
	 * Builds the inputs and outputs to form a valid transaction hex for the FLO Chain
	 * @param {string} [floData=""] - defaults to an empty string
	 * @param {Object} [output] - custom output object
	 * @return {Promise<Object>} Returns the selected inputs, outputs, and fee to use for the transaction hex
	 * @example
	 * //basic
	 * let oip = new OIP(wif, "testnet")
	 * let selected = await oip.buildInputsAndOutputs("floData") //returns selected inputs, outputs, and fee
	 * @example
	 * //with custom output and object destructuring
	 * let oip = new OIP(wif, "testnet")
	 * let output = {
	 *     address: "ofbB67gqjgaYi45u8Qk2U3hGoCmyZcgbN4",
	 *     value: 1e8 //in satoshis
	 * }
	 * let {inputs, outputs, fee} = await oip.buildInputsAndOutputs("floData", output)
	 */
	async buildInputsAndOutputs(floData = "", output) {
		let utxo
		try {
			utxo = await this.getUTXO()
		} catch (err) {
			throw new ErrorX(`Failed to get utxos`, err)
		}

		//hit the insight api repeatedly for max 10 sec and try to get the updated response
		if (utxo.length === 0) {
			let start = Date.now(), finish = 0
			while (utxo.length === 0 && finish < 10000) {
				// console.log('while', finish)
				const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
				await delay(500)
				try {
					utxo = await this.getUTXO()
				} catch (err) {
					throw new Error(`Failed to get utxo: ${err}`)
				}
				finish = Date.now() - start
			}
			if (utxo.length === 0) {
				throw new Error(`P2PKH: ${this.p2pkh} has no unspent transaction outputs`)
			}
		}

		let formattedUtxos = utxo.map(utxo => {
			return {
				address: utxo.address,
				txId: utxo.txid,
				vout: utxo.vout,
				scriptPubKey: utxo.scriptPubKey,
				value: utxo.satoshis,
				confirmations: utxo.confirmations
			}
		})

		output = output || {
			address: this.p2pkh,
			value: Math.floor(0.0001 * this.coin.satPerCoin)
		}

		let targets = [output]

		let extraBytes = this.coin.getExtraBytes({floData});
		let extraBytesLength = extraBytes.length

		// console.log(formattedUtxos)

		let utxosNoUnconfirmed = formattedUtxos.filter(utx => utx.confirmations > 0)

		// console.log(utxosNoUnconfirmed)

		let selected = coinselect(utxosNoUnconfirmed, targets, Math.ceil(this.coin.feePerByte), extraBytesLength)

		// Check if we are able to build inputs/outputs off only unconfirmed transactions with confirmations > 0
		if (!selected.inputs || selected.inputs.length === 0 || !selected.outputs || selected.outputs.length === 0 || !selected.fee) {
			selected = coinselect(formattedUtxos, targets, Math.ceil(this.coin.feePerByte), extraBytesLength)
		}

		return selected
	}

	/**
	 * Get Unspent Transaction Outputs for the given keypair
	 * @return {Promise<Array.<utxo>>}
	 * @example
	 * const wif = 'cRVa9rNx5N1YKBw8PhavegJPFCiYCfC4n8cYmdc3X1Y6TyFZGG4B'
	 * let oip = new OIP(wif, "testnet")
	 * let utxos = await oip.getUTXO()
	 * for (let tx of utxos) {
	 *     console.log(tx)
	 *     // [ { address: 'ofbB67gqjgaYi45u8Qk2U3hGoCmyZcgbN4',
	 *     //     txid: '40bf49a02731b04b71951d2e7782b93bd30678c5f5608f0cfe9cdaed6d392903',
	 *     //     vout: 1,
	 *     //     scriptPubKey: '76a914f93aef4f4ef998b7ae44bd5bc8f6627b79cdc07588ac',
	 *     //     amount: 659.9999325,
	 *     //     satoshis: 65999993250,
	 *     //     height: 295680,
	 *     //     confirmations: 5706
	 *     //  } ]
	 * }
	 */
	async getUTXO() {
		let utxo
		try {
			utxo = await this.explorer.getAddressUtxo(this.p2pkh)
		} catch (err) {
			throw new ErrorX(`Error fetching UTXOs`, err)
		}
		return this.removeSpent(utxo)
	}

	/**
	 * Removes already spent transactions (that are kept in local memory)
	 * @param {Array.<utxo>} unspentTransactions - An array of utxos
	 * @return {Array.<utxo>}
	 * @example
	 * //shouldn't ever have to write this. Use `OIP.getUTXO()` instead
	 * let oip = new OIP(wif, 'testnet')
	 * let utxo
	 * try {
	 *     utxo = await oip.explorer.getAddressUtxo(pubAddr)
	 * } catch (err) {
	 *     throw new Error(`${err}`)
	 * }
	 * return oip.removeSpent(utxo)
	 */
	removeSpent(unspentTransactions) {
		if (!unspentTransactions || !Array.isArray(unspentTransactions))
			return

		let unspent = [];

		for (let tx of unspentTransactions) {
			let spent = false
			for (let txid of this.getSpentTransactions()) {
				if (txid === tx.txid) {
					spent = true;
				}
			}

			if (!spent)
				unspent.push(tx);
		}

		return unspent;
	}

	/**
	 * Add a spent transaction to local memory
	 * @param {TXID} txid - transaction id
	 * @return {void}
	 * @example
	 * let oip = new OIP(wif,  "testnet")
	 * let output = {
	 *     address: "oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S",
	 *     value: Math.floor(0.001 * flo_testnet.satPerCoin)
	 * }
	 * let txid = await oip.createAndSendFloTx(output, "sending floData to testnet")
	 * oip.addSpentTransaction(txid)
	 * let spentTxs = oip.getSpentTransactions()
	 * spentTxs === [txid] //true
	 */
	addSpentTransaction(txid) {
		this.spentTransactions.push(txid);
	}

	/**
	 * Returns an array of spent transaction ids
	 * @return {Array.<TXID>}
	 * @example
	 * let oip = new OIP(wif, "testnet")
	 * oip.addSpentTransaction(txid)
	 * let txids = oip.getSpentTransactions()
	 * txids = [txid] //true
	 */
	getSpentTransactions() {
		return this.spentTransactions
	}

	/**
	 * Broadcast raw transaction hex to the FLO chain
	 * @param hex
	 * @return {Promise<string>} txid - Returns a transaction id
	 */
	async broadcastRawHex(hex) {
		let response
		try {
			response = await this.explorer.broadcastRawTransaction(hex)
		} catch (err) {
			throw new Error(`Failed to broadcast TX Hex: ${err}`)
		}
		let txid

		/** Handle { txid: "txid" } */
		if (response && typeof response.txid === "string")
			txid = response.txid

		/**
		 * Handle
		 * {
		 *    txid: {
		 *        result: '05d2dd88d69cc32717d315152bfb474b0b1b561ae9a477aae091714c4ab216ac',
		 *        error: null,
		 *        id: 47070
		 *     }
		 * }
		 */
		if (response && response.txid && response.txid.result) {
			txid = response.txid.result
		}

		/**
		 * Handle
		 * {
		 *     result: '05d2dd88d69cc32717d315152bfb474b0b1b561ae9a477aae091714c4ab216ac',
		 *     error: null,
		 *     id: 47070
		 * }
		 */
		if (response && response.result) {
			txid = response.result
		}

		return txid
	}

	async createAndSendFloTx(output, floData) {
		if (floData && typeof floData !== 'string') {
			throw new Error(`Data must be of type string. Got: ${typeof floData}`)
		}
		if (floData.length > 1040) {
			return `Error: data length exceeds 1040 characters.`
		}
		let hex
		try {
			hex = await this.buildTXHex(floData, output)
		} catch (err) {
			throw new Error(`Error building TX Hex: ${err}`)
		}
		let txid
		try {
			txid = await this.broadcastRawHex(hex)
		} catch (err) {
			throw new Error(`Error broadcasting TX Hex: ${err}`)
		}

		// Add txid to spentTransactions for each spent input
		for (let inp of this.selected.inputs) {
			if (this.p2pkh === inp.address) {
				this.addSpentTransaction(inp.txId)
			}
		}

		this.save(txid, hex)

		return txid
	}

	/**
	 * Saves a transaction to localStorage and memory
	 * @param {string} txid
	 * @param {string} hex
	 * @example
	 * let oip = new OIP(wif)
	 * oip.save(`${txid}`, `${hex}`)
	 */
	save(txid, hex) {
		let tmpObj = {}
		tmpObj[txid] = hex

		this.history.push(tmpObj)
		this.serialize()
	}

	/**
	 * Stores important local variables to localStorage such as spent transactions and publish history
	 * @example
	 * let oip = new OIP(wif)
	 * oip.serialize() //saves this.spentTransactions and this.history to localStorage memory
	 */
	serialize() {
		let serialized = {
			spentTransactions: this.spentTransactions,
			history: this.history
		}

		localStorage.setItem('tx_history', JSON.stringify(serialized))
	}

	/**
	 * Imports publisher history from localStorage
	 * @example
	 * let oip = new OIP(wif)
	 * oip.deserialize() //sets this.spentTransactions and this.history from localStorage memory variables
	 */
	deserialize() {
		let deserialized = JSON.parse(localStorage.getItem('tx_history'))
		if (!deserialized)
			deserialized = {}

		if (deserialized.spentTransactions) {
			this.spentTransactions = deserialized.spentTransactions
		}

		if (deserialized.history) {
			this.history = deserialized.history
		}
	}

	/**
	 * Returns tx history variables
	 * @example
	 * let oip = new OIP(wif)
	 * oip.getTxHistory()
	 * //returns
	 * // {
	 * //   history: this.history,
	 * //   spentTransactions: this.spentTransactions
	 * // }
	 * @return {{history: Array, spentTransactions: Array}}
	 */
	getTxHistory() {
		return {
			history: this.history,
			spentTransactions: this.spentTransactions
		}
	}

	/**
	 * Deletes the publisher history from localStorage
	 * @example
	 * let oip = new OIP(wif)
	 * oip.deleteHistory()
	 */
	deleteHistory() {
		localStorage.removeItem('tx_history')
	}

}

export default OIP