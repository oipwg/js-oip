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