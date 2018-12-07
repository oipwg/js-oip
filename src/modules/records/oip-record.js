import {sign} from "bitcoinjs-message";
import bitcoin from "bitcoinjs-lib";

class OIPRecord {
	constructor() {

	}

	signSelf(ECPair) {
		if (!ECPair) {
			return {success: false, error: 'Must provide ECPair'}
		}

		const p2pkh = bitcoin.payments.p2pkh({pubkey: ECPair.publicKey, network: ECPair.network}).address
		this.setPubAddress(p2pkh)

		let preimage = this.create_preimage()

		let privateKeyBuffer = ECPair.privateKey;

		let compressed = ECPair.compressed || true;

		let signature_buffer
		try {
			signature_buffer = sign(preimage, privateKeyBuffer, compressed, ECPair.network.messagePrefix)
		} catch (e) {
			return {success: false, error: e}
		}

		let signature = signature_buffer.toString('base64')
		this.setSignature(signature)

		return {success: true, signature}

	}

	setSignature(sig) {
		this.signature = sig
	}
	getSignature() {
		return this.signature
	}
	setPubAddress(pubAddress) {
		this.pubAddress = pubAddress
	}
	getPubAddress() {
		return this.pubAddress
	}
	create_preimage() {
		throw new Error(`Classes that extend OIPRecord must contain a 'create_preimage' method`)
	}
	serialize() {
		throw new Error(`Classes that extend OIPRecord must contain a 'serialize' method`)
	}
}

export default OIPRecord