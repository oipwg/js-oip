const RPCWallet = require('./lib/modules/wallets/RPCWallet.js').default

let pubAddress = "oHRS72N3joWepJWReCWfBoTZKvdUbM7RnT"
let wif = "cQtiSKBKbY6fc2ev91pk8pnXqKZ9evDjHXDRp6C8YtBHfvAtyoiF"

let wallet = new RPCWallet({
	publicAddress: pubAddress,
	wif,
	network: "testnet",
	rpc: {
		port: 17313,
		host: "127.0.0.1",
		username: "recorder",
		password: "0jnu71yc9a"
	}
})

const BULK_TX_COUNT = 1250
const FILL_FLO_DATA_FULL = false
const FILL_FLO_DATA_TO = 200

async function run () {
	let startTime = Date.now()
	let txs = []

	let lastTimestamp = Date.now()
	for (let i = 1; i <= BULK_TX_COUNT; i++){
		let floData = "skyoung bulk #" + i

		if (FILL_FLO_DATA_FULL){
			floData += " | "

			while (floData.length < FILL_FLO_DATA_TO)
				floData += Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 1);
		}

		let txid = await wallet.sendDataToChain(floData)

		let completionTimestamp = Date.now()
		let runtime = completionTimestamp - lastTimestamp
		let tx = { txid, runtime }
		txs.push(tx)

		//await new Promise((resolve, reject) => ( setTimeout(() => { resolve() }, 25) ))

		lastTimestamp = Date.now()
	}

	let endTime = Date.now()
	let runDuration = endTime - startTime

	console.log("Runtime for " + txs.length + " transactions: " + (runDuration/1000).toFixed(2) + " seconds")
}

run().then(() => {}).catch((e) => { throw e })