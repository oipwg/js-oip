import { sign } from 'bitcoinjs-message'
import { ECPair, payments, address } from 'bitcoinjs-lib'
import coinselect from 'coinselect'
import Insight from 'insight-explorer'

// This dependency was not found:
//
// * fs in ./node_modules/bindings/bindings.js
import floTx from 'fcoin/lib/primitives/tx'
import { isValidWIF } from '../../util'
import { floMainnet, floTestnet } from '../../config'
import FLOTransactionBuilder from '../flo/FLOTransactionBuilder'

if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
  if (typeof localStorage === 'undefined') { // eslint-disable-line
    // var is needed her for the javascript hoisting effect or else localstorage won't be scoped
    var LocalStorage = require('node-localstorage').LocalStorage
    var localStorage = new LocalStorage('./localStorage')
  }
} else {
  localStorage = window.localStorage
}

/**
 * @typedef {Object} utxo
 * @param {string} address - pay to public key hash (pub address)
 * @param {TXID} txid - transaction id
 * @param {number} vout - index of output in transaction
 * @param {string} scriptPubKey -  script which ensures that the script supplied in the redeeming transaction hashes to the script used to create the address
 * @param {number} amount - the amount spent
 * @param {number} satoshis - the amount spent in satoshis
 * @param {number} height - the block height of the transaction
 * @param {number} confirmations - number of blocks that have been confirmed after the transaction's block
 *
 * @example
 * {
 *     address: 'ofbB67gqjgaYi45u8Qk2U3hGoCmyZcgbN4',
 *     txid: '40bf49a02731b04b71951d2e7782b93bd30678c5f5608f0cfe9cdaed6d392903',
 *     vout: 1,
 *     scriptPubKey: '76a914f93aef4f4ef998b7ae44bd5bc8f6627b79cdc07588ac',
 *     amount: 659.9999325,
 *     satoshis: 65999993250,
 *     height: 295680,
 *     confirmations: 6933
 * }
 */

/**
 * Class to use a web explorer wallet
 */
class ExplorerWallet {
  /**
   * ##### Example
   * ```javascript
   * import {OIP} from 'js-oip'
   *
   * let wif = "cRVa9rNx5N1YKBw8PhavegJPFCiYCfC4n8cYmdc3X1Y6TyFZGG4B"
   * let oip = new OIP(wif, "testnet")
   * ```
   * @param {string} options.wif - private key in Wallet Import Format (WIF) see: {@link https://en.bitcoin.it/wiki/Wallet_import_format}
   * @param {string} [options.network="mainnet"] - Use "testnet" for testnet
   */
  // ToDo:: Switch to mainnet for prod
  constructor (options) {
    let network = floMainnet

    if (options.network === 'testnet') { network = floTestnet }

    if (options.explorerUrl) { network.explorer = new Insight(options.explorerUrl) }

    if (!isValidWIF(options.wif, network.network)) {
      return { success: false, message: 'Invalid WIF', wif: options.wif, network: network.network }
    }

    this.coin = network
    this.network = network.network
    this.explorer = network.explorer
    this.ECPair = ECPair.fromWIF(options.wif, this.network)
    this.p2pkh = payments.p2pkh({ pubkey: this.ECPair.publicKey, network: this.network }).address
    this.spentTransactions = []
    this.history = []

    this.deserialize()
  }

  onConfirmation({ txids, record }, options) {
    console.warn(`[ExplorerWallet] Error! ExplorerWallet does not support the onConfirmation function!`)
  }

  signMessage (message) {
    let privateKeyBuffer = this.ECPair.privateKey

    let compressed = this.ECPair.compressed || true

    let signatureBuffer
    try {
      signatureBuffer = sign(message, privateKeyBuffer, compressed, this.ECPair.network.messagePrefix)
    } catch (e) {
      throw new Error(e)
    }

    let signature = signatureBuffer.toString('base64')

    return signature
  }

  /**
   * Send string data to the FLO Chain
   * @param {string} data - String data. Must be below or equal to 1040 characters
   * @return {Promise<string>} txid - Returns the id of the transaction that contains the published data
   * @example
   * let oip = new OIP(wif, "testnet")
   * let txid = await oip.sendDataToChain('Hello, world')
   */
  async sendDataToChain (data) {
    if (typeof data !== 'string') {
      throw new Error(`Data must be of type string. Got: ${typeof data}`)
    }
    if (data.length > 1040) {
      throw new Error(`Error: data length exceeds 1040 characters. Try using OIPPublisher.publish(data) instead.`)
    }
    let hex
    try {
      hex = await this.buildTXHex(data)
    } catch (err) {
      throw new Error(`Error building TX Hex: ${err}`)
    }
    let txid
    try {
      txid = await this.broadcastRawHex(hex)
    } catch (err) {
      throw new Error(`Error broadcasting TX Hex: ${err}`)
    }

    // Add txid to spentTransactions for each spent input
    for (let inp of this.selected.inputs) {
      if (this.p2pkh === inp.address) {
        this.addSpentTransaction(inp.txId)
      }
    }

    this.save(txid, hex)

    return txid
  }

  /**
   * Build a valid FLO Raw TX Hex containing floData
   * @param {String} [floData=""] - String data to send with tx. Defaults to an empty string
   * @param {object|Array.<object>} [output] - Custom output object
   * @return {Promise<string>} hex - Returns raw transaction hex
   * @example
   * //if no output is designed, it will send 0.0001 * 1e8 FLO to yourself
   * let output = {
   *     address: "ofbB67gqjgaYi45u8Qk2U3hGoCmyZcgbN4",
   *     value: 1e8 //satoshis
   * }
   * let op = new OIP(wif, "testnet")
   * let hex = await op.buildTXHex("floData", output)
   */
  async buildTXHex (floData = '', output) {
    let selected
    try {
      selected = await this.buildInputsAndOutputs(floData, output)
    } catch (err) {
      throw new Error(`Failed to build inputs and outputs: ${err}`)
    }

    this.selected = selected
    // console.log('selected: ', selected)
    let { inputs, outputs } = selected

    // inputs and outputs will be undefined if no solution was found
    if (!inputs || !outputs) {
      throw new Error('No Inputs or Outputs selected! Fail!')
    }

    let txb = new FLOTransactionBuilder(this.network)

    inputs.forEach(input => txb.addInput(input.txId, input.vout))

    // Check if we are paying to ourself, if so, merge the outputs to just a single output.
    // Check if we have two outputs (i.e. pay to and change)
    if (outputs.length === 2) {
      // If the first input is sending to the from address, and there is a change output,
      // then merge the outputs.
      if (outputs[0].address === this.p2pkh && !outputs[1].address) {
        let totalToSend = outputs[0].value + outputs[1].value
        outputs = [{
          address: this.p2pkh,
          value: totalToSend
        }]
      } else {
        // send the original amount to the first address and send the rest to yourself as change
        if (outputs[0].address !== this.p2pkh && !outputs[1].address) {
          outputs[1].address = this.p2pkh
        }
      }
    }

    outputs.forEach(output => {
      if (!output.address) {
        throw new Error(`Missing output address: ${outputs}`)
      }
      txb.addOutput(output.address, output.value)
    })

    txb.setFloData(floData)

    for (let i in inputs) {
      if (this.p2pkh !== inputs[i].address) throw new Error(`Invalid inputs. Addresses don't match: ${inputs} & ${this.p2pkh}`)
      txb.sign(parseInt(i), this.ECPair)
    }

    let builtHex

    try {
      builtHex = txb.build().toHex()
    } catch (err) {
      throw new Error(`Unable to build Transaction Hex!: ${err}`)
    }

    return builtHex
  }

  /**
   * Builds the inputs and outputs to form a valid transaction hex for the FLO Chain
   * @param {string} [floData=""] - defaults to an empty string
   * @param {object|Array.<object>} [outputs] - Output or an array of Outputs to send to
   * @return {Promise<Object>} Returns the selected inputs, outputs, and fee to use for the transaction hex
   * @example
   * //basic
   * let oip = new OIP(wif, "testnet")
   * let selected = await oip.buildInputsAndOutputs("floData") //returns selected inputs, outputs, and fee
   * @example
   * //with custom output and object destructuring
   * let oip = new OIP(wif, "testnet")
   * let output = {
   *     address: "ofbB67gqjgaYi45u8Qk2U3hGoCmyZcgbN4",
   *     value: 1e8 //in satoshis
   * }
   * let {inputs, outputs, fee} = await oip.buildInputsAndOutputs("floData", output)
   */
  async buildInputsAndOutputs (floData = '', outputs) {
    let utxo
    try {
      utxo = await this.getUTXO()
    } catch (err) {
      throw new Error(`Failed to get utxo: ${err}`)
    }

    // backup in case insight api hasn't given us updated responses
    if (utxo.length === 0) {
      let start = Date.now(); let finish = 0
      console.log('Insight API returned stale results. Waiting on Insight API for update...')
      while (utxo.length === 0 && finish < 6000) {
        // console.log('while', finish)
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
        await delay(500)
        try {
          utxo = await this.getUTXO()
        } catch (err) {
          throw new Error(`Failed to get utxo from insight explorer: ${err}`)
        }
        finish = Date.now() - start
      }
    }

    let formattedUtxos
    if (utxo.length === 0) {
      // second backup in case insight really is not liking us
      console.log('Insight API failed to update. Attempting to manually create utxos...')
      formattedUtxos = this.createManualUtxos()
      if (formattedUtxos.length === 0) {
        throw new Error(`P2PKH: ${this.p2pkh} has no unspent transaction outputs`)
      }
    } else {
      formattedUtxos = utxo.map(utxo => {
        return {
          address: utxo.address,
          txId: utxo.txid,
          vout: utxo.vout,
          scriptPubKey: utxo.scriptPubKey,
          value: utxo.satoshis,
          confirmations: utxo.confirmations
        }
      })
    }

    // console.log('formatted utxos', formattedUtxos)

    outputs = outputs || {
      address: this.p2pkh,
      value: Math.floor(0.0001 * this.coin.satPerCoin)
    }

    if (!Array.isArray(outputs)) {
      outputs = [outputs]
    }
    let targets = outputs

    let extraBytes = this.coin.getExtraBytes({ floData })
    let extraBytesLength = extraBytes.length

    // console.log(formattedUtxos)

    // let utxosNoUnconfirmed = formattedUtxos.filter(utx => utx.confirmations > 0) //ToDo

    // console.log(utxosNoUnconfirmed)

    let selected = coinselect(formattedUtxos, targets, Math.ceil(this.coin.feePerByte), extraBytesLength)

    // Check if we are able to build inputs/outputs off only unconfirmed transactions with confirmations > 0
    if (!selected.inputs || selected.inputs.length === 0 || !selected.outputs || selected.outputs.length === 0 || !selected.fee) {
      selected = coinselect(formattedUtxos, targets, Math.ceil(this.coin.feePerByte), extraBytesLength)
    }

    return selected
  }

  /**
   * Get Unspent Transaction Outputs for the given keypair
   * @return {Promise<Array.<utxo>>}
   * @example
   * const wif = 'cRVa9rNx5N1YKBw8PhavegJPFCiYCfC4n8cYmdc3X1Y6TyFZGG4B'
   * let oip = new OIP(wif, "testnet")
   * let utxos = await oip.getUTXO()
   * for (let tx of utxos) {
   *     console.log(tx)
   *     // [ { address: 'ofbB67gqjgaYi45u8Qk2U3hGoCmyZcgbN4',
   *     //     txid: '40bf49a02731b04b71951d2e7782b93bd30678c5f5608f0cfe9cdaed6d392903',
   *     //     vout: 1,
   *     //     scriptPubKey: '76a914f93aef4f4ef998b7ae44bd5bc8f6627b79cdc07588ac',
   *     //     amount: 659.9999325,
   *     //     satoshis: 65999993250,
   *     //     height: 295680,
   *     //     confirmations: 5706
   *     //  } ]
   * }
   */
  async getUTXO () {
    let utxo
    try {
      utxo = await this.explorer.getAddressUtxo(this.p2pkh)
    } catch (err) {
      throw new Error(`Error fetching UTXOs: ${err}`)
    }
    // console.log('preutxo: ', utxo)
    // console.log(utxo, this.getSpentTransactions())

    return this.removeSpent(utxo)
  }

  /**
   * Removes already spent transactions (that are kept in local memory)
   * @param {Array.<utxo>} unspentTransactions - An array of utxos
   * @return {Array.<utxo>}
   * @example
   * //shouldn't ever have to write this. Use `OIP.getUTXO()` instead
   * let oip = new OIP(wif, 'testnet')
   * let utxo
   * try {
   *     utxo = await oip.explorer.getAddressUtxo(pubAddr)
   * } catch (err) {
   *     throw new Error(`${err}`)
   * }
   * return oip.removeSpent(utxo)
   */
  removeSpent (unspentTransactions) {
    if (!unspentTransactions || !Array.isArray(unspentTransactions)) { return }

    let unspent = []

    for (let tx of unspentTransactions) {
      let spent = false
      for (let txid of this.getSpentTransactions()) {
        if (txid === tx.txid) {
          spent = true
        }
      }

      if (!spent) { unspent.push(tx) }
    }

    return unspent
  }

  /**
   * Manually create Unspent Transaction Outputs from previous known transactions.
   * Loops through spent transaction IDs in localStorage and created txs to find outputs to use.
   * @return {Array.<utxo>}
   */
  createManualUtxos () {
    // console.log('manually creating utxos')
    let unspents = []
    for (let txObj of this.history) {
      let match = false
      for (let tx of this.getSpentTransactions()) {
        for (let txid in txObj) {
          if (txid === tx) {
            match = true
          }
        }
      }
      if (!match) {
        // console.log(txObj)
        unspents.push(txObj)
      }
    }

    let floTxs = []
    for (let txObj of unspents) {
      for (let txid in txObj) {
        floTxs.push(floTx.fromRaw(txObj[txid], 'hex'))
      }
    }

    // console.log(floTxs)
    let utxos = []
    for (let f of floTxs) {
      // console.log(f)
      let outputs = f.outputs

      for (let i = 0; i < outputs.length; i++) {
        let addr = outputs[i].getAddress()
        // console.log(addr)
        if (Array.isArray(addr)) {
          throw new Error(`Can't handle array output`)
        }
        // convert mainnet addr -> testnet addr
        addr = addr.toBase58()
        let { hash } = address.fromBase58Check(addr)
        let testnetAddr = address.toBase58Check(hash, 115)
        if (testnetAddr === this.p2pkh) {
          let tmpObj = {
            address: testnetAddr,
            txId: f.txid(),
            vout: i,
            value: outputs[i].value,
            scriptPubKey: outputs[i].script.toRaw().toString('hex'),
            confirmations: 0
          }
          // console.log(tmpObj)
          utxos.push(tmpObj)
        }
      }
    }
    return utxos
  }

  /**
   * Add a spent transaction to local memory
   * @param {TXID} txid - transaction id
   * @return {void}
   * @example
   * let oip = new OIP(wif,  "testnet")
   * let output = {
   *     address: "oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S",
   *     value: Math.floor(0.001 * floTestnet.satPerCoin)
   * }
   * let txid = await oip.createAndSendFloTx(output, "sending floData to testnet")
   * oip.addSpentTransaction(txid)
   * let spentTxs = oip.getSpentTransactions()
   * spentTxs === [txid] //true
   */
  addSpentTransaction (txid) {
    this.spentTransactions.push(txid)
  }

  /**
   * Returns an array of spent transaction ids
   * @return {Array.<TXID>}
   * @example
   * let oip = new OIP(wif, "testnet")
   * oip.addSpentTransaction(txid)
   * let txids = oip.getSpentTransactions()
   * txids = [txid] //true
   */
  getSpentTransactions () {
    return this.spentTransactions
  }

  /**
   * Broadcast raw transaction hex to the FLO chain
   * @param hex
   * @return {Promise<string>} txid - Returns a transaction id
   */
  async broadcastRawHex (hex) {
    let response
    try {
      response = await this.explorer.broadcastRawTransaction(hex)
    } catch (err) {
      throw new Error(`Failed to broadcast TX Hex: ${err}`)
    }
    let txid

    /** Handle { txid: "txid" } */
    if (response && typeof response.txid === 'string') { txid = response.txid }

    /**
     * Handle
     * {
     *    txid: {
     *        result: '05d2dd88d69cc32717d315152bfb474b0b1b561ae9a477aae091714c4ab216ac',
     *        error: null,
     *        id: 47070
     *     }
     * }
     */
    if (response && response.txid && response.txid.result) {
      txid = response.txid.result
    }

    /**
     * Handle
     * {
     *     result: '05d2dd88d69cc32717d315152bfb474b0b1b561ae9a477aae091714c4ab216ac',
     *     error: null,
     *     id: 47070
     * }
     */
    if (response && response.result) {
      txid = response.result
    }

    return txid
  }

  /**
   * Create and send a FLO tx with a custom output
   * @param {object|Array.<object>} outputs
   * @param {string} floData
   * @return {Promise<TXID>}
   * @example
   * let oip = new OIP(wif, "testnet")
   * let output = {
   *     address: "oNAydz5TjkhdP3RPuu3nEirYQf49Jrzm4S",
   *     value: 100000000
   * }
   * let txid = await oip.createAndSendFloTx(output, "to testnet")
   */
  async sendTx (outputs, floData = '') {
    if (floData && typeof floData !== 'string') {
      throw new Error(`Data must be of type string. Got: ${typeof floData}`)
    }
    if (floData.length > 1040) {
      return `Error: data length exceeds 1040 characters.`
    }
    let hex
    try {
      hex = await this.buildTXHex(floData, outputs)
    } catch (err) {
      throw new Error(`Error building TX Hex: ${err}`)
    }
    let txid
    try {
      txid = await this.broadcastRawHex(hex)
    } catch (err) {
      throw new Error(`Error broadcasting TX Hex: ${err}`)
    }

    // Add txid to spentTransactions for each spent input
    for (let inp of this.selected.inputs) {
      if (this.p2pkh === inp.address) {
        this.addSpentTransaction(inp.txId)
      }
    }

    this.save(txid, hex)

    return txid
  }

  /**
   * Saves a transaction to localStorage and memory
   * @param {string} txid
   * @param {string} hex
   * @example
   * let oip = new OIP(wif)
   * oip.save(`${txid}`, `${hex}`)
   */
  save (txid, hex) {
    let tmpObj = {}
    tmpObj[txid] = hex

    this.history.push(tmpObj)
    this.serialize()
  }

  /**
   * Stores important local variables to localStorage such as spent transactions and publish history
   * @example
   * let oip = new OIP(wif)
   * oip.serialize() //saves this.spentTransactions and this.history to localStorage memory
   */
  serialize () {
    let serialized = {
      spentTransactions: this.spentTransactions,
      history: this.history
    }

    localStorage.setItem('tx_history', JSON.stringify(serialized))
  }

  /**
   * Imports publisher history from localStorage
   * @example
   * let oip = new OIP(wif)
   * oip.deserialize() //sets this.spentTransactions and this.history from localStorage memory variables
   */
  deserialize () {
    let deserialized = JSON.parse(localStorage.getItem('tx_history'))
    if (!deserialized) { deserialized = {} }

    if (deserialized.spentTransactions) {
      this.spentTransactions = deserialized.spentTransactions
    }

    if (deserialized.history) {
      this.history = deserialized.history
    }
  }

  /**
   * Returns tx history variables
   * @example
   * let oip = new OIP(wif)
   * oip.getTxHistory()
   * //returns
   * // {
   * //   history: this.history,
   * //   spentTransactions: this.spentTransactions
   * // }
   * @return {{history: Array, spentTransactions: Array}}
   */
  getTxHistory () {
    return {
      history: this.history,
      spentTransactions: this.spentTransactions
    }
  }

  /**
   * WARNING!!! Deleting history may cause publishing to temporary fail as it might attempt to use spent transactions. Deletes the publisher history from localStorage
   * @example
   * let oip = new OIP(wif)
   * oip.deleteHistory()
   */
  deleteHistory () {
    localStorage.removeItem('tx_history')
    this.spentTransactions = []
    this.history = []
  }

  /**
   * Returns the pay-to-pubkey-hash address generated from the given wif
   * @return {string}
   */
  getPubAddress () {
    return this.p2pkh
  }

  /**
   * Returns the ECPair (private/public key pair) generated from the given wif
   * @return {object}
   */
  getECPair () {
    return this.ECPair
  }

  /**
   * Returns information about the current coin (either FLO or FLO_Testnet)
   * @return {CoinInfo}
   */
  getCoinInfo () {
    return this.coin
  }

  /**
   * Returns coin network information needed for address generation
   * @return {CoinNetwork}
   */
  getNetwork () {
    return this.network
  }
}

export default ExplorerWallet
