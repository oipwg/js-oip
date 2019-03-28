import { Transaction } from 'bitcoinjs-lib'
import varuint from 'varuint-bitcoin'

export const MAX_FLO_DATA_SIZE = 1040

class FloTransaction extends Transaction {
  constructor () {
    super()

    this.version = 2
    this.strFloData = ''
  }

  clone () {
  }

  __byteLength (__allowWitness) {
    let byteLength = Transaction.prototype.__byteLength.call(this, __allowWitness)
  }

  __toBuffer (buffer, initialOffset, __allowWitness) {
    let hashBuffer = Transaction.prototype.__toBuffer.call(this, buffer, initialOffset, __allowWitness)

    return hashBuffer
  }

  hashForSignature (inIndex, prevOutScript, hashType) {
    let sigHashBuffer = Transaction.prototype.hashForSignature.call(this, inIndex, prevOutScript, hashType)

    return sigHashBuffer
  }

  hashForWitnessV0 (inIndex, prevOutScript, value, hashType) {
    let sigHashBuffer = Transaction.prototype.hashForWitnessV0.call(this, inIndex, prevOutScript, value, hashType)

    return sigHashBuffer
  }
}

export default FloTransaction
