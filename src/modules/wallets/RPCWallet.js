import axios from 'axios'
import {sign} from "bitcoinjs-message"
import bitcoin from 'bitcoinjs-lib'

import { varIntBuffer } from '../../util'
import { FLODATA_MAX_LEN } from '../../core/oip/oip'
import {flo_mainnet, flo_testnet} from '../../config'
import Peer from '../flo/Peer'

// Helper const
const ONE_MB = 1000000
const ONE_SECOND = 1000
const ONE_MINUTE = 60 * ONE_SECOND

// 1 satoshis per byte (1000 satoshi per kb) (100 million satoshi in 1 FLO)
const TX_FEE_PER_BYTE = 0.00000001
// Average size of tx data (without floData) to calculate min txFee
const TX_AVG_BYTE_SIZE = 200
const SAT_PER_FLO = 100000000

// The minimum amount a utxo is allowed to be for us to use
const MIN_UTXO_AMOUNT = 0.0001

// Prevent chaining over ancestor limit
const MAX_MEMPOOL_ANCESTORS = 1250
const MAX_MEMPOOL_ANCESTOR_SIZE = 1.75 * ONE_MB

// Timer lengths used to track and fix the Ancestor chain
const UPDATE_ANCESTOR_STATUS = 1 * ONE_SECOND
const REPAIR_ANCESTORS_AFTER = 1 * ONE_MINUTE
const REPAIR_MIN_TX = 100

/**
 * Easily interact with an RPC Wallet to send Bulk transactions extremely quickly in series
 */
class RPCWallet {
	constructor(options){
		// Store options for later
		this.options = options || {}

		// Make sure we have connection to an RPC wallet
		if (!this.options.rpc)
			throw new Error("RPC options ('options.rpc') are required with an RPC wallet!")

		// Make sure we are being passed a public and private key pair
		if (!this.options.wif)
			throw new Error("`wif` (a Private Key) is a required option in order to use RPC Wallet!")
		if (!this.options.publicAddress)
			throw new Error("`publicAddress` (the Public Address for the `wif`) is a required option in order to use RPC Wallet!")

		// If the port is not set, default to Livenet (7313), otherwise if they passed the string "testnet" use the testnet port (17313)
		if (!this.options.rpc.port){
			if (this.options.network && this.options.network === "testnet")
				this.options.rpc.port = 17313
			else
				this.options.rpc.port = 7313
		}
		// If host is not set, use localhost
		if (!this.options.rpc.host)
			this.options.rpc.host = 'localhost'

		// Create the RPC connection using Axios
		this.rpc = axios.create({
			baseURL: "http://" + this.options.rpc.host + ":" + this.options.rpc.port,
			auth: {
				username: this.options.rpc.username,
				password: this.options.rpc.password
			},
			validateStatus: function (status) {
				return true
			}
		})

		// Store the Private Key and the Public Key
		this.wif = this.options.wif
		this.publicAddress = this.options.publicAddress
		this.coin = flo_testnet

		// Store information about our tx chain and the previous tx output
		this.unconfirmedTransactions = []
		this.previousTXOutput = undefined
		this.peers = []

		// Variables to count utxo ancestors (maximum number of unconfirmed transactions you can chain)
		this.currentAncestorCount = 0
		this.currentAncestorSize = 0

		// Repair mode tracker
		this.repairMode = false
	}

	/**
	 * Make any RPC request
	 * @param  {String} method - The RPC method you wish to call
	 * @param  {Array} parameters - The parameters to pass to with RPC method you are calling
	 * @return {Object} Returns the data response
	 */
	async rpcRequest(method, parameters){
		// Verify we have all the parameters we need
		if (!method)
			throw new Error("rpcRequest parameter 'method' is Required!")
		if (!parameters)
			throw new Error("rpcRequest parameter 'parameters' is Required!")

		// Perform the RPC request using Axios
		let rpcRequest
		try {
			rpcRequest = await this.rpc.post("/", { "jsonrpc": "2.0", "id": 1, "method": method, "params": parameters })
		} catch (e) {
			// Throw if there was some weird error for some reason.
			throw new Error("Unable to perform RPC request! Method: '" + method + "' - Params: '" + JSON.stringify(parameters) + "' | RPC settings: " + JSON.stringify(this.options.rpc) + " | Thrown Error: " + e)
		}

		// Remove the `id` field from the response, since we do not care about it
		return {
			result: rpcRequest.data.result,
			error: rpcRequest.data.error
		}
	}

	/**
	 * Grab the latest unconfirmed tx and check how many ancestors it has
	 * @return {Boolean} Returns true if the update was successful
	 */
	async updateAncestorStatus(){
		// We next check to see if there are any transactions currently in the mempool that we need to be aware of.
		// To check the mempool, we start by grabbing the UTXO's to get the txid of the most recent transaction that was sent
		let utxos = await this.getUTXOs()
		
		// Grab the most recent txid
		let mostRecentUTXO = utxos[0]
		let mostRecentTXID = mostRecentUTXO.txid
		// Check to see if the utxo is still in the mempool and if it has ancestors
		let getMempoolEntry = await this.rpcRequest("getmempoolentry", [ mostRecentTXID ] )
		// Check if we have an error and handle it
		if (getMempoolEntry.error && getMempoolEntry.error !== null) {
			// If the error 'Transaction not in mempool' occurs, that means that the most recent transaction 
			// has already recieved a confirmation, so it has no ancestors we need to worry about.

			// If the error is different, than throw it up for further inspection.
			if (getMempoolEntry.error.message === 'Transaction not in mempool' || getMempoolEntry.error.message === 'Transaction not in mempool.'){
				// Check to make sure if it is not in the mempool, that it at least has one confirmation.
				if (mostRecentUTXO.confirmations >= 1) {
					this.currentAncestorCount = 0
					this.currentAncestorSize = 0
				} else {
					// If we have gotten here, that means the transaction has zero confirmations, and is not included in the mempool, and so we need to repair it's chain...
					throw new Error("Most recent transaction has zero confirmations and is not in the mempool!!! (txid: " + mostRecentTXID + ") " + JSON.stringify(getMempoolEntry))
				}
			} else {
				throw new Error("Error grabbing the mempool entry! " + JSON.stringify(getMempoolEntry.error))
			}
		}

		// If the tx is still in the mempool, it will have results
		if (getMempoolEntry.result) {
			let txMempoolStatus = getMempoolEntry.result

			// Store the current ancestor count & size
			this.currentAncestorCount = txMempoolStatus.ancestorcount
			this.currentAncestorSize = txMempoolStatus.ancestorsize

			// Also increase the count by one in order to account for the txid from the mempool
			this.currentAncestorCount++
		}

		return true
	}

	/**
	 * Add a transaction we just sent to the ancestor count/size
	 * @param {String} hex - The transaction hex to count
	 * @return {Boolean} Returns true on success
	 */
	addAncestor(hex) {
		// Increase the ancestor count
		this.currentAncestorCount++
		// Increase the ancestor size (byte length)
		this.currentAncestorSize += Buffer.from(hex, 'hex').length

		// Log every 50
		if (this.currentAncestorCount % 50 === 0)
			console.log(`[RPC Wallet] Updated Ancestor Count: ${this.currentAncestorCount} - Updated Ancestor Size: ${(this.currentAncestorSize / ONE_MB).toFixed(2)}MB`)

		return true
	}

	/**
	 * Checks the current ancestor count and returns when it is safe to send more transactions. 
	 * This method will wait for tx's in the mempool to be confirmed before continuing.
	 * @async
	 * @return {Boolean} Returns `true` once it is safe to continue sending transactions
	 */
	async checkAncestorCount(){
		let firstLoop = true
		let hadMaxAncestors = false

		let startAncestorCount = this.currentAncestorCount
		let startAncestorSize = this.currentAncestorSize

		let reachedAncestorLimitTimestamp

		// Check if we have too many ancestors, and if we do, wait for the ancestor count to decrease (aka, some transactions to get confirmed in a block)
		while (this.currentAncestorCount >= MAX_MEMPOOL_ANCESTORS || this.currentAncestorSize >= MAX_MEMPOOL_ANCESTOR_SIZE) {
			// Wait for UPDATE_ANCESTOR_STATUS seconds (don't run on the first loop through)
			if (!firstLoop)
				await new Promise((resolve, reject) => { setTimeout(() => { resolve() }, UPDATE_ANCESTOR_STATUS)})
			// Update the ancestor status (this is what will break us out of our while loop)
			await this.updateAncestorStatus()

			let hasMaxAncestors = (this.currentAncestorCount >= MAX_MEMPOOL_ANCESTORS || this.currentAncestorSize >= MAX_MEMPOOL_ANCESTOR_SIZE)

			// Only log ancestor count if it is the first loop, and we still have too many ancestors
			if (hasMaxAncestors && firstLoop){
				console.log(`[RPC Wallet] Maximum Unconfirmed Transaction count reached, pausing sending of transactions until some of the current transactions get confirmed | Ancestor Count: ${this.currentAncestorCount} - Ancestor Size: ${(this.currentAncestorSize / ONE_MB).toFixed(2)}MB`)
				hadMaxAncestors = true
				reachedAncestorLimitTimestamp = Date.now()
			}

			// After it has been REPAIR_ANCESTORS_AFTER amount of time since the max ancestor limit was reached, enable repair mode
			if (hasMaxAncestors && reachedAncestorLimitTimestamp && (Date.now() - REPAIR_ANCESTORS_AFTER) > reachedAncestorLimitTimestamp){
				console.log(`[RPC Wallet] [WARNING] Unconfirmed Transaction count has not decreased in ${REPAIR_ANCESTORS_AFTER / ONE_MINUTE} minutes, rebroadcasting transactions in an attempt to repair the utxo chain!`)
				await this.rebroadcastTransactions()
			}

			firstLoop = false
		}

		let numberConfirmed = startAncestorCount - this.currentAncestorCount
		// Remove the transactions that just got confirmed
		for (let i = 0; i < numberConfirmed; i++)
			this.unconfirmedTransactions.shift()

		if (startAncestorCount >= MAX_MEMPOOL_ANCESTORS || startAncestorSize >= MAX_MEMPOOL_ANCESTOR_SIZE){
			console.log(`[RPC Wallet] ${numberConfirmed} Transactions Confirmed! (${((startAncestorSize - this.currentAncestorSize) / ONE_MB).toFixed(2)} MB)`)

			if (numberConfirmed < REPAIR_MIN_TX){
				console.log(`[RPC Wallet] Detected low number of transactions confirmed, re-announcing transactions to make sure miners saw them.`)
				await this.rebroadcastTransactions()
			}
		}

		if (hadMaxAncestors)
			console.log(`[RPC Wallet] Unconfirmed count has decreased, resuming sending transactions! | Ancestor Count: ${this.currentAncestorCount} - Ancestor Size: ${(this.currentAncestorSize / ONE_MB).toFixed(2)}MB`)

		// If we enabled repair mode, then
		this.repairMode = false

		// There are fewer ancestors than the maximum, so we can send the next transaction!
		return true
	}

	async rebroadcastTransactions(){
		console.log(`[RPC Wallet] Announcing ${this.unconfirmedTransactions.length} transactions to ${this.peers.length} Peers...`)

		await this.connectToPeers()

		let i = 0;
		for (let txHex of this.unconfirmedTransactions){
			for (let peer of this.peers)
				if (peer.connected)
					await peer.announceTX(txHex)

			i++
			if (i % 50 === 0)
				console.log(`[RPC Wallet] Announced ${i}/${this.unconfirmedTransactions.length} transactions so far...`)
		}
		console.log(`[RPC Wallet] Announced ${i} transactions!`)

		// Wait for 1 minute in order to give some time for transactions to be requested, and sent out.
		await new Promise((resolve, reject) => { setTimeout(() => { resolve() }, 10 * 1000)})

		this.destroyPeers()
	}

	/**
	 * Initialize the RPC Wallet. This imports the Private Key, and then checks for unconfirmed transactions in the mempool.
	 * @async
	 * @return {Boolean} Returns true on Success
	 */
	async initialize(){
		// First, we import the Private Key to make sure it exists when we attempt to send transactions.
		let importPrivKey = await this.rpcRequest("importprivkey", [ this.wif, "", true ] )

		// Check for an error importing the private key. If there is no error, the private key import was successful. 
		// No error and no result signify that the Private Key was already imported previously to the wallet.
		if (importPrivKey.error && importPrivKey.error !== null && importPrivKey.error.message !== "Key already exists.")
			throw new Error("Error Importing Private Key to RPC Wallet: " + JSON.stringify(importPrivKey.error))
		
		// Update our ancestor count & status
		await this.updateAncestorStatus()

		// If we have no ancestors, skip grabbing the ancestor transaction hex and return true early
		if (this.currentAncestorCount === 0)
			return true

		console.log(`[RPC Wallet] Loading ${this.currentAncestorCount} transactions into local mempool, please wait... (this may take a little while)`)

		/* Update the tx chain */
		// First, we need to get a list of unconfirmed transactions, to do this, we need the most recent utxo.
		let utxos = await this.getUTXOs()

		// Then, while we have ancestors, lookup the transaction hex, and add it to the start of the unconfirmed transaction chain
		let nextTXID = utxos[0].txid
		while (nextTXID) {
			let txHex = await this.rpcRequest("getrawtransaction", [ nextTXID ])
			if (txHex.error && txHex.error !== null)
				throw new Error("Error gathering raw transaction for (" + nextTXID + "): " + JSON.stringify(txHex.error))

			this.unconfirmedTransactions.unshift(txHex.result)

			let txMemInfo = await this.rpcRequest("getmempoolentry", [ nextTXID ] )
			if (txMemInfo.error && txMemInfo.error !== null)
				throw new Error("Error gathering mempool entry for (" + nextTXID + "): " + JSON.stringify(txMemInfo.error))

			// See if there are any parent transactions that need to be confirmed
			if (txMemInfo.result.depends.length > 0)
				nextTXID = txMemInfo.result.depends[0]
			else
				nextTXID = undefined

			// Log every 100 added
			if (this.unconfirmedTransactions.length % 50 === 0)
				console.log(`[RPC Wallet] Loaded ${this.unconfirmedTransactions.length}/${this.currentAncestorCount} transactions into local mempool so far...`)
		}

		console.log(`[RPC Wallet] Loaded ${this.unconfirmedTransactions.length} transactions into local mempool!`)

		// Return true, signifying that the initialization was successful
		return true
	}

	/**
	 * Create fcoin "Peers" for all peers that the rpc full node as access to.
	 */
	async connectToPeers(){
		this.peers = []

		let getPeerInfo = await this.rpcRequest("getpeerinfo", [])
		if (getPeerInfo.error)
			throw new Error(getPeerInfo.error)

		console.log(`[RPC Wallet] Connecting to ${getPeerInfo.result.length} Peers...`)

		for (let peerInfo of getPeerInfo.result){
			let peer = new Peer({ ip: peerInfo.addr })
			peer.connect()

			this.peers.push(peer)
		}

		await new Promise((resolve, reject) => { setTimeout(() => { resolve() }, 2 * 1000)})

		let i = 0
		for (let peer of this.peers)
			if (peer.connected)
				i++

		console.log(`[RPC Wallet] Connected to ${i} Peers!`)
	}

	destroyPeers(){
		for (let peer of this.peers){
			peer.peer.destroy()
		}
		this.peers = []
	}

	async signMessage(message){
		let ECPair = bitcoin.ECPair.fromWIF(this.wif, flo_testnet.network)
		let privateKeyBuffer = ECPair.privateKey;

		let compressed = ECPair.compressed || true;

		let signature_buffer
		try {
			signature_buffer = sign(message, privateKeyBuffer, compressed, ECPair.network.messagePrefix)
		} catch (e) {
			throw new Error(e)
		}

		let signature = signature_buffer.toString('base64')

		return signature
	}

	/**
	 * Get the latest unspent transaction outputs
	 * @async
	 * @return {Array.<Object>} Returns an Array of UTXO's
	 */
	async getUTXOs(){
		// If we have a previous txo, then just return that one!
		if (this.previousTXOutput && this.previousTXOutput.amount > MIN_UTXO_AMOUNT)
			return [ this.previousTXOutput ]

		if (!this.initialUTXOLog) {
			console.log("[RPC Wallet] Grabbing initial transaction output to use, this may take a few seconds...")
			this.initialUTXOLog = true
		}

		// Request the list of unspent transactions
		const MIN_CONFIRMATIONS = 0
		const MAX_CONFIRMATIONS = 9999999
		let utxoRes = await this.rpcRequest("listunspent", [ MIN_CONFIRMATIONS, MAX_CONFIRMATIONS, [this.publicAddress],  ])

		if (utxoRes.error && utxoRes.error !== null)
			throw new Error("Unable to get unspent transactions for: " + this.publicAddress + "\n" + JSON.stringify(utxoRes.error))

		let utxos = utxoRes.result

		// Filter out transactions that don't meet our minimum UTXO value
		let filtered = utxos.filter((utxo) => {
			if (utxo.amount >= MIN_UTXO_AMOUNT)
				return true

			return false
		})

		// Check if we have no transaction outputs available to spend from
		if (filtered.length === 0)
			throw new Error("No previous unspent output available! Please send some FLO to " + this.publicAddress + " and then try again!")

		filtered.sort((a, b) => {
			return a.confirmations - b.confirmations
		})

		return filtered
	}

	/**
	 * Create and broadcast a transaction containing the requested data as floData
	 * @async
	 * @param  {String} floData - The data you wish to be placed into the `floData` of the transaction.
	 * @return {String} Returns the TXID of the transaction if sent successfully
	 */
	async sendDataToChain(floData){
		// Grab the unspent outputs for our address
		let utxos = await this.getUTXOs()

		// console.log(utxos)

		// Select the first input that has > MIN_UTXO_AMOUNT FLO
		let input
		for (let i = 0; i < utxos.length; i++) {
			if (utxos[i].amount > MIN_UTXO_AMOUNT){
				input = utxos[i]
				// console.log("set utxo")
				break
			}
		}

		// console.log(input)

		// Calculate the minimum Transaction fee for our transaction by counting the size of the inputs, outputs, and floData
		let myTxFee = TX_FEE_PER_BYTE * (TX_AVG_BYTE_SIZE + varIntBuffer(floData.length).toString('hex').length + Buffer.from(floData).length)

		// Create an output to send the funds to
		let output = {}
		output[this.publicAddress] = parseFloat((input.amount - myTxFee).toFixed(8))

		// Send the transaction
		let txid = await this.sendTX([ input ], output, floData)

		// Returns the TXID of the transaction if sent successfully
		return txid
	}

	createAndSignTransaction(input, outputs, floData){
		let txb = new bitcoin.TransactionBuilder(this.coin.network)

		txb.setVersion(this.coin.txVersion)

		txb.addInput(input.txid, input.vout)
		txb.addOutput(this.publicAddress, parseInt(outputs[this.publicAddress] * SAT_PER_FLO))

		let extraBytes = this.coin.getExtraBytes({floData})

		this.coin.sign(txb, extraBytes, 0, bitcoin.ECPair.fromWIF(this.wif, this.coin.network))

		let builtHex

		try {
			builtHex = txb.build().toHex();
		} catch (err) {
			throw new Error(`Unable to build Transaction Hex!: ${err}`)
		}

		builtHex += extraBytes

		return builtHex
	}

	/**
	 * Send a Transaction using the requested inputs, outputs, and floData
	 * @async
	 * @param  {Array.<Object>} inputs  - An array of utxo inputs to use to fund the transaction
	 * @param  {Object} outputs - An Object that contains addresses to output to as the key, and the amount to send as the value (i.e. `{ 'mypublicaddresshere': 1 }`)
	 * @param  {String} floData - The `floData` you wish to include in the transaction
	 * @return {String} Returns the txid of the transaction if sent successfully
	 */
	async sendTX(inputs, outputs, floData) {
		// Perform validation checks on the floData being added to the chain
		if (typeof floData !== 'string')
			throw new Error(`Data must be of type string. Got: ${typeof floData}`)
		if (floData.length > FLODATA_MAX_LEN)
			throw new Error(`Error: 'floData' length exceeds ${FLODATA_MAX_LEN} characters. Please send a smaller data package.`)

		// Make sure that we don't have too many ancestors. If we do, then waits for some transactions to be confirmed.
		await this.checkAncestorCount()

		// Create the initial transaction hex
		/*

		const LOCKTIME = 0
		const REPLACABLE = false
		let createTXHex = await this.rpcRequest("createrawtransaction", [ inputs, outputs, LOCKTIME, REPLACABLE, floData ])
		// Check if there was an error creating the transaction hex
		if (createTXHex.error && createTXHex.error !== null)
			throw new Error("Error creating raw tx: " + JSON.stringify(inputs, null, 4) + " " + JSON.stringify(outputs, null, 4) + " " + floData + "\n" + JSON.stringify(createTXHex.error, null, 4))
		// Grab the raw unsigned TX hex
		let rawUnsignedTXHex = createTXHex.result

		// Sign the Transaction Hex we created above
		let signTXHex = await this.rpcRequest("signrawtransaction", [ rawUnsignedTXHex ])
		// Check if there was an error signing the transaction hex
		if (signTXHex.error && signTXHex.error !== null)
			throw new Error("Error signing raw tx: " + rawUnsignedTXHex + "\n" + JSON.stringify(signTXHex.error))
		// Grab the signed tx hex
		let rawTXHex = signTXHex.result.hex

		if (!signTXHex.result.complete)
			throw new Error("Error signing raw transaction, signature not complete! " + JSON.stringify(signTXHex.result))

		*/
	
		let rawTXHex = this.createAndSignTransaction(inputs[0], outputs, floData)

		// Broadcast the transaction hex we created to the network
		let broadcastTX = await this.rpcRequest("sendrawtransaction", [ rawTXHex ])
		// Check if there was an error broadcasting the transaction
		if (broadcastTX.error && broadcastTX.error !== null)
			throw new Error("Error broadcasting raw tx: " + rawTXHex + "\n" + JSON.stringify(broadcastTX.error))

		// Add the tx we just sent to the Ancestor count
		this.addAncestor(rawTXHex)
		// Add our tx hex to the unconfirmed transactions array
		this.unconfirmedTransactions.push(rawTXHex)

		// Set the new tx to be used as the next output.
		this.previousTXOutput = {
			txid: broadcastTX.result,
			amount: outputs[this.publicAddress],
			vout: 0
		}

		// Return the TXID of the transaction
		return broadcastTX.result
	}
}

export default RPCWallet