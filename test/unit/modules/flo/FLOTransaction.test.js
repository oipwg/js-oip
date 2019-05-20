import { script as bscript, payments as bpayments, ECPair } from 'bitcoinjs-lib'

import FLOTransaction, { FLODATA_MAX_LEN } from '../../../../src/modules/flo/FLOTransaction'
import { floTestnet } from '../../../../src/config'

import sigHash from './sighash.json'
import txValid from './tx_valid.json'

const SIGHASH_OMIT_FLO_DATA = (1 << 6)

let sampleInput = {
  hash: Buffer.from('86231b8292f3fd690b21f0e831a7180bf1f5bd1b39c2f842a38c7c8d387db224', 'hex'),
  index: 0,
  sequence: 4294967295,
  scriptSig: Buffer.from('483045022100cac4c61ac071126fcac5b51726214202f0956c410eead184b22f6883869a1841022065cd8e469abcd8c0e7c0e5d809670698a6a13a6aefd27e79814569882bb2db3f01210335e488d552bb530f7ab29f910806c1a862c09fe2a098cef2a48ed79843b344ba', 'hex')
}

let sampleOutput = {
  scriptPubKey: Buffer.from('76a9141d418318d54ec91e231cd9295a3b67c40c99c3ca88ac', 'hex'),
  value: 99.99853750 * 100000000
}

describe('FLOcore Tests', () => {
  describe('sighash.json', () => {
    for (let sighashTestData of sigHash) {
      // Skip first line that defines thte format.
      if (sighashTestData.length === 1) { continue }

      // ["raw_transaction, script, input_index, hashType, signature_hash (result)"]
      let rawTransaction = sighashTestData[0]
      let script = sighashTestData[1]
      let inputNumber = sighashTestData[2]
      let hashType = sighashTestData[3]
      let signatureHash = sighashTestData[4]

      let hashTypes = []
      if ((hashType & 0x1f) === FLOTransaction.SIGHASH_NONE) hashTypes.push('SIGHASH_NONE')
      else if ((hashType & 0x1f) === FLOTransaction.SIGHASH_SINGLE) hashTypes.push('SIGHASH_SINGLE')
      else hashTypes.push('SIGHASH_ALL')
      if (hashType & FLOTransaction.SIGHASH_ANYONECANPAY) hashTypes.push('SIGHASH_ANYONECANPAY')
      if (hashType & SIGHASH_OMIT_FLO_DATA) hashTypes.push('SIGHASH_OMIT_FLO_DATA')

      let hashTypeName = hashTypes.join(' | ')

      test(`should hash ${rawTransaction.slice(0, 40)} (${hashTypeName})`, () => {
        let tx = FLOTransaction.fromHex(rawTransaction)

        expect(tx.toHex()).toBe(rawTransaction)

        let mySigHash = tx.hashForSignature(inputNumber, Buffer.from(script, 'hex'), hashType)
        let hashNoFloData = tx.hashForSignature(inputNumber, Buffer.from(script, 'hex'), hashType, { excludeFloData: true })

        expect(mySigHash.reverse().toString('hex')).toBe(signatureHash)

        if (tx.version >= 2) { expect(hashNoFloData.reverse().toString('hex')).not.toBe(signatureHash) } else { expect(hashNoFloData.reverse().toString('hex')).toBe(signatureHash) }
      })
    }
  })

  describe('tx_valid.json', () => {
    txValid.forEach(f => {
      // Objects that are only a single string are ignored
      if (f.length === 1) return

      const inputs = f[0]
      const fhex = f[1]
      //      const verifyFlags = f[2] // TODO: do we need to test this?

      test('can decode ' + fhex.slice(0, 40), () => {
        const transaction = FLOTransaction.fromHex(fhex)

        transaction.ins.forEach((txIn, i) => {
          const input = inputs[i]

          // reverse because test data is reversed
          const prevOutHash = Buffer.from(input[0], 'hex').reverse()

          expect(txIn.hash).toEqual(prevOutHash)
        })

        expect(transaction.toHex()).toBe(fhex)
      })
    })
  })
})

test('Fails on too much floData', () => {
  let floTX = new FLOTransaction()

  floTX.addInput(sampleInput.hash, sampleInput.index, sampleInput.sequence, sampleInput.scriptSig)

  floTX.addOutput(sampleOutput.scriptPubKey, sampleOutput.value)

  // Generate 100 zeros for the FloData
  let floData = ''
  while (Buffer.from(floData).length < (FLODATA_MAX_LEN + 1)) {
    floData += '0'
  }

  try {
    floTX.setFloData(floData)
    throw new Error('Error not thrown by setting floData! Test failed!')
  } catch (e) {
    expect(e.message).toBe('Attempted to set too much floData! Maximum is 1040, you tried 1041!')
  }
})

describe('Properly Calculates byteLength', () => {
  test('Empty floData', () => {
    let floTX = new FLOTransaction()

    floTX.addInput(sampleInput.hash, sampleInput.index, sampleInput.sequence, sampleInput.scriptSig)

    floTX.addOutput(sampleOutput.scriptPubKey, sampleOutput.value)

    let byteLength = floTX.__byteLength(false)

    // 192 without floData,
    // empty floData only appends varInt of 0
    expect(byteLength).toBe(192 + 1)
  })

  test('Partial floData', () => {
    let floTX = new FLOTransaction()

    floTX.addInput(sampleInput.hash, sampleInput.index, sampleInput.sequence, sampleInput.scriptSig)

    floTX.addOutput(sampleOutput.scriptPubKey, sampleOutput.value)

    // Generate 100 zeros for the FloData
    let floData = ''
    while (Buffer.from(floData).length < 256) {
      floData += '0'
    }

    floTX.setFloData(floData)

    let byteLength = floTX.__byteLength(false)

    // 192 without floData,
    // 256 bytes of floData appends a varInt of 3
    expect(byteLength).toBe(192 + 3 + 256)
  })

  test('Full floData', () => {
    let floTX = new FLOTransaction()

    floTX.addInput(sampleInput.hash, sampleInput.index, sampleInput.sequence, sampleInput.scriptSig)

    floTX.addOutput(sampleOutput.scriptPubKey, sampleOutput.value)

    // Generate 100 zeros for the FloData
    let floData = ''
    while (Buffer.from(floData).length < 1040) {
      floData += '0'
    }

    floTX.setFloData(floData)

    let byteLength = floTX.__byteLength(false)

    // 192 without floData,
    // 1040 bytes of floData appends a varInt of 3
    expect(byteLength).toBe(192 + 3 + 1040)
  })
})

describe('Transaction Serialization', () => {
  test('Empty floData', () => {
    let floTX = new FLOTransaction()

    floTX.addInput(sampleInput.hash, sampleInput.index, sampleInput.sequence, sampleInput.scriptSig)

    floTX.addOutput(sampleOutput.scriptPubKey, sampleOutput.value)

    let txBuffer = floTX.__toBuffer(false)

    expect(txBuffer.length).toBe(193)
    expect(txBuffer.toString('hex')).toBe(
      '020000000186231b8292f3fd690b21f0e831a7180bf1f5bd1b39c2f842a38c7c8d387db224000000006b483045022100cac4c61ac071126fcac5b51726214202f0956c410eead184b22f6883869a1841022065cd8e469abcd8c0e7c0e5d809670698a6a13a6aefd27e79814569882bb2db3f01210335e488d552bb530f7ab29f910806c1a862c09fe2a098cef2a48ed79843b344baffffffff01b6a80954020000001976a9141d418318d54ec91e231cd9295a3b67c40c99c3ca88ac00000000' +
      '00'
    )
  })

  test('Partial floData', () => {
    let floTX = new FLOTransaction()

    floTX.addInput(sampleInput.hash, sampleInput.index, sampleInput.sequence, sampleInput.scriptSig)

    floTX.addOutput(sampleOutput.scriptPubKey, sampleOutput.value)

    // Generate 100 zeros for the FloData
    let floData = ''
    while (Buffer.from(floData).length < 256) {
      floData += '0'
    }

    floTX.setFloData(floData)

    let txBuffer = floTX.__toBuffer(false)

    // 192 without floData,
    // 256 bytes of floData appends a varInt of 3
    expect(txBuffer.length).toBe(192 + 3 + 256)
    expect(txBuffer.toString('hex')).toBe(
      '020000000186231b8292f3fd690b21f0e831a7180bf1f5bd1b39c2f842a38c7c8d387db224000000006b483045022100cac4c61ac071126fcac5b51726214202f0956c410eead184b22f6883869a1841022065cd8e469abcd8c0e7c0e5d809670698a6a13a6aefd27e79814569882bb2db3f01210335e488d552bb530f7ab29f910806c1a862c09fe2a098cef2a48ed79843b344baffffffff01b6a80954020000001976a9141d418318d54ec91e231cd9295a3b67c40c99c3ca88ac00000000' +
      'fd0001' +
      Buffer.from(floData).toString('hex')
    )
  })

  test('Full floData', () => {
    let floTX = new FLOTransaction()

    floTX.addInput(sampleInput.hash, sampleInput.index, sampleInput.sequence, sampleInput.scriptSig)

    floTX.addOutput(sampleOutput.scriptPubKey, sampleOutput.value)

    // Generate 100 zeros for the FloData
    let floData = ''
    while (Buffer.from(floData).length < 1040) {
      floData += '0'
    }

    floTX.setFloData(floData)

    let txBuffer = floTX.__toBuffer(false)

    // 192 without floData,
    // 1040 bytes of floData appends a varInt of 3
    expect(txBuffer.length).toBe(192 + 3 + 1040)
    expect(txBuffer.toString('hex')).toBe(
      '020000000186231b8292f3fd690b21f0e831a7180bf1f5bd1b39c2f842a38c7c8d387db224000000006b483045022100cac4c61ac071126fcac5b51726214202f0956c410eead184b22f6883869a1841022065cd8e469abcd8c0e7c0e5d809670698a6a13a6aefd27e79814569882bb2db3f01210335e488d552bb530f7ab29f910806c1a862c09fe2a098cef2a48ed79843b344baffffffff01b6a80954020000001976a9141d418318d54ec91e231cd9295a3b67c40c99c3ca88ac00000000' +
      'fd1004' +
      Buffer.from(floData).toString('hex')
    )
  })
})

describe('Signature Hash Calculation', () => {
  describe('Standard SignatureHash', () => {
    describe('SIGHASH_ALL', () => {
      test('Empty floData', () => {
        let floTX = new FLOTransaction()

        floTX.addInput(Buffer.from(sampleInput.hash), sampleInput.index, sampleInput.sequence, Buffer.from(sampleInput.scriptSig))

        floTX.addOutput(Buffer.from(sampleOutput.scriptPubKey), sampleOutput.value)

        // Default hashType is SIGHASH_ALL
        let txHash = floTX.hashForSignature(0, Buffer.from(sampleInput.scriptSig), FLOTransaction.SIGHASH_ALL)

        expect(txHash.toString('hex')).toBe('721521965b362e856f9418054bf8add86c857e698fef1f2c05e7cd52d2ac2278')
      })

      test('Partial floData', () => {
        let floTX = new FLOTransaction()

        floTX.addInput(sampleInput.hash, sampleInput.index, sampleInput.sequence, Buffer.from(sampleInput.scriptSig))

        floTX.addOutput(sampleOutput.scriptPubKey, sampleOutput.value)

        // Generate 100 zeros for the FloData
        let floData = ''
        while (Buffer.from(floData).length < 256) {
          floData += 'a'
        }

        floTX.setFloData(floData)

        // Default hashType is SIGHASH_ALL
        let txHash = floTX.hashForSignature(sampleInput.index, sampleInput.scriptSig, FLOTransaction.SIGHASH_ALL)

        expect(txHash.toString('hex')).toBe('be4a2101c50f202757a72d9ff71917cf671fda1186a522bfc0a56c177ec0cfaa')
      })

      test('Full floData', () => {
        let floTX = new FLOTransaction()

        floTX.addInput(sampleInput.hash, sampleInput.index, sampleInput.sequence, Buffer.from(sampleInput.scriptSig))

        floTX.addOutput(sampleOutput.scriptPubKey, sampleOutput.value)

        // Generate 100 zeros for the FloData
        let floData = ''
        while (Buffer.from(floData).length < 1040) {
          floData += 'a'
        }

        floTX.setFloData(floData)

        // Default hashType is SIGHASH_ALL
        let txHash = floTX.hashForSignature(sampleInput.index, sampleInput.scriptSig, FLOTransaction.SIGHASH_ALL)

        expect(txHash.toString('hex')).toBe('3dc473ca795438484ecc2875a61c8fdbef09162d049c00d99e279c2b89b7d263')
      })
    })
    describe('SIGHASH_NONE', () => {
      test('Empty floData', () => {
        let floTX = new FLOTransaction()

        floTX.addInput(Buffer.from(sampleInput.hash), sampleInput.index, sampleInput.sequence, Buffer.from(sampleInput.scriptSig))

        floTX.addOutput(Buffer.from(sampleOutput.scriptPubKey), sampleOutput.value)

        // Default hashType is SIGHASH_ALL
        let txHash = floTX.hashForSignature(0, Buffer.from(sampleInput.scriptSig), FLOTransaction.SIGHASH_NONE)

        expect(txHash.toString('hex')).toBe('61441a464abb52645c50442bd1b7d758756dbddde6e38df4f9407c270b6f74d2')
      })

      test('Partial floData', () => {
        let floTX = new FLOTransaction()

        floTX.addInput(sampleInput.hash, sampleInput.index, sampleInput.sequence, Buffer.from(sampleInput.scriptSig))

        floTX.addOutput(sampleOutput.scriptPubKey, sampleOutput.value)

        // Generate 100 zeros for the FloData
        let floData = ''
        while (Buffer.from(floData).length < 256) {
          floData += 'a'
        }

        floTX.setFloData(floData)

        // Default hashType is SIGHASH_ALL
        let txHash = floTX.hashForSignature(sampleInput.index, sampleInput.scriptSig, FLOTransaction.SIGHASH_NONE)

        expect(txHash.toString('hex')).toBe('b1ca7f8c99e9abbdf97a5f0e48498746ae3d8fc79139b7799aeb5a008f3a9648')
      })

      test('Full floData', () => {
        let floTX = new FLOTransaction()

        floTX.addInput(sampleInput.hash, sampleInput.index, sampleInput.sequence, Buffer.from(sampleInput.scriptSig))

        floTX.addOutput(sampleOutput.scriptPubKey, sampleOutput.value)

        // Generate 100 zeros for the FloData
        let floData = ''
        while (Buffer.from(floData).length < 1040) {
          floData += 'a'
        }

        floTX.setFloData(floData)

        // Default hashType is SIGHASH_ALL
        let txHash = floTX.hashForSignature(sampleInput.index, sampleInput.scriptSig, FLOTransaction.SIGHASH_NONE)

        expect(txHash.toString('hex')).toBe('1c32782d6ade20cbb874cc6c664cbdaf59a9f8b00b8bdcdbc11661a534fd56fb')
      })
    })

    describe('SIGHASH_ALL | SIGHASH_ANYONECANPAY', () => {
      let sighashType = FLOTransaction.SIGHASH_ALL
      sighashType |= FLOTransaction.SIGHASH_ANYONECANPAY

      expect((sighashType & 0x1f) === FLOTransaction.SIGHASH_NONE && (sighashType & 0x1f) === FLOTransaction.SIGHASH_SINGLE).toBe(false)
      expect(sighashType & FLOTransaction.SIGHASH_ANYONECANPAY).toBe(128)

      test('Empty floData', () => {
        let floTX = new FLOTransaction()

        floTX.addInput(Buffer.from(sampleInput.hash), sampleInput.index, sampleInput.sequence, Buffer.from(sampleInput.scriptSig))

        floTX.addOutput(Buffer.from(sampleOutput.scriptPubKey), sampleOutput.value)

        // Default hashType is SIGHASH_ALL
        let txHash = floTX.hashForSignature(0, Buffer.from(sampleInput.scriptSig), sighashType)

        expect(txHash.toString('hex')).toBe('a78eb05e59372991a4269c4fcd03d37052dc6e5e4219ea252fac99ad1a9227a9')
      })

      test('Partial floData', () => {
        let floTX = new FLOTransaction()

        floTX.addInput(sampleInput.hash, sampleInput.index, sampleInput.sequence, Buffer.from(sampleInput.scriptSig))

        floTX.addOutput(sampleOutput.scriptPubKey, sampleOutput.value)

        // Generate 100 zeros for the FloData
        let floData = ''
        while (Buffer.from(floData).length < 256) {
          floData += 'a'
        }

        floTX.setFloData(floData)

        // Default hashType is SIGHASH_ALL
        let txHash = floTX.hashForSignature(sampleInput.index, sampleInput.scriptSig, sighashType)

        expect(txHash.toString('hex')).toBe('bbf3818f4009b3420f2bec654bb1d296d62d171d3b3dbad08028456489468ff1')
      })

      test('Full floData', () => {
        let floTX = new FLOTransaction()

        floTX.addInput(sampleInput.hash, sampleInput.index, sampleInput.sequence, Buffer.from(sampleInput.scriptSig))

        floTX.addOutput(sampleOutput.scriptPubKey, sampleOutput.value)

        // Generate 100 zeros for the FloData
        let floData = ''
        while (Buffer.from(floData).length < 1040) {
          floData += 'a'
        }

        floTX.setFloData(floData)

        // Default hashType is SIGHASH_ALL
        let txHash = floTX.hashForSignature(sampleInput.index, sampleInput.scriptSig, sighashType)

        expect(txHash.toString('hex')).toBe('72e0a37a8d5f55c915bd970d32f9153bb9a3597a445ffec478df7637264ecdf6')
      })
    })
  })
  describe('Segwit SignatureHash', () => {
    test('Empty floData', () => {
      let floTX = new FLOTransaction()

      floTX.addInput(Buffer.from(sampleInput.hash), sampleInput.index, sampleInput.sequence, Buffer.from(sampleInput.scriptSig))

      floTX.addOutput(Buffer.from(sampleOutput.scriptPubKey), sampleOutput.value)

      // Default hashType is SIGHASH_ALL
      let txHash = floTX.hashForWitnessV0(0, Buffer.from(sampleInput.scriptSig), FLOTransaction.SIGHASH_ALL)

      expect(txHash.toString('hex')).toBe('de3559a24316aa4323b5e505e1aa400205f7b65201394a417eb284f629c742d7')
    })

    test('Partial floData', () => {
      let floTX = new FLOTransaction()

      floTX.addInput(sampleInput.hash, sampleInput.index, sampleInput.sequence, Buffer.from(sampleInput.scriptSig))

      floTX.addOutput(sampleOutput.scriptPubKey, sampleOutput.value)

      // Generate 100 zeros for the FloData
      let floData = ''
      while (Buffer.from(floData).length < 256) {
        floData += 'a'
      }

      floTX.setFloData(floData)

      // Default hashType is SIGHASH_ALL
      let txHash = floTX.hashForWitnessV0(sampleInput.index, sampleInput.scriptSig, FLOTransaction.SIGHASH_ALL)

      expect(txHash.toString('hex')).toBe('714fbd949cda3121d437267417a2db6c95171b8d2ba89daa1fdb6b0a40252baa')
    })

    test('Full floData', () => {
      let floTX = new FLOTransaction()

      floTX.addInput(sampleInput.hash, sampleInput.index, sampleInput.sequence, Buffer.from(sampleInput.scriptSig))

      floTX.addOutput(sampleOutput.scriptPubKey, sampleOutput.value)

      // Generate 100 zeros for the FloData
      let floData = ''
      while (Buffer.from(floData).length < 1040) {
        floData += 'a'
      }

      floTX.setFloData(floData)

      // Default hashType is SIGHASH_ALL
      let txHash = floTX.hashForWitnessV0(sampleInput.index, sampleInput.scriptSig, FLOTransaction.SIGHASH_ALL)

      expect(txHash.toString('hex')).toBe('1e81da53703a9cb8d98a7bf07edcebeeeeed3a6ca6d5e1a5e7cd76d797dead48')
    })
  })
})

describe('Transaction Signature Validation', () => {
  test('floData is included in transaction signature', () => {
    let txHex = '020000000175336521eafc16db3756792832d89745d779159295a976aede9bd0294f265bd9010000006b483045022100e14ea6214946de1b0098b919db955ed5b72a4b6ebee2633a7b274b33a178ece102201997f9ef66b2f941047f7d71913ecb0d95c399dcf9a896dcbbdfe17ec1344f6a01210235dbc5de310bde64bf53276d93f5347d55bd5b1f64c4885039b5bfd8afe2dfa7ffffffff01c09ee605000000001976a914b7d946f6088b9d05b5249e8503f9d202bfffc01588ac00000000fd1c02616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161'

    let tx = FLOTransaction.fromHex(txHex)

    let inputNumber = 0
    for (let input of tx.ins) {
      // Grab pubkey from input script
      let pubkey = Buffer.alloc(33)
      let scriptBuffer = Buffer.from(input.script)
      scriptBuffer.copy(pubkey, 0, scriptBuffer.length - 33, scriptBuffer.length)

      let keyPair = ECPair.fromPublicKey(pubkey, floTestnet.network)

      let p2pkh = bpayments.p2pkh({
        pubkey: keyPair.publicKey,
        input: input.script
      })

      let ss = bscript.signature.decode(p2pkh.signature)
      let hash = tx.hashForSignature(inputNumber, p2pkh.output, ss.hashType)
      let hashNoFloData = tx.hashForSignature(inputNumber, p2pkh.output, ss.hashType, { excludeFloData: true })

      expect(keyPair.verify(hash, ss.signature)).toBe(true)
      expect(keyPair.verify(hashNoFloData, ss.signature)).toBe(false)

      inputNumber++
    }
  })
})
