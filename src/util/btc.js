import varuint from 'varuint-bitcoin'
import wif from 'wif'

/**
 * Check if a WIF is valid for a specific CoinNetwork
 * @param  {string} key - Base58 WIF Private Key
 * @param  {CoinNetwork} network
 * @return {Boolean}
 */
function isValidWIF (key, network) {
	try {
		let dec = wif.decode(key);

		if (network) {
			return dec.version === network.wif
		} else {
			return true
		}
	} catch (e) {
		console.error(e);
		return false
	}
}

module.exports = {
	isValidWIF,
	varIntBuffer: varuint.encode
}