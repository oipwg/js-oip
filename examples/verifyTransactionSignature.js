const { script, payments, ECPair } = require('bitcoinjs-lib')

const FLOTransaction = require('../lib/modules/flo/FLOTransaction').default
const { floTestnet } = require('../lib/config')

let txHex = '020000000175336521eafc16db3756792832d89745d779159295a976aede9bd0294f265bd9010000006b483045022100e14ea6214946de1b0098b919db955ed5b72a4b6ebee2633a7b274b33a178ece102201997f9ef66b2f941047f7d71913ecb0d95c399dcf9a896dcbbdfe17ec1344f6a01210235dbc5de310bde64bf53276d93f5347d55bd5b1f64c4885039b5bfd8afe2dfa7ffffffff01c09ee605000000001976a914b7d946f6088b9d05b5249e8503f9d202bfffc01588ac00000000fd1c02616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161'

let tx = FLOTransaction.fromHex(txHex)

let inputNumber = 0
for (let input of tx.ins) {
  inputNumber++
  console.log('Input #' + inputNumber)

  // Grab pubkey from input script
  let pubkey = Buffer.alloc(33)
  let scriptBuffer = Buffer.from(input.script)
  scriptBuffer.copy(pubkey, 0, scriptBuffer.length - 33, scriptBuffer.length)

  let keyPair = ECPair.fromPublicKey(pubkey, floTestnet.network)

  let p2pkh = payments.p2pkh({
    pubkey: keyPair.publicKey,
    input: input.script
  })

  let ss = script.signature.decode(p2pkh.signature)
  let hash = tx.hashForSignature((inputNumber - 1), p2pkh.output, ss.hashType)
  let hashNoFloData = tx.hashForSignature((inputNumber - 1), p2pkh.output, ss.hashType, { excludeFloData: true })
  let witnessHash = tx.hashForWitnessV0((inputNumber - 1), p2pkh.output, input.value, ss.hashType)
  let witnessHashNoFloData = tx.hashForWitnessV0((inputNumber - 1), p2pkh.output, input.value, ss.hashType, { excludeFloData: true })

  console.log('Signature Hash with floData: ' + hash.toString('hex') + ' (match=' + keyPair.verify(hash, ss.signature) + ')')
  console.log('Signature Hash without floData: ' + hashNoFloData.toString('hex') + ' (match=' + keyPair.verify(hashNoFloData, ss.signature) + ')')
  console.log('Witness Signature Hash with floData: ' + witnessHash.toString('hex') + ' (match=' + keyPair.verify(witnessHash, ss.signature) + ')')
  console.log('Witness Signature Hash without floData: ' + witnessHashNoFloData.toString('hex') + ' (match=' + keyPair.verify(witnessHashNoFloData, ss.signature) + ')')
}
