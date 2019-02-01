import axios from 'axios'
import uid from 'uid'

import { varIntBuffer } from '../../util'

// 1 satoshis per byte (1000 satoshi per kb) (100 million satoshi in 1 FLO)
const TX_FEE_PER_BYTE = 0.00000001
// Average size of tx data (without floData) to calculate min txFee
const TX_AVG_BYTE_SIZE = 192

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
	 * Initialize the RPC Wallet. This imports the Private Key, and then checks for unconfirmed transactions in the mempool.
	 * @async
	 * @return {Boolean} Returns true on Success
	 */
	async initialize(){
		// First, we import the Private Key to make sure it exists when we attempt to send transactions.
		let importPrivKey = await this.rpcRequest("importprivkey", [ this.wif, "", true ] )

		if (importPrivKey.error && importPrivKey.error !== null)
			throw new Error("Error Importing Private Key to RPC Wallet: " + importPrivKeyRes.data.error)

		// If there is no error, the private key add was successful
		



		// Return true, signifying that the initialization was successful
		return true
	}

	/**
	 * Get the latest unspent transaction outputs
	 * @async
	 * @return {Array.<Object>} Returns an Array of UTXO's
	 */
	async getUTXOs(){
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
		if (floData.length > 1040)
			throw new Error(`Error: 'floData' length exceeds 1040 characters. Please send a smaller data package.`)

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

		// Return the TXID of the transaction
		return broadcastTX.result
	}
}

export default RPCWallet