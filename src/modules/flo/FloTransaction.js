import { Transaction, script as bscript, crypto as bcrypto } from 'bitcoinjs-lib'
import varuint from 'varuint-bitcoin'

export const MAX_FLO_DATA_SIZE = 1040

const EMPTY_SCRIPT = Buffer.alloc(0)
const ONE = Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex')

class FLOTransaction extends Transaction {
  constructor () {
    super()

    this.version = 2
    this.floData = Buffer.from([])
  }

  setFloData (floData, dataType) {
    this.floData = Buffer.from(floData, dataType)
  }

  getFloData () {
    return this.floData
  }

  clone () {
    let newTx = new FLOTransaction()
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

    newTx.floData = Buffer.from(this.floData)

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
    if (!buffer) { buffer = Buffer.allocUnsafe(this.__byteLength(__allowWitness)) }

    Transaction.prototype.__toBuffer.call(this, buffer, initialOffset, __allowWitness)

    // Calculate where we left off
    let offset = buffer.length - (this.floData.length + varuint.encode(this.floData.length).length)

    // Add the varint for the floData length
    varuint.encode(this.floData.length, buffer, offset)
    offset += varuint.encode.bytes
    // Append the floData itself
    this.floData.copy(buffer, offset)

    // Return the built transaciton Buffer
    return buffer
  }

  hashForSignature (inIndex, prevOutScript, hashType) {
    // https://github.com/bitcoin/bitcoin/blob/master/src/test/sighash_tests.cpp#L29
    if (inIndex >= this.ins.length) { return ONE }

    let ourScript = bscript.compile(bscript.decompile(prevOutScript).filter(x => {
      return x !== bscript.OPS.OP_CODESEPARATOR
    }))

    let txTmp = this.clone()

    // Currently only SIGHASH_ALL is supported
    if ((hashType & 0x1f) === FLOTransaction.SIGHASH_ALL) {
      // SIGHASH_ALL: Every input private key must sign all of the outputs
      // First, we blank out every input and replace it with empty zeros
      txTmp.ins.forEach(input => {
        input.script = EMPTY_SCRIPT
      })
      // Then we put in our own script that we want to sign (we run hashForSignature for every input)
      txTmp.ins[inIndex].script = ourScript
    } else {
      throw new Error(`Passed hashType is not supported. Currently only SIGHASH_ALL is supported.`)
    }

    // serialize and hash
    let buffer = Buffer.alloc(txTmp.__byteLength(false) + 4)
    buffer.writeInt32LE(hashType, buffer.length - 4)
    txTmp.__toBuffer(buffer, 0, false)

    return bcrypto.hash256(buffer)
  }

  hashForWitnessV0 (inIndex, prevOutScript, value, hashType) {
    let sigHashBuffer = Transaction.prototype.hashForWitnessV0.call(this, inIndex, prevOutScript, value, hashType)

    return sigHashBuffer
  }
}

export default FLOTransaction
