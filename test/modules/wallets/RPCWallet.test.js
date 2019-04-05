import RPCWallet from '../../../src/modules/wallets/RPCWallet'

let pubAddress = "pubaddress"
let wif = "wif"

let wallet = new RPCWallet({
	publicAddress: pubAddress,
	wif,
	network: "testnet",
	rpc: {
		port: 17313,
		host: "127.0.0.1",
		username: "username",
		password: "password"
	}
})

test("Filler test (ignore me)", () => {
	let x = true
	expect(x).toBe(true)
})

test.skip("Can initialize", async () => {
	let init = await wallet.initialize()

	expect(init).toBe(true)
})

test.skip("Can send data to chain", async () => {
	let txid = await wallet.sendDataToChain("skyoung test")

	console.log("Success! " + txid)
	expect(txid).toBeDefined()
})

const BULK_TX_COUNT = 10000
const FILL_FLO_DATA_FULL = true
const FILL_FLO_DATA_TO = 1040

test.skip("Can send " + BULK_TX_COUNT + " transactions to chain in rapidfire :)", async () => {
	let startTime = Date.now()
	let txs = []

	let lastTimestamp = Date.now()
	for (let i = 1; i <= BULK_TX_COUNT; i++){
		let floData = "skyoung bulk #" + i

		if (FILL_FLO_DATA_FULL) {
			floData += " | "

			while (floData.length < FILL_FLO_DATA_TO)
				floData += Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 1);
		}

		let txid = await wallet.sendDataToChain(floData)

		let completionTimestamp = Date.now()
		let runtime = completionTimestamp - lastTimestamp
		let tx = { i, txid, runtime }
		txs.push(tx)

		lastTimestamp = Date.now()
	}

	let endTime = Date.now()
	let runDuration = endTime - startTime

	console.log("Runtime for " + txs.length + " transactions: " + (runDuration/1000).toFixed(2) + " seconds")

	expect(txs.length).toBe(1000)
}, 100 * 1000)