import axios from 'axios'
import uid from 'uid'

// 1 satoshis per byte (1000 satoshi per kb) (100 million satoshi in 1 FLO)
const TX_FEE_PER_BYTE = 0.00000001
// Average size of tx data (without floData) to calculate min txFee
const TX_AVG_BYTE_SIZE = 193

class RPCWallet {
	constructor(options){
		if (!options.rpc)
			throw new Error("RPC options are required with an RPC wallet!")

		if (!options.rpc.port){
			if (options.network && options.network === "testnet")
				options.rpc.port = 17313
			else
				options.rpc.port = 7313
		}
		if (!options.rpc.host)
			options.rpc.host = 'localhost'

		this.rpc = axios.create({
			baseURL: "http://" + options.rpc.host + ":" + options.rpc.port,
			auth: {
				username: options.rpc.username,
				password: options.rpc.password
			},
			validateStatus: function (status) {
				return true
			}
		})

		this.wif = options.wif
		this.publicAddress = options.publicAddress
	}

	async initialize(){
		let response = await this.rpc.post("/", {
			"jsonrpc": "2.0", 
			"id": uid(16), 
			"method": "importprivkey",
			"params": [ this.wif, "", true ] 
		})

		if (response.data.error && response.data.error !== null)
			throw new Error(response.data.error)

		if (response.data.result && response.data.result !== null)
			return response.data.result

		// If privkey was already added, result and error will both be null
		return true
	}

	async sendDataToChain(data){
		if (typeof data !== 'string') {
			throw new Error(`Data must be of type string. Got: ${typeof data}`)
		}
		if (data.length > 1040) {
			throw new Error(`Error: 'data' length exceeds 1040 characters. Please send a smaller data package.`)
		}

		let unspentResponse = await this.rpc.post("/", {
			"jsonrpc": "2.0", 
			"id": uid(16), 
			"method": "listunspent", 
			"params": [ 0, 9999999, [ this.publicAddress ] ] 
		})

		if (unspentResponse.data.error && unspentResponse.data.error !== null)
			throw new Error("Unable to get unspent transactions for: " + this.publicAddress + "\n" + unspentResponse.data.error)

		let utxos = unspentResponse.data.result
		let input

		for (let utxo of utxos){
			if (utxo.amount > 0.0001){
				input = utxo
			}
		}

		let myTxFee = TX_FEE_PER_BYTE * (TX_AVG_BYTE_SIZE + Buffer.from(data).length)

		let output = {}
		output[this.publicAddress] = input.amount - myTxFee

		let createTXResponse = await this.rpc.post("/", {
			"jsonrpc": "2.0", 
			"id": uid(16), 
			"method": "createrawtransaction", 
			"params": [ [ input ], output, 0, true, data ] 
		})

		if (createTXResponse.data.error && createTXResponse.data.error !== null)
			throw new Error("Error creating raw tx: " + input + output + data + "\n" + createTXResponse.data.error)

		let rawUnsignedTXHex = createTXResponse.data.result

		let signTXResponse = await this.rpc.post("/", {
			"jsonrpc": "2.0", 
			"id": uid(16), 
			"method": "signrawtransaction", 
			"params": [ rawUnsignedTXHex ] 
		})

		if (signTXResponse.data.error && signTXResponse.data.error !== null)
			throw new Error("Error signing raw tx: " + rawTXHex + "\n" + JSON.stringify(signTXResponse.data.error))

		if (!signTXResponse.data.result.complete)
			throw new Error("Raw tx signature is incomplete! " + JSON.stringify(signTXResponse.data))

		let rawTXHex = signTXResponse.data.result.hex

		let broadcastTXResponse = await this.rpc.post("/", {
			"jsonrpc": "2.0", 
			"id": uid(16), 
			"method": "sendrawtransaction", 
			"params": [ rawTXHex ] 
		})

		if (broadcastTXResponse.data.error && broadcastTXResponse.data.error !== null)
			throw new Error("Error broadcasting raw tx: " + rawTXHex + "\n" + JSON.stringify(broadcastTXResponse.data.error))

		return broadcastTXResponse.data.result
	}
}

export default RPCWallet