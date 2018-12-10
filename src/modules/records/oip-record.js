import {sign, verify} from "bitcoinjs-message";
import bitcoin from "bitcoinjs-lib";

class OIPRecord {
	constructor() {
		this.preimage = undefined
	}

	/**
	 * Signs the record for publishing purposes
	 * @param ECPair - see bitcoinjs-lib/ecpair
	 * @return {object}
	 * @example
	 * let {success, error, signature} = OIPRecord.signSelf()
	 * if (!success) {
	 *     throw new Error(`Failed to sign record: ${error}`)
	 * } else {
	 *     console.log(signature)
	 * }
	 */
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

	/**
	 * Checks signature validity
	 * @param {string} [message_prefix=\u001bFlorincoin Signed Message:]
	 * @return {boolean}
	 */
	hasValidSignature(message_prefix = '\u001bFlorincoin Signed Message:\n') {
		return verify(this.getPreimage(), this.getPubAddress(), this.getSignature(), message_prefix)
	}

	/**
	 * Sets the signature to `this.signature`
	 * @param sig
	 */
	setSignature(sig) {
		this.signature = sig
	}

	/**
	 * Retrieves the signature
	 * @return {string}
	 */
	getSignature() {
		return this.signature
	}

	/**
	 * Sets the publisher/public address to `this.pubAddress`
	 * @param pubAddress
	 */
	setPubAddress(pubAddress) {
		this.pubAddress = pubAddress
	}

	/**
	 * Retrieves the publisher/public address
	 * @return {string}
	 */
	getPubAddress() {
		return this.pubAddress
	}

	/**
	 * Default method. Classes that extend OIPRecord must override this method with a unique preimage generator
	 * @example
	 * create_preimage() {
	 *     return `${uniqueVariable}-${publisherAddress}-${timestamp}`
	 * }
	 */
	create_preimage() {
		throw new Error(`Classes that extend OIPRecord must contain a 'create_preimage' method`)
	}
	/**
	 * Returns the preimage that was generated on signature creation. (to be used for validation)
	 * @return {string}
	 */
	getPreimage() {
		return this.preimage
	}

	/**
	 * Default method. Classes that extend OIPRecord must override this method with a unique serialize method to format it for publishing. See Artifact.serialize() for an example.
	 */
	serialize() {
		throw new Error(`Classes that extend OIPRecord must contain a 'serialize' method`)
	}

	/**
	 * Default Method. Classes that extend OIPRecord must override this method with validity check that returns an object with a 'success' property
	 * @example
	 * isValid() {
	 *  let valid = someValiditycheck
	 *  if (valid) {
	 *      return {success: true, error: undefined}
	 *  } else {
	 *      return {success: false, error: "Error message"}
	 *  }
	 * }
	 */
	isValid() {
		throw new Error(`Classes that extend OIPRecord must contain a 'isValid' method`)
	}

}

export default OIPRecord