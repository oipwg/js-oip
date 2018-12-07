import bitcoin from "bitcoinjs-lib";
import {flo_testnet} from '../src/config'
import {Artifact} from '../src/modules/records/artifact'

//Step 1 - Create
let artifact = new Artifact()
artifact.setTitle('Test Artifact')
artifact.setDescription('Super Duper')


//Step 2 - Sign
let network = flo_testnet.network
const wif = 'cRVa9rNx5N1YKBw8PhavegJPFCiYCfC4n8cYmdc3X1Y6TyFZGG4B'
const ECPair = bitcoin.ECPair.fromWIF(wif, network)
// const p2pkh = bitcoin.payments.p2pkh({pubkey: ECPair.publicKey, network}).address
// let pubAddress = "ofbB67gqjgaYi45u8Qk2U3hGoCmyZcgbN4"
artifact.signSelf(ECPair)
console.log(artifact.serialize('publish'))

//Step 3 - Publish
export default artifact