import axios from 'axios'
import uid from 'uid'

import { varIntBuffer } from '../../util'
import { FLODATA_MAX_LEN } from '../../core/oip/oip'

// Helper const
const ONE_MB = 1000000
const ONE_SECOND = 1000

// 1 satoshis per byte (1000 satoshi per kb) (100 million satoshi in 1 FLO)
const TX_FEE_PER_BYTE = 0.00000001
// Average size of tx data (without floData) to calculate min txFee
const TX_AVG_BYTE_SIZE = 192

// Prevent chaining over ancestor limit
const MAX_MEMPOOL_ANCESTORS = 1250
const MAX_MEMPOOL_ANCESTOR_SIZE = 1.75 * ONE_MB

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

		// Initialize the transaction output checking.
		this.previousTXOutput = undefined

		// Variables to count utxo ancestors (maximum number of unconfirmed transactions you can chain)
		this.currentAncestorCount = 0
		this.currentAncestorSize = 0
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
			rpcRequest = await this.rpc.post("/", { "jsonrpc": "2.0", "id": uid(16), "method": method, "params": parameters })
		} catch (e) {
			// Throw if there was some weird error for some reason.
			throw new Error("Unable to perform RPC request! Method: '" + method + "' - Params: '" + JSON.stringify(params) + "' | " + JSON.stringify(this.options.rpc))
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

		// Check if we have no transaction outputs available to spend from
		if (utxos.length === 0)
			throw new Error("No previous unspent output available! Please send some FLO to " + this.publicAddress + " and then try again!")
		
		// Grab the most recent txid
		let mostRecentTXID = utxos[0].txid
		// Check to see if the utxo is still in the mempool and if it has ancestors
		let getMempoolEntry = await this.rpcRequest("getmempoolentry", [ mostRecentTXID ] )
		// Check if we have an error and handle it
		if (getMempoolEntry.error && getMempoolEntry.error !== null) {
			// If the error 'Transaction not in mempool' occurs, that means that the most recent transaction 
			// has already recieved a confirmation, so it has no ancestors we need to worry about.

			// If the error is different, than throw it up for further inspection.
			if (getMempoolEntry.error.message !== 'Transaction not in mempool')
				throw new Error("Error Importing Private Key to RPC Wallet: " + getMempoolEntry.error)
		}

		// If the tx is still in the mempool, it will have results
		if (getMempoolEntry.result) {
			let txMempoolStatus = getMempoolEntry.result

			// Store the current ancestor count & size
			this.currentAncestorCount = txMempoolStatus.ancestorcount
			this.currentAncestorSize = txMempoolStatus.ancestorsize
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

		// Check if we have too many ancestors, and if we do, wait for the ancestor count to decrease (aka, some transactions to get confirmed in a block)
		while (this.currentAncestorCount >= MAX_MEMPOOL_ANCESTORS || this.currentAncestorSize >= MAX_MEMPOOL_ANCESTOR_SIZE) {
			// Wait for 0.1 seconds (don't run on the first loop through)
			if (!firstLoop)
				await new Promise((resolve, reject) => { setTimeout(() => { resolve() }, 0.1 * ONE_SECOND)})
			// Update the ancestor status (this is what will break us out of our while loop)
			await this.updateAncestorStatus()

			// Only log ancestor count if it is the first loop, and we still have too many ancestors
			if (firstLoop && (this.currentAncestorCount >= MAX_MEMPOOL_ANCESTORS || this.currentAncestorSize >= MAX_MEMPOOL_ANCESTOR_SIZE)){
				console.log(`[RPC Wallet] Maximum Ancestor count reached, pausing sending of transactions until some of the current transactions get confirmed | Ancestor Count: ${this.currentAncestorCount} - Ancestor Size: ${(this.currentAncestorSize / ONE_MB).toFixed(2)}MB`)
				hadMaxAncestors = true
			}

			firstLoop = false
		}

		if (startAncestorCount >= MAX_MEMPOOL_ANCESTORS || startAncestorSize >= MAX_MEMPOOL_ANCESTOR_SIZE)
			console.log(`[RPC Wallet] ${startAncestorCount - this.currentAncestorCount} Transactions Confirmed! (${((startAncestorSize - this.currentAncestorSize) / ONE_MB).toFixed(2)} MB)`)

		if (hadMaxAncestors)
			console.log(`[RPC Wallet] Ancestor count has decreased, resuming sending transactions! | Ancestor Count: ${this.currentAncestorCount} - Ancestor Size: ${(this.currentAncestorSize / ONE_MB).toFixed(2)}MB`)

		// There are fewer ancestors than the maximum, so we can send the next transaction!
		return true
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
		if (importPrivKey.error && importPrivKey.error !== null)
			throw new Error("Error Importing Private Key to RPC Wallet: " + importPrivKeyRes.error)
		
		// Update our ancestor count & status
		await this.updateAncestorStatus()

		// Return true, signifying that the initialization was successful
		return true
	}

	async signMessage(message){
		let signMyMessage = await this.rpcRequest("signmessage", [ this.publicAddress, message ] )

		if (signMyMessage.error && signMyMessage.error !== null)
			throw new Error("Error signing message using RPC Wallet: " + signMyMessage.error)

		return signMyMessage.result
	}

	/**
	 * Get the latest unspent transaction outputs
	 * @async
	 * @return {Array.<Object>} Returns an Array of UTXO's
	 */
	async getUTXOs(){
		// If we have a previous txo, then just return that one!
		if (this.previousTXOutput)
			return [ this.previousTXOutput ]

		console.log("[RPC Wallet] Grabbing initial transaction output to use, this may take a few seconds...")

		// Request the list of unspent transactions
		let MIN_CONFIRMATIONS = 0
		let MAX_CONFIRMATIONS = 9999999
		let utxoRes = await this.rpcRequest("listunspent", [ MIN_CONFIRMATIONS, MAX_CONFIRMATIONS, [this.publicAddress] ])

		if (utxoRes.error && utxoRes.error !== null)
			throw new Error("Unable to get unspent transactions for: " + this.publicAddress + "\n" + JSON.stringify(utxoRes.error))

		return utxoRes.result
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

		// Select the first input that has > 0.0001 FLO
		let input
		for (let i = 0; i < utxos.length; i++) {
			if (utxos[i].amount > 0.0001){
				input = utxos[i]
				break
			}
		}

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
		let createTXHex = await this.rpcRequest("createrawtransaction", [ inputs, outputs, 0, true, floData ])
		// Check if there was an error creating the transaction hex
		if (createTXHex.error && createTXHex.error !== null)
			throw new Error("Error creating raw tx: " + JSON.stringify(input, null, 4) + " " + JSON.stringify(output, null, 4) + " " + floData + "\n" + JSON.stringify(createTXHex.error, null, 4))
		// Grab the raw unsigned TX hex
		let rawUnsignedTXHex = createTXHex.result

		// Sign the Transaction Hex we created above
		let signTXHex = await this.rpcRequest("signrawtransaction", [ rawUnsignedTXHex ])
		// Check if there was an error signing the transaction hex
		if (signTXHex.error && signTXHex.error !== null)
			throw new Error("Error signing raw tx: " + rawUnsignedTXHex + "\n" + JSON.stringify(signTXHex.error))
		// Grab the signed tx hex
		let rawTXHex = signTXHex.result.hex

		// Broadcast the transaction hex we created to the network
		let broadcastTX = await this.rpcRequest("sendrawtransaction", [ rawTXHex ])
		// Check if there was an error broadcasting the transaction
		if (broadcastTX.error && broadcastTXerror !== null)
			throw new Error("Error broadcasting raw tx: " + rawTXHex + "\n" + JSON.stringify(broadcastTX.error))

		// Add the tx we just sent to the Ancestor count
		this.addAncestor(rawTXHex)

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