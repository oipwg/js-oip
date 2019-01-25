import axios from 'axios'
import uid from 'uid'

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

		console.log(inputs)

		return inputs
	}
}

export default RPCWallet