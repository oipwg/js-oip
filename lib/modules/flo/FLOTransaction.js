"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.FLODATA_MAX_LEN = void 0;

var _bitcoinjsLib = require("bitcoinjs-lib");

var _varuintBitcoin = _interopRequireDefault(require("varuint-bitcoin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// The maximum floData that fits in one transaction
const FLODATA_MAX_LEN = 1040;
exports.FLODATA_MAX_LEN = FLODATA_MAX_LEN;
const EMPTY_SCRIPT = Buffer.alloc(0);
const ZERO = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex');
const ONE = Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex');
const VALUE_UINT64_MAX = Buffer.from('ffffffffffffffff', 'hex');
const BLANK_OUTPUT = {
  script: EMPTY_SCRIPT,
  valueBuffer: VALUE_UINT64_MAX
};
const EMPTY_WITNESS = [];

class FLOTransaction extends _bitcoinjsLib.Transaction {
  constructor() {
    super();
    this.version = 2;
    this.floData = Buffer.from([]);
  }

  setFloData(floData, dataType) {
    let tmpFloData = Buffer.from(floData, dataType); // Check if the floData is too long :)

    if (tmpFloData.length > FLODATA_MAX_LEN) {
      throw new Error("Attempted to set too much floData! Maximum is ".concat(FLODATA_MAX_LEN, ", you tried ").concat(tmpFloData.length, "!"));
    }

    this.floData = tmpFloData;
  }

  getFloData() {
    return this.floData;
  }

  clone() {
    let newTx = new FLOTransaction();
    newTx.version = this.version;
    newTx.locktime = this.locktime;
    newTx.ins = this.ins.map(function (txIn) {
      return {
        hash: txIn.hash,
        index: txIn.index,
        script: txIn.script,
        sequence: txIn.sequence,
        witness: txIn.witness
      };
    });
    newTx.outs = this.outs.map(function (txOut) {
      return {
        script: txOut.script,
        value: txOut.value
      };
    });
    newTx.floData = Buffer.from(this.floData);
    return newTx;
  }
  /**
   * Calculate the Byte Length of the Tranasction
   * @param  {Boolean} __allowWitness - Should Witness be used in the generation
   * @return {Integer} Returns the length of the Transaction
   */


  __byteLength(__allowWitness, options) {
    let byteLength = _bitcoinjsLib.Transaction.prototype.__byteLength.call(this, __allowWitness);

    if (options && options.excludeFloData || this.version < 2) {
      return byteLength;
    }

    let floDataVarInt = _varuintBitcoin.default.encode(this.floData.length);

    return byteLength + floDataVarInt.length + this.floData.length;
  }

  static fromBuffer(buffer, _NO_STRICT) {
    let offset = 0;

    function readUInt64LE(buffer, offset) {
      const a = buffer.readUInt32LE(offset);
      let b = buffer.readUInt32LE(offset + 4);
      b *= 0x100000000;
      return b + a;
    }

    function readSlice(n) {
      offset += n;
      return buffer.slice(offset - n, offset);
    }

    function readUInt32() {
      const i = buffer.readUInt32LE(offset);
      offset += 4;
      return i;
    }

    function readInt32() {
      const i = buffer.readInt32LE(offset);
      offset += 4;
      return i;
    }

    function readUInt64() {
      const i = readUInt64LE(buffer, offset);
      offset += 8;
      return i;
    }

    function readVarInt() {
      const vi = _varuintBitcoin.default.decode(buffer, offset);

      offset += _varuintBitcoin.default.decode.bytes;
      return vi;
    }

    function readVarSlice() {
      return readSlice(readVarInt());
    }

    function readVector() {
      const count = readVarInt();
      const vector = [];

      for (let i = 0; i < count; i++) {
        vector.push(readVarSlice());
      }

      return vector;
    }

    const tx = new FLOTransaction();
    tx.version = readInt32();
    const marker = buffer.readUInt8(offset);
    const flag = buffer.readUInt8(offset + 1);
    let hasWitnesses = false;

    if (marker === _bitcoinjsLib.Transaction.ADVANCED_TRANSACTION_MARKER && flag === _bitcoinjsLib.Transaction.ADVANCED_TRANSACTION_FLAG) {
      offset += 2;
      hasWitnesses = true;
    }

    const vinLen = readVarInt();

    for (let i = 0; i < vinLen; ++i) {
      tx.ins.push({
        hash: readSlice(32),
        index: readUInt32(),
        script: readVarSlice(),
        sequence: readUInt32(),
        witness: EMPTY_WITNESS
      });
    }

    const voutLen = readVarInt();

    for (let i = 0; i < voutLen; ++i) {
      tx.outs.push({
        value: readUInt64(),
        script: readVarSlice()
      });
    }

    if (hasWitnesses) {
      for (let i = 0; i < vinLen; ++i) {
        tx.ins[i].witness = readVector();
      } // was this pointless?


      if (!tx.hasWitnesses()) {
        throw new Error('Transaction has superfluous witness data');
      }
    }

    tx.locktime = readUInt32();

    if (tx.version >= 2) {
      tx.floData = readVarSlice();
    }

    if (_NO_STRICT) {
      return tx;
    }

    if (offset !== buffer.length) {
      throw new Error('Transaction has unexpected data');
    }

    return tx;
  }

  static fromHex(hex) {
    return FLOTransaction.fromBuffer(Buffer.from(hex, 'hex'));
  }
  /**
   * Serialize the Transaction to a Buffer
   * @param  {Buffer} buffer         - The Buffer to use while building
   * @param  {Integer} initialOffset  - The initial offset of the buffer
   * @param  {Boolean} __allowWitness -Should Witness be used in the serialization
   * @return {Buffer} Returns the TX as a Buffer
   */


  __toBuffer(buffer, initialOffset, __allowWitness, options) {
    if (!buffer) {
      buffer = Buffer.allocUnsafe(this.__byteLength(__allowWitness, options));
    }

    _bitcoinjsLib.Transaction.prototype.__toBuffer.call(this, buffer, initialOffset, __allowWitness); // Included for testing transaction signatures, and legacy signature hashing


    if (options && options.excludeFloData || this.version < 2) {
      return buffer;
    } // Calculate where we left off


    let offset = this.__byteLength(__allowWitness, options) - (this.floData.length + _varuintBitcoin.default.encode(this.floData.length).length); // Add the varint for the floData length


    _varuintBitcoin.default.encode(this.floData.length, buffer, offset);

    offset += _varuintBitcoin.default.encode.bytes; // Append the floData itself

    this.floData.copy(buffer, offset); // Return the built transaciton Buffer

    return buffer;
  }

  hashForSignature(inIndex, prevOutScript, hashType, options) {
    // https://github.com/bitcoin/bitcoin/blob/master/src/test/sighash_tests.cpp#L29
    if (inIndex >= this.ins.length) {
      return ONE;
    }

    let ourScript = _bitcoinjsLib.script.compile(_bitcoinjsLib.script.decompile(prevOutScript).filter(x => {
      return x !== _bitcoinjsLib.script.OPS.OP_CODESEPARATOR;
    }));

    let txTmp = this.clone(); // SIGHASH_NONE: ignore all outputs? (wildcard payee)

    if ((hashType & 0x1f) === _bitcoinjsLib.Transaction.SIGHASH_NONE) {
      txTmp.outs = []; // ignore sequence numbers (except at inIndex)

      txTmp.ins.forEach((input, i) => {
        if (i === inIndex) {
          return;
        }

        input.sequence = 0;
      }); // SIGHASH_SINGLE: ignore all outputs, except at the same index?
    } else if ((hashType & 0x1f) === _bitcoinjsLib.Transaction.SIGHASH_SINGLE) {
      // https://github.com/bitcoin/bitcoin/blob/master/src/test/sighash_tests.cpp#L60
      if (inIndex >= this.outs.length) {
        return ONE;
      } // truncate outputs after


      txTmp.outs.length = inIndex + 1; // "blank" outputs before

      for (let i = 0; i < inIndex; i++) {
        txTmp.outs[i] = BLANK_OUTPUT;
      } // ignore sequence numbers (except at inIndex)


      txTmp.ins.forEach((input, y) => {
        if (y === inIndex) {
          return;
        }

        input.sequence = 0;
      });
    } // SIGHASH_ANYONECANPAY: ignore inputs entirely?


    if (hashType & _bitcoinjsLib.Transaction.SIGHASH_ANYONECANPAY) {
      txTmp.ins = [txTmp.ins[inIndex]];
      txTmp.ins[0].script = ourScript; // SIGHASH_ALL: only ignore input scripts
    } else {
      // "blank" others input scripts
      txTmp.ins.forEach(input => {
        input.script = EMPTY_SCRIPT;
      });
      txTmp.ins[inIndex].script = ourScript;
    } // serialize and hash


    let buffer = Buffer.alloc(txTmp.__byteLength(false, options) + 4);
    buffer.writeInt32LE(hashType, buffer.length - 4);

    txTmp.__toBuffer(buffer, 0, false, options);

    return _bitcoinjsLib.crypto.hash256(buffer);
  }

  hashForWitnessV0(inIndex, prevOutScript, value, hashType, options) {
    function writeUInt64LE(buffer, value, offset) {
      buffer.writeInt32LE(value & -1, offset);
      buffer.writeUInt32LE(Math.floor(value / 0x100000000), offset + 4);
      return offset + 8;
    }

    let tbuffer = Buffer.from([]);
    let toffset = 0;

    function writeSlice(slice) {
      toffset += slice.copy(tbuffer, toffset);
    }

    function writeUInt32(i) {
      toffset = tbuffer.writeUInt32LE(i, toffset);
    }

    function writeUInt64(i) {
      toffset = writeUInt64LE(tbuffer, i, toffset);
    }

    function writeVarInt(i) {
      _varuintBitcoin.default.encode(i, tbuffer, toffset);

      toffset += _varuintBitcoin.default.encode.bytes;
    }

    function writeVarSlice(slice) {
      writeVarInt(slice.length);
      writeSlice(slice);
    }

    function varSliceSize(someScript) {
      const length = someScript.length;
      return _varuintBitcoin.default.encodingLength(length) + length;
    }

    let hashOutputs = ZERO;
    let hashPrevouts = ZERO;
    let hashSequence = ZERO;

    if (!(hashType & _bitcoinjsLib.Transaction.SIGHASH_ANYONECANPAY)) {
      tbuffer = Buffer.allocUnsafe(36 * this.ins.length);
      toffset = 0;
      this.ins.forEach(txIn => {
        writeSlice(txIn.hash);
        writeUInt32(txIn.index);
      });
      hashPrevouts = _bitcoinjsLib.crypto.hash256(tbuffer);
    }

    if (!(hashType & _bitcoinjsLib.Transaction.SIGHASH_ANYONECANPAY) && (hashType & 0x1f) !== _bitcoinjsLib.Transaction.SIGHASH_SINGLE && (hashType & 0x1f) !== _bitcoinjsLib.Transaction.SIGHASH_NONE) {
      tbuffer = Buffer.allocUnsafe(4 * this.ins.length);
      toffset = 0;
      this.ins.forEach(txIn => {
        writeUInt32(txIn.sequence);
      });
      hashSequence = _bitcoinjsLib.crypto.hash256(tbuffer);
    }

    if ((hashType & 0x1f) !== _bitcoinjsLib.Transaction.SIGHASH_SINGLE && (hashType & 0x1f) !== _bitcoinjsLib.Transaction.SIGHASH_NONE) {
      const txOutsSize = this.outs.reduce((sum, output) => {
        return sum + 8 + varSliceSize(output.script);
      }, 0);
      tbuffer = Buffer.allocUnsafe(txOutsSize);
      toffset = 0;
      this.outs.forEach(out => {
        writeUInt64(out.value);
        writeVarSlice(out.script);
      });
      hashOutputs = _bitcoinjsLib.crypto.hash256(tbuffer);
    } else if ((hashType & 0x1f) === _bitcoinjsLib.Transaction.SIGHASH_SINGLE && inIndex < this.outs.length) {
      const output = this.outs[inIndex];
      tbuffer = Buffer.allocUnsafe(8 + varSliceSize(output.script));
      toffset = 0;
      writeUInt64(output.value);
      writeVarSlice(output.script);
      hashOutputs = _bitcoinjsLib.crypto.hash256(tbuffer);
    }

    tbuffer = Buffer.alloc(156 + varSliceSize(prevOutScript) + varSliceSize(this.floData));

    if (options && options.excludeFloData || this.version < 2) {
      tbuffer = Buffer.alloc(156 + varSliceSize(prevOutScript));
    }

    toffset = 0;
    const input = this.ins[inIndex];
    writeUInt32(this.version);
    writeSlice(hashPrevouts);
    writeSlice(hashSequence);
    writeSlice(input.hash);
    writeUInt32(input.index);
    writeVarSlice(prevOutScript);
    writeUInt64(value);
    writeUInt32(input.sequence);
    writeSlice(hashOutputs);
    writeUInt32(this.locktime);

    if (!(options && options.excludeFloData) && this.version >= 2) {
      writeVarSlice(this.floData);
    }

    writeUInt32(hashType);
    return _bitcoinjsLib.crypto.hash256(tbuffer);
  }

}

var _default = FLOTransaction;
exports.default = _default;