import { Transaction } from 'bitcoinjs-lib'
import varuint from 'varuint-bitcoin'

export const MAX_FLO_DATA_SIZE = 1040

class FloTransaction extends Transaction {
  constructor () {
    super()

    this.version = 2
    this.floData = Buffer.from('', 'utf8')
  }

  setFloData (floData, dataType) {
    this.floData = Buffer.from(floData, dataType)
  }

  getFloData () {
    return this.floData
  }

  clone () {
    const newTx = new FloTransaction()
    newTx.version = this.version
    newTx.locktime = this.locktime

    newTx.ins = this.ins.map(function (txIn) {
      return {
        hash: txIn.hash,
        index: txIn.index,
        script: txIn.script,
        sequence: txIn.sequence,
        witness: txIn.witness
      }
    })

    newTx.outs = this.outs.map(function (txOut) {
      return {
        script: txOut.script,
        value: txOut.value
      }
    })

    return newTx
  }

  /**
   * Calculate the Byte Length of the Tranasction
   * @param  {Boolean} __allowWitness - Should Witness be used in the generation
   * @return {Integer} Returns the length of the Transaction
   */
  __byteLength (__allowWitness) {
    let byteLength = Transaction.prototype.__byteLength.call(this, __allowWitness)

    let floDataVarInt = varuint.encode(this.floData.length)

    return (byteLength + floDataVarInt.length + this.floData.length)
  }

  /**
   * Serialize the Transaction to a Buffer
   * @param  {Buffer} buffer         - The Buffer to use while building
   * @param  {Integer} initialOffset  - The initial offset of the buffer
   * @param  {Boolean} __allowWitness -Should Witness be used in the serialization
   * @return {Buffer} Returns the TX as a Buffer
   */
  __toBuffer (buffer, initialOffset, __allowWitness) {
    let txBuffer = Transaction.prototype.__toBuffer.call(this, buffer, initialOffset, __allowWitness)

    // Calculate where we left off
    let offset = txBuffer.length - (this.floData.length + varuint.encode(this.floData.length).length)

    // Add the varint for the floData length
    varuint.encode(this.floData.length, txBuffer, offset)
    offset += varuint.encode.bytes
    // Append the floData itself
    this.floData.copy(txBuffer, offset)

    // Return the built transaciton Buffer
    return txBuffer
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
