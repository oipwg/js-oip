import bitcoin from 'bitcoinjs-lib'
import {flo_testnet} from '../../../src/config/networks'
import MPSingle from '../../../src/modules/multipart/mpsingle'
import Oipindex from '../../../src/core/oipd-api/daemonApi'

const index = new Oipindex()

describe("MPSingle", () => {
	describe('Construction', () => {
		it('Builds an empty MPS', () => {
			let mps = new MPSingle()
			expect(mps).toBeDefined()
			expect(mps).toBeInstanceOf(MPSingle)
			expect(mps.isValid().success).toBeFalsy()
		})
	})
	describe('fromInput', () => {
		it('from JSON', async () => {
			let mpo = {
				"reference": "8c204c5f39",
				"address": "FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k",
				"data": "\":\"Single Track\",\"duration\":268},{\"fname\":\"miltjordan-vanishingbreed.jpg\",\"fsize\":40451,\"type\":\"Image\",\"subtype\":\"album-art\"},{\"fname\":\"miltjordan-angelsgettheblues.jpg\",\"fsize\":54648,\"type\":\"Image\",\"subtype\":\"cover\"}],\"location\":\"QmWmth4ES4ZH9Wgz6Z7S7dRFF8MzJVGgDhit5KzH5uCvZz\"},\"payment\":{\"fiat\":\"USD\",\"scale\":\"1000:1\",\"maxdisc\":30,\"promoter\":15,\"retailer\":15,\"sugTip\"",
				"max": 6,
				"signature": "H9dqFw5Pd//qwHeEQA+ENifGvvs/0X1sLUXLQKj2L5qdI/BIJMBX2w3TKETHeNg3MMhA1i3PYVT2FnC8y/BxvUM=",
				"meta": {
					"stale": true,
					"block_hash": "455e5d41a5b9b90bd907d6828dbdcb721d82bdc2738ae8b4a5a54bb3869b02cd",
					"txid": "1d6392c44629a1fc3eafab4b564a003084e9afad055b5cbdb8fc8c1d3f042d1d",
					"block": 2950932,
					"time": 1536431891,
					"complete": false
				},
				"part": 4
			}
			let mps = new MPSingle(mpo)
			// console.log(mps)
			expect(mps.isValid().success).toBeTruthy()
			expect(mps.isStale()).toBeTruthy()
			expect(mps.isComplete()).toBeFalsy()
			expect(mps.getMeta()).toEqual({
				"stale": true,
				"block_hash": "455e5d41a5b9b90bd907d6828dbdcb721d82bdc2738ae8b4a5a54bb3869b02cd",
				"txid": "1d6392c44629a1fc3eafab4b564a003084e9afad055b5cbdb8fc8c1d3f042d1d",
				"block": 2950932,
				"time": 1536431891,
				"complete": false
			})
			expect(mps.getPart()).toEqual(4)
			expect(mps.getMax()).toEqual(6)
			expect(mps.getReference()).toEqual("8c204c5f39")
			expect(mps.getAddress()).toEqual("FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k")
			expect(mps.getSignature()).toEqual("H9dqFw5Pd//qwHeEQA+ENifGvvs/0X1sLUXLQKj2L5qdI/BIJMBX2w3TKETHeNg3MMhA1i3PYVT2FnC8y/BxvUM=")
			expect(mps.getData()).toEqual(
				"\":\"Single Track\",\"duration\":268},{\"fname\":\"miltjordan-vanishingbreed.jpg\",\"fsize\":40451,\"type\":\"Image\",\"subtype\":\"album-art\"},{\"fname\":\"miltjordan-angelsgettheblues.jpg\",\"fsize\":54648,\"type\":\"Image\",\"subtype\":\"cover\"}],\"location\":\"QmWmth4ES4ZH9Wgz6Z7S7dRFF8MzJVGgDhit5KzH5uCvZz\"},\"payment\":{\"fiat\":\"USD\",\"scale\":\"1000:1\",\"maxdisc\":30,\"promoter\":15,\"retailer\":15,\"sugTip\""
			)
			expect(mps.getSignatureData()).toEqual(
				`4-6-FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k-8c204c5f39-${mps.getData()}`
			)
		})
		it('from the DaemonApi', async () => {
			let mp = await index.getMultipart('1d6392c44629a1fc3eafab4b564a003084e9afad055b5cbdb8fc8c1d3f042d1d')
			expect(mp.success).toBeTruthy()
			let mps = new MPSingle(mp.multipart)
			expect(mps.isValid().success).toBeTruthy()
			expect(mps.getMeta()).toEqual({ complete: true,
				stale: false,
				time: 1536431891,
				txid: '1d6392c44629a1fc3eafab4b564a003084e9afad055b5cbdb8fc8c1d3f042d1d',
				block: 2950932,
				block_hash: '455e5d41a5b9b90bd907d6828dbdcb721d82bdc2738ae8b4a5a54bb3869b02cd',
				assembled: '{"oip-041":{"artifact":{"type":"Audio-Album","info":{"extraInfo":{"artist":"Milt Jordan","genre":"Country & Folk","company":"Vintage Heart Records"},"title":"Angels Get the Blues","year":2010,"description":"\\"Original Release Date: December 1, 2010\\\\n\\\\nTotal Length: 20:43\\\\nASIN: B005COCRBO\\\\n\\\\nCopyright: 2010 Milt Jordan\\""},"storage":{"network":"IPFS","files":[{"fname":"1 - Angels Get the Blues.aac","fsize":4861672,"dname":"Angels Get the Blues","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Album Track","duration":306},{"fname":"2 - How I Want My Heaven.aac","fsize":3241607,"dname":"How I Want My Heaven","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Album Track","duration":204},{"fname":"3 - Honey Gives Me Money.aac","fsize":3169998,"dname":"Honey Gives Me Money","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Album Track","duration":199},{"fname":"4 - Never Saw It Coming.aac","fsize":2580019,"dname":"Never Saw It Coming","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Album Track","duration":162},{"fname":"5 - Ride With Joe.aac","fsize":3490473,"dname":"Ride With Joe","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Album Track","duration":219},{"fname":"6 - Hot For You Baby.aac","fsize":2436918,"dname":"Hot For You Baby","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Album Track","duration":153},{"fname":"Vanishing Breed.aac","fsize":4261627,"dname":"Vanishing Breed","sugBuy":1000,"sugPlay":10,"type":"Audio","subtype":"Single Track","duration":268},{"fname":"miltjordan-vanishingbreed.jpg","fsize":40451,"type":"Image","subtype":"album-art"},{"fname":"miltjordan-angelsgettheblues.jpg","fsize":54648,"type":"Image","subtype":"cover"}],"location":"QmWmth4ES4ZH9Wgz6Z7S7dRFF8MzJVGgDhit5KzH5uCvZz"},"payment":{"fiat":"USD","scale":"1000:1","maxdisc":30,"promoter":15,"retailer":15,"sugTip":[],"addresses":[{"token":"BTC","address":"1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA"},{"token":"FLO","address":"FTogNNXik7eiHZw5uN2KMe4cvcr7GCEjbZ"},{"token":"LTC","address":"LUWPbpM43E2p7ZSh8cyTBEkvpHmr3cB8Ez"}]},"timestamp":1536429312,"publisher":"FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k"},"signature":"IGFvZmnnB7g2Q02zzzKwrgNelhUJv8D69J/HTa+IqHe3IWI/RaT3PLzKjfjeHWSjKC6PjF3EVKXAdibq+5DbYr4="}}',
				tx: undefined })
		})
	})
	describe('Signing', () => {
		it('Create and validate signature', () => {
			let network = flo_testnet.network
			let ECPair = bitcoin.ECPair.makeRandom({network})
			let address = bitcoin.payments.p2pkh({pubkey: ECPair.publicKey, network}).address
			let mps = new MPSingle({part: 0, max: 1, reference: 'reference', address, data: 'data'})
			let {success, signature, error} = mps.signSelf(ECPair)

			expect(success).toBeTruthy()
			expect(signature).toBeDefined()
			expect(error).toBeUndefined()

			expect(mps.hasValidSignature()).toBeTruthy()
		})
	})
	describe(`To String`, () => {
		it('toString', async () => {
			let mp = await index.getMultipart('1d6392c44629a1fc3eafab4b564a003084e9afad055b5cbdb8fc8c1d3f042d1d')
			expect(mp.success).toBeTruthy()
			expect(mp.multipart).toBeInstanceOf(MPSingle)
			expect(mp.multipart.toString()).toEqual('oip-mp(4,6,FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k,8c204c5f39,H9dqFw5Pd//qwHeEQA+ENifGvvs/0X1sLUXLQKj2L5qdI/BIJMBX2w3TKETHeNg3MMhA1i3PYVT2FnC8y/BxvUM=):":"Single Track","duration":268},{"fname":"miltjordan-vanishingbreed.jpg","fsize":40451,"type":"Image","subtype":"album-art"},{"fname":"miltjordan-angelsgettheblues.jpg","fsize":54648,"type":"Image","subtype":"cover"}],"location":"QmWmth4ES4ZH9Wgz6Z7S7dRFF8MzJVGgDhit5KzH5uCvZz"},"payment":{"fiat":"USD","scale":"1000:1","maxdisc":30,"promoter":15,"retailer":15,"sugTip"')
			expect(mp.multipart.hasValidSignature()).toBeTruthy()

		})

		it('part 0 to string', async () => {
			let mp = await index.getMultipart('a690609a2a8198fbf4ed3fd7e4987637a93b7e1cad96a5aeac2197b7a7bf8fb9')
			let {success, multipart, error} = mp
			expect(success).toBeTruthy();
			expect(multipart).toBeInstanceOf(MPSingle)
			expect(error).toBeUndefined()
			expect(multipart.hasValidSignature()).toBeTruthy()
		})
	})
	describe(`Getters & Setters`, () => {
		it('Get and Set Part [Number]', () => {
			let mps = new MPSingle()
			mps.setPart(0)
			expect(mps.getPart()).toEqual(0)
		})
		it('Get and Set Max [Part Number]', () => {
			let mps = new MPSingle()
			mps.setMax(1)
			expect(mps.getMax()).toEqual(1)
		})
		it('Get and Set Address', () => {
			let mps = new MPSingle()
			mps.setAddress('address')
			expect(mps.getAddress()).toEqual('address')
		})
		it('Get and Set Reference', () => {
			let mps = new MPSingle()
			mps.setReference('reference')
			expect(mps.getReference()).toEqual('reference')
		})
		it('Get and Set Signature', () => {
			let mps = new MPSingle()
			mps.setSignature('signature')
			expect(mps.getSignature()).toEqual('signature')
		})
		it('Get and Set Data', () => {
			let mps = new MPSingle()
			mps.setData('data')
			expect(mps.getData()).toEqual('data')
		})
		it('Get and Set Time', () => {
			let mps = new MPSingle()
			mps.setTime(1234)
			expect(mps.getTime()).toEqual(1234)
		})
		it('Get and Set TXID', () => {
			let mps = new MPSingle()
			mps.setTXID('txid')
			expect(mps.getTXID()).toEqual('txid')
		})
		it('Get and Set Block', () => {
			let mps = new MPSingle()
			mps.setBlock(1234)
			expect(mps.getBlock()).toEqual(1234)
		})
		it('Get and Set Block Hash', () => {
			let mps = new MPSingle()
			mps.setBlockHash('block_hash')
			expect(mps.getBlockHash()).toEqual('block_hash')
		})
		it('Get and Set Assembled', () => {
			let mps = new MPSingle()
			mps.setAssembled('assembled')
			expect(mps.getAssembled()).toEqual('assembled')
		})
		// it('Get and Set TX', () => {
		// 	let mps = new MPSingle()
		// 	mps.setTX({tx: 'tx'})
		// 	expect(mps.getTX()).toEqual({tx: 'tx'})
		// })
		// it('Get _source', () => {
		// 	let mps = new MPSingle()
		// 	expect(mps._getSource()).toBeUndefined()
		// })
		it('Get Signature Data for a part 0', async () => {
			let multi = await index.getMultipart("d148b56799")
			multi = multi.multipart
			expect(multi.getSignatureData()).toEqual(
				'0-1-F95Q4zxMiafqyZDBaJRuLNyvGD7dCwjezX--{"oip-041":{"artifact":{"type":"Audio-Basic","info":{"extraInfo":{"genre":"Acoustic"},"title":"Visionen_von_Marie"},"storage":{"network":"IPFS","files":[{"fname":"Visionen_von_Marie.mp3","fsize":3771195,"type":"Audio","duration":187}],"location":"QmZCcTJJUG2Dp1uLsMhe9bSWZbWp5hCprfjfBtJiLU67bf"},"payment":{"fiat":"USD","scale":"1000:1","maxdisc":30,"promoter":15,"retai'
			)
		})
		it('Get Signature Data for a part > 0', async () => {
			let multi = await index.getMultipart("2b6036585a")
			multi = multi.multipart
			expect(multi.getSignatureData()).toEqual(
				'1-1-F95Q4zxMiafqyZDBaJRuLNyvGD7dCwjezX-d148b56799-ler":15,"sugTip":[],"addresses":[]},"timestamp":1532864918,"publisher":"F95Q4zxMiafqyZDBaJRuLNyvGD7dCwjezX"},"signature":"IK9mtLY+sugytM4URKiRyRxUVtkeZGT5JaVYSw3tqlhnboRJo1HFcEv6mQjbUmkjVZ8TOgOilaBPZD+Kyj2E1sM="}}')
		})
	})
})