import FloTransaction from '../../../../src/modules/flo/FloTransaction'

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

describe('Properly Calculates byteLength', () => {
  test('Empty floData', () => {
    let floTX = new FloTransaction()

    floTX.addInput(sampleInput.hash, sampleInput.index, sampleInput.sequence, sampleInput.scriptSig)

    floTX.addOutput(sampleOutput.scriptPubKey, sampleOutput.value)

    let byteLength = floTX.__byteLength(false)

    // 192 without floData,
    // empty floData only appends varInt of 0
    expect(byteLength).toBe(192 + 1)
  })

  test('Partial floData', () => {
    let floTX = new FloTransaction()

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
    let floTX = new FloTransaction()

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
    let floTX = new FloTransaction()

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
    let floTX = new FloTransaction()

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
    let floTX = new FloTransaction()

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
    test('Empty floData', () => {
      let floTX = new FloTransaction()

      floTX.addInput(Buffer.from(sampleInput.hash), sampleInput.index, sampleInput.sequence, Buffer.from(sampleInput.scriptSig))

      floTX.addOutput(Buffer.from(sampleOutput.scriptPubKey), sampleOutput.value)

      console.log(floTX.__toBuffer(false).toString('hex'))

      // Default hashType is SIGHASH_ALL
      let txHash = floTX.hashForSignature(0, Buffer.from(sampleInput.scriptSig), FloTransaction.SIGHASH_ALL)

      console.log(floTX)

      expect(txHash.toString('hex')).toBe('929c142dec219c51f8ea579d14f4b8669adf3b543897e2aef16401731b6bbf95')
    })

    test.only('Partial floData', () => {
      let floTX = new FloTransaction()

      floTX.addInput(sampleInput.hash, sampleInput.index, sampleInput.sequence, Buffer.from(sampleInput.scriptSig))

      floTX.addOutput(sampleOutput.scriptPubKey, sampleOutput.value)

      // Generate 100 zeros for the FloData
      let floData = ''
      while (Buffer.from(floData).length < 256) {
        floData += '0'
      }

      floTX.setFloData(floData)

      // Default hashType is SIGHASH_ALL
      let txHash = floTX.hashForSignature(sampleInput.index, sampleInput.scriptSig, FloTransaction.SIGHASH_ALL)

      expect(txHash.toString('hex')).toBe('9caaaf8bc158bfc2afb4d0750dcf8566dc31b68f427558d1de458575f0ed9ab7')
    })

    test('Full floData', () => {
      let floTX = new FloTransaction()

      floTX.addInput(sampleInput.hash, sampleInput.index, sampleInput.sequence, Buffer.from(sampleInput.scriptSig))

      floTX.addOutput(sampleOutput.scriptPubKey, sampleOutput.value)

      // Generate 100 zeros for the FloData
      let floData = ''
      while (Buffer.from(floData).length < 1040) {
        floData += '0'
      }

      floTX.setFloData(floData)

      // Default hashType is SIGHASH_ALL
      let txHash = floTX.hashForSignature(sampleInput.index, sampleInput.scriptSig, FloTransaction.SIGHASH_ALL)

      expect(txHash.toString('hex')).toBe('24d90b943bb1b2ea6f14311e2423b43ea3e3caab8931e9047b20c14ab28b4377')
    })
  })
  describe('Segwit SignatureHash', () => {

  })
})
