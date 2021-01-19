import axios from 'axios'
import { sign } from 'bitcoinjs-message'
import { ECPair } from 'bitcoinjs-lib'

import { floMainnet, floTestnet, floRegtest } from '../../config'
import FLOTransactionBuilder from '../flo/FLOTransactionBuilder'
import { FLODATA_MAX_LEN } from '../flo/FLOTransaction'
import Peer from '../flo/Peer'
import { varIntBuffer } from '../../util'

// Helper const
const ONE_MB = 1000000
const ONE_SECOND = 1000
const ONE_MINUTE = 60 * ONE_SECOND

// 1 satoshis per byte (1000 satoshi per kb) (100 million satoshi in 1 FLO)
const TX_FEE_PER_BYTE = 0.00000001
// Average size of tx data (without floData) to calculate min txFee
const TX_AVG_BYTE_SIZE = 200
const SAT_PER_FLO = 100000000

// The minimum amount a utxo is allowed to be for us to use
const MIN_UTXO_AMOUNT = 1

// Prevent chaining over ancestor limit
const MAX_MEMPOOL_ANCESTORS = 1225
const MAX_MEMPOOL_ANCESTOR_SIZE = 1.50 * ONE_MB

// Timer lengths used to track and fix the Ancestor chain
const UPDATE_ANCESTOR_STATUS = 5 * ONE_SECOND
const REPAIR_ANCESTORS_AFTER = 1 * ONE_MINUTE // One FLO Block on average
const PEER_CONNECT_LENGTH = 2 * ONE_SECOND
const PEER_DESTROY_LENGTH = 5 * ONE_SECOND
const REBROADCAST_LENGTH = 10 * ONE_SECOND
const CONFIRMATION_CHECK_INTERVAL = 20 * ONE_SECOND
const CONFIRMATION_CHECK_UPDATE_ANCESTORS_AFTER = 5 * ONE_MINUTE
const CONFIRMATION_REBROADCAST_DELAY = 2 * ONE_MINUTE
const REPAIR_MIN_TX = 100

// List of all Wallet-Only RPC Methods
const WALLET_RPC_METHODS = [
  'selectwallet',
  'getwalletinfo',
  'fundrawtransaction',
  'resendwallettransactions',
  'abandontransaction',
  'addmultisigaddress',
  'addwitnessaddress',
  'backupwallet',
  'dumpprivkey',
  'dumpwallet',
  'encryptwallet',
  'getaccountaddress',
  'getaccount',
  'getaddressesbyaccount',
  'getbalance',
  'getnewaddress',
  'getrawchangeaddress',
  'getreceivedbyaccount',
  'getreceivedbyaddress',
  'gettransaction',
  'getunconfirmedbalance',
  'importprivkey',
  'importwallet',
  'importaddress',
  'importprunedfunds',
  'importpubkey',
  'keypoolrefill',
  'listaccounts',
  'listaddressgroupings',
  'lockunspent',
  'listlockunspent',
  'listreceivedbyaccount',
  'listreceivedbyaddress',
  'listsinceblock',
  'listtransactions',
  'listunspent',
  'move',
  'sendfrom',
  'sendmany',
  'sendtoaddress',
  'setaccount',
  'settxfee',
  'signmessage',
  'walletlock',
  'walletpassphrasechange',
  'walletpassphrase',
  'removeprunedfunds'
]

/**
 * Easily interact with an RPC Wallet to send Bulk transactions extremely quickly in series
 */
class RPCWallet {
  constructor (options) {
    // Store options for later
    this.options = options || {}

    // Set default network to livenet if unset
    if (!this.options.network) { this.options.network = 'livenet' }

    // Make sure we have connection to an RPC wallet
    if (!this.options.rpc) { throw new Error("RPC options ('options.rpc') are required with an RPC wallet!") }

    // Make sure we are being passed a public and private key pair
    if (!this.options.wif) { throw new Error('`wif` (a Private Key) is a required option in order to use RPC Wallet!') }
    if (!this.options.publicAddress) { throw new Error('`publicAddress` (the Public Address for the `wif`) is a required option in order to use RPC Wallet!') }

    // If the port is not set, default to Livenet (7313), otherwise if they passed the string "testnet" use the testnet port (17313)
    if (!this.options.rpc.port) {
      if (this.options.network && this.options.network === 'testnet') {
        this.options.rpc.port = 17313
      } else if (this.options.network && this.options.network === 'regtest') {
        this.options.rpc.port = 17413
      } else {
        this.options.rpc.port = 7313
      }
    }
    // If host is not set, use localhost
    if (!this.options.rpc.host) { this.options.rpc.host = 'localhost' }

    // Create the RPC connection using Axios
    this.rpc = axios.create({
      auth: {
        username: this.options.rpc.username,
        password: this.options.rpc.password
      },
      validateStatus: function (status) {
        if ([400, 401, 402, 403, 404].includes(status)) { return false }

        return true
      }
    })
    // Default to not being an fcoin RPC node
    this.fcoinRPC = false

    // Store the Private Key and the Public Key
    this.wif = this.options.wif
    this.publicAddress = this.options.publicAddress
    this.importPrivateKey = this.options.importPrivateKey || true

    // Store the "coin" network we should use
    if (this.options.network === 'livenet' || this.options.network === 'mainnet' || this.options.network === 'main') {
      this.coin = floMainnet
    } else if (this.options.network === 'testnet') {
      this.coin = floTestnet
    } else if (this.options.network === 'regtest') {
      this.coin = floRegtest
    }

    // Store information about our tx chain and the previous tx output
    this.unconfirmedTransactions = []
    this.unconfirmedTxids = []
    this.previousTXOutput = undefined
    this.onConfirmationSubscriptions = {}
    this.onConfirmationInterval = undefined
    this.lastTXTime = Date.now()

    // Initialize our initial peer array
    this.peers = []

    // Variables to count utxo ancestors (maximum number of unconfirmed transactions you can chain)
    this.currentAncestorCount = 0
    this.currentAncestorSize = 0

    // Repair mode tracker
    this.repairMode = false
    this.rebroadcasting = false
    this.checkingAncestorCount = false
  }

  /**
   * Make any RPC request
   * @param  {String} method - The RPC method you wish to call
   * @param  {Array} parameters - The parameters to pass to with RPC method you are calling
   * @return {Object} Returns the data response
   */
  async rpcRequest (method, parameters) {
    // Verify we have all the parameters we need
    if (!method) { throw new Error("rpcRequest parameter 'method' is Required!") }
    if (!parameters) { throw new Error("rpcRequest parameter 'parameters' is Required!") }

    // Perform the RPC request using Axios
    let rpcRequest
    try {
      // Make sure that rpcPort is an int so that we don't append 2 as a string to the port
      let rpcPort = parseInt(this.options.rpc.port)
      // If we are using an fcoin RPC, the wallet RPC runs on a different port (7315/17315 instead of 7313/17313)
      if (WALLET_RPC_METHODS.includes(method) && this.fcoinRPC) { rpcPort += 2 }

      // Attempt the RPC request
      rpcRequest = await this.rpc.post(`http://${this.options.rpc.host}:${rpcPort}/`, { 'jsonrpc': '2.0', 'id': 1, 'method': method, 'params': parameters })

      // If we have an error with the Method not being found, it is likely an issue with the RPC server being fcoin.
      if (rpcRequest.data && rpcRequest.data.error && rpcRequest.data.error.message && rpcRequest.data.error.message.includes('Method not found')) {
        this.fcoinRPC = true
        return this.rpcRequest(method, parameters)
      }
    } catch (e) {
      // Throw if there was some weird error for some reason.
      console.log("[RPC Wallet] Unable to perform RPC request, retrying! Method: '" + method + "' - Params: '" + JSON.stringify(parameters) + "' | RPC settings: " + JSON.stringify(this.options.rpc) + ' | Thrown Error: ' + e)
      // Sleep 1 second
      await new Promise((resolve, reject) => { setTimeout(() => { resolve() }, 1000) })
      // Retry RPC Request recursively
      return this.rpcRequest(method, parameters)
    }

    // Remove the `id` field from the response, since we do not care about it
    return {
      result: rpcRequest.data.result,
      error: rpcRequest.data.error
    }
  }

  // This method checks the database
  async checkAllUnconfirmed () {
    let initialUnconfirmedCount = this.unconfirmedTxids.length
    let confirmedTXIDs = []

    let foundUnconfirmed = false

    let numberConfirmed = 0
    while (this.unconfirmedTxids.length !== 0 && !foundUnconfirmed) {
      let txidToCheck = this.unconfirmedTxids[0]

      // Check to see if the utxo is still in the mempool and if it has ancestors
      let getMempoolEntry = await this.rpcRequest('getmempoolentry', [ txidToCheck ])
      // Check if we have an error and handle it
      if (getMempoolEntry.error && getMempoolEntry.error !== null) {
        // If the error 'Transaction not in mempool' occurs, that means that the most recent transaction
        // has already recieved a confirmation, so it has no ancestors we need to worry about.

        // If the error is different, than throw it up for further inspection.
        if (getMempoolEntry.error.message === 'Transaction not in mempool' || getMempoolEntry.error.message === 'Transaction not in mempool.') {
          // Grab the transaction and check the number of confirmations
          let checkConfirmations = await this.rpcRequest('getrawtransaction', [ txidToCheck, true ])

          // Ignore if there was an error, but set the number of confirmations if available
          let confirmations
          if (checkConfirmations.result && checkConfirmations.result.confirmations) { confirmations = checkConfirmations.result.confirmations }

          // Check to make sure if it is not in the mempool, that it at least has one confirmation.
          if (confirmations >= 1) {
            // Since it has a confirmation, remove it from the list!
            // console.log(`Transaction was already Confirmed! Removing it from the list! ${txidToCheck}`)
            numberConfirmed++
            this.unconfirmedTransactions.shift()
            this.unconfirmedTxids.shift()
          } else {
            console.error(`TXID not in mempool AND not found! ${txidToCheck}`)
            foundUnconfirmed = true
          }
        }
      } else {
        // Break out of the while loop once there is a transaciton that exists in the Mempool
        foundUnconfirmed = true
        console.log(`Oldest TX in mempool ${txidToCheck}`)
      }
    }

    console.log(`[RPC Wallet] ${numberConfirmed} Transactions Confirmed!`)

    return numberConfirmed
  }

  /**
   * Grab the latest unconfirmed tx and check how many ancestors it has
   * @return {Boolean} Returns true if the update was successful
   */
  async updateAncestorStatus () {
    console.log('[RPC Wallet] Updating Ancestor Status...')
    // Check all transactions still inside of our unconfirmed array
    await this.checkAllUnconfirmed()

    // Using the unconfirmed array, sum up the current Ancestor total
    this.currentAncestorCount = this.unconfirmedTxids.length
    this.currentAncestorSize = 0
    for (let hex of this.unconfirmedTransactions) {
      this.currentAncestorSize += hex.length
    }

    // // We next check to see if there are any transactions currently in the mempool that we need to be aware of.
    // // To check the mempool, we start by grabbing the UTXO's to get the txid of the most recent transaction that was sent
    // let utxos = await this.getUTXOs()

    // // Grab the most recent txid
    // let mostRecentUTXO = utxos[0]
    // let mostRecentTXID = mostRecentUTXO.txid
    // // Check to see if the utxo is still in the mempool and if it has ancestors
    // let getMempoolEntry = await this.rpcRequest('getmempoolentry', [ mostRecentTXID ])
    // // Check if we have an error and handle it
    // if (getMempoolEntry.error && getMempoolEntry.error !== null) {
    //   // If the error 'Transaction not in mempool' occurs, that means that the most recent transaction
    //   // has already recieved a confirmation, so it has no ancestors we need to worry about.

    //   // If the error is different, than throw it up for further inspection.
    //   if (getMempoolEntry.error.message === 'Transaction not in mempool' || getMempoolEntry.error.message === 'Transaction not in mempool.') {
    //     // Grab the transaction and check the number of confirmations
    //     let checkConfirmations = await this.rpcRequest('getrawtransaction', [ mostRecentTXID, true ])

    //     // Ignore if there was an error, but set the number of confirmations if available
    //     if (checkConfirmations.result && checkConfirmations.result.confirmations) { mostRecentUTXO.confirmations = checkConfirmations.result.confirmations }

    //     // Check to make sure if it is not in the mempool, that it at least has one confirmation.
    //     if (mostRecentUTXO.confirmations >= 1) {
    //       // Reset utxo count if the most recent one was confirmed
    //       this.currentAncestorCount = 0
    //       this.currentAncestorSize = 0
    //     } else {
    //       // If we have gotten here, that means the transaction has zero confirmations, and is not included in the mempool, and so we need to repair it's chain...
    //       console.log(`[RPC Wallet] [WARNING] The most recent unspent transaction has zero confirmations and is not in the mempool! Attempting to repair mempool by rebroadcasting transactions, please wait... (txid: ${mostRecentTXID}) ${JSON.stringify(checkConfirmations)}`)
    //       await this.checkAllUnconfirmed()
    //       await this.rebroadcastTransactions()

    //       // Don't update anything, and return for now, so that `updateAncestorStatus` will run again
    //       return
    //     }
    //   } else {
    //     // Throw an error if the transaction error is not that it is missing from the mempool.
    //     throw new Error('Error grabbing the mempool entry! ' + JSON.stringify(getMempoolEntry.error))
    //   }
    // }

    // // If the tx is still in the mempool, it will have results
    // if (getMempoolEntry.result) {
    //   let txMempoolStatus = getMempoolEntry.result

    //   // Store the current ancestor count & size
    //   this.currentAncestorCount = txMempoolStatus.ancestorcount
    //   this.currentAncestorSize = txMempoolStatus.ancestorsize

    //   // Also increase the count by one in order to account for the txid from the mempool
    //   this.currentAncestorCount++
    // }

    console.log(`[RPC Wallet] Updated Ancestor Count: ${this.currentAncestorCount} - Updated Ancestor Size: ${(this.currentAncestorSize / ONE_MB).toFixed(2)}MB`) 

    return true
  }

  /**
   * Add a transaction we just sent to the ancestor count/size
   * @param {String} hex - The transaction hex to count
   * @return {Boolean} Returns true on success
   */
  async addAncestor (hex) {
    // Increase the ancestor count
    this.currentAncestorCount++
    // Increase the ancestor size (byte length)
    this.currentAncestorSize += hex.length

    // Every 100 update our count
    if (this.currentAncestorCount % 100 === 0) { await this.updateAncestorStatus() }

    // Log every 25
    if (this.currentAncestorCount % 25 === 0) { console.log(`[RPC Wallet] Updated Ancestor Count: ${this.currentAncestorCount} - Updated Ancestor Size: ${(this.currentAncestorSize / ONE_MB).toFixed(2)}MB`) }

    return true
  }

  /**
   * Checks the current ancestor count and returns when it is safe to send more transactions.
   * This method will wait for tx's in the mempool to be confirmed before continuing.
   * @async
   * @return {Boolean} Returns `true` once it is safe to continue sending transactions
   */
  async checkAncestorCount (forceUpdateAncestor) {
    // Store our starting count
    let startAncestorCount = this.currentAncestorCount
    let startAncestorSize = this.currentAncestorSize

    // Variables to track loop state
    let firstLoop = true
    let hadMaxAncestors = false

    let reachedAncestorLimitTimestamp

    // Check if we have too many ancestors, and if we do, wait for the ancestor count to decrease (aka, some transactions to get confirmed in a block)
    let forceFirstLoopUpdate = forceUpdateAncestor
    while (this.currentAncestorCount >= MAX_MEMPOOL_ANCESTORS || this.currentAncestorSize >= MAX_MEMPOOL_ANCESTOR_SIZE || forceFirstLoopUpdate) {
      this.checkingAncestorCount = true
      // Only force an update for the first loop, then disable to prevent looping forever
      forceFirstLoopUpdate = false
      // Wait for UPDATE_ANCESTOR_STATUS seconds (don't run on the first loop through)
      if (!firstLoop) { await new Promise((resolve, reject) => { setTimeout(() => { resolve() }, UPDATE_ANCESTOR_STATUS) }) }
      // Update the ancestor status (this is what will break us out of our while loop)
      await this.updateAncestorStatus()

      // Check if we currently have the maximum number of ancestors
      let hasMaxAncestors = (this.currentAncestorCount >= MAX_MEMPOOL_ANCESTORS || this.currentAncestorSize >= MAX_MEMPOOL_ANCESTOR_SIZE)

      // Only log ancestor count if it is the first loop, and we still have too many ancestors
      if (hasMaxAncestors && firstLoop) {
        console.log(`[RPC Wallet] Maximum Unconfirmed Transaction count reached, pausing sending of transactions until some of the current transactions get confirmed | Ancestor Count: ${this.currentAncestorCount} - Ancestor Size: ${(this.currentAncestorSize / ONE_MB).toFixed(2)}MB`)
        hadMaxAncestors = true
        reachedAncestorLimitTimestamp = Date.now()
      }

      // After it has been REPAIR_ANCESTORS_AFTER amount of time since the max ancestor limit was reached, enable repair mode
      if (hasMaxAncestors && (Date.now() - REPAIR_ANCESTORS_AFTER) > reachedAncestorLimitTimestamp) {
        // Announce that we are going to attempt the repair
        console.log(`[RPC Wallet] [WARNING] Unconfirmed Transaction count has not decreased in ${REPAIR_ANCESTORS_AFTER / ONE_MINUTE} minutes, rebroadcasting transactions in an attempt to repair the utxo chain!`)
        // Attempt the actual repair
        await this.rebroadcastTransactions()

        // Reset the timestamp so that we wait for REPAIR_ANCESTORS_AFTER seconds/minutes
        reachedAncestorLimitTimestamp = Date.now()
      }

      firstLoop = false
    }
    this.checkingAncestorCount = false

    // Count the number of confirmed
    // let numberConfirmed = startAncestorCount - this.currentAncestorCount
    // Remove the transactions that just got confirmed
    // for (let i = 0; i < numberConfirmed; i++) {
    //   this.unconfirmedTransactions.shift()
    //   this.unconfirmedTxids.shift()
    // }
    // let numberConfirmed = await this.checkAllUnconfirmed()

    // // Check to see how many transactions got confirmed
    // if (startAncestorCount >= MAX_MEMPOOL_ANCESTORS || startAncestorSize >= MAX_MEMPOOL_ANCESTOR_SIZE) {
    //   // If there are less confirmed than REPAIR_MIN_TX, then rebroadcast the transactions
    //   if (numberConfirmed < REPAIR_MIN_TX) {
    //     console.log(`[RPC Wallet] Detected low number of transactions confirmed, re-announcing transactions to make sure miners saw them.`)
    //     await this.rebroadcastTransactions()
    //   }
    // }

    // If we had started with maximum ancestors, then log the status
    if (hadMaxAncestors) { console.log(`[RPC Wallet] Unconfirmed count has decreased, resuming sending transactions! | Ancestor Count: ${this.currentAncestorCount} - Ancestor Size: ${(this.currentAncestorSize / ONE_MB).toFixed(2)}MB`) }

    // If we enabled repair mode, then
    this.repairMode = false

    // There are fewer ancestors than the maximum, so we can send the next transaction!
    return true
  }

  /**
   * Rebroadcast out all transactions on our local mempool
   */
  async rebroadcastTransactions () {
    // Lock rebroadcasting; Only perform a single rebroadcast at a time!!
    if (this.rebroadcasting) { 
      console.log(`[RPC Wallet] Already rebroadcasting transactions...`)
      return 
    }
    this.rebroadcasting = true
    // Announce that we are starting
    console.log(`[RPC Wallet] Announcing ${this.unconfirmedTransactions.length} transactions to Peers...`)

    // Destroy any peers we have currently connected to to get a "clean" rebroadcast
    await this.destroyPeers()
    // Connect to Peers to use for the rebroadcast
    await this.connectToPeers()

    // Announce all of our local unconfirmed transactions
    // Loop through all peers and announce TXs to each (if we have connected to them)
    for (let peer of this.peers) {
      await peer.announceTXs(this.unconfirmedTransactions)
    }

    // Wait for REBROADCAST_LENGTH in order to give some time for transactions to be requested, and sent out.
    await new Promise((resolve, reject) => { setTimeout(() => { resolve() }, REBROADCAST_LENGTH) })

    // Unlock rebroadcasting
    this.rebroadcasting = false
  }

  /**
   * Initialize the RPC Wallet. This imports the Private Key, and then checks for unconfirmed transactions in the mempool.
   * @async
   * @return {Boolean} Returns true on Success
   */
  async initialize () {
    if (this.importPrivateKey) {
      console.log(`[RPC Wallet] Importing the Private Key to the RPC Wallet, this may take a long time...`)

      // First, we import the Private Key to make sure it exists when we attempt to send transactions.
      let importPrivKey = await this.rpcRequest('importprivkey', [ this.wif, 'default', true ])

      console.log(`[RPC Wallet] Private Key Import to the RPC Wallet Complete!`)

      // Check for an error importing the private key. If there is no error, the private key import was successful.
      // No error and no result signify that the Private Key was already imported previously to the wallet.
      if (importPrivKey.error && importPrivKey.error !== null && importPrivKey.error.message !== 'Key already exists.') { throw new Error('Error Importing Private Key to RPC Wallet: ' + JSON.stringify(importPrivKey.error)) }
    }

    // Update our ancestor count & status
    await this.updateAncestorStatus()

    // If we have no ancestors (i.e. if our tx already got confirmed), skip grabbing the ancestor transaction hex and return true early
    if (this.currentAncestorCount === 0) { return true }

    console.log(`[RPC Wallet] Loading ${this.currentAncestorCount} transactions into local mempool, please wait... (this may take a little while)`)

    /* Update the tx chain */
    // First, we need to get a list of unconfirmed transactions, to do this, we need the most recent utxo.
    let utxos = await this.getUTXOs()

    // Then, while we have ancestors, lookup the transaction hex, and add it to the start of the unconfirmed transaction chain
    let nextTXID = utxos[0].txid
    while (nextTXID) {
      // Grab the raw transaction hex for the txid
      let txHex = await this.rpcRequest('getrawtransaction', [ nextTXID ])
      if (txHex.error && txHex.error !== null) { throw new Error('Error gathering raw transaction for (' + nextTXID + '): ' + JSON.stringify(txHex.error)) }

      // Add the raw tx hex to the start of the unconfirmed transactions list
      this.unconfirmedTransactions.unshift(txHex.result)
      this.unconfirmedTxids.unshift(nextTXID)

      // Then lookup to see if it is in the mempool
      let txMemInfo = await this.rpcRequest('getmempoolentry', [ nextTXID ])
      if (txMemInfo.error && txMemInfo.error !== null) { throw new Error('Error gathering mempool entry for (' + nextTXID + '): ' + JSON.stringify(txMemInfo.error)) }

      // See if there are any parent txs that our tx "depends" on and need to be confirmed
      if (txMemInfo.result.depends.length > 0) {
        // Store the parent tx to search through next
        nextTXID = txMemInfo.result.depends[0]
      } else {
        // If there are no transactions that ours depend on, then we can exit the loop
        nextTXID = undefined
      }

      // Log every 50 added
      if (this.unconfirmedTransactions.length % 50 === 0) { console.log(`[RPC Wallet] Loaded ${this.unconfirmedTransactions.length}/${this.currentAncestorCount} transactions into local mempool so far...`) }
    }

    console.log(`[RPC Wallet] Loaded ${this.unconfirmedTransactions.length} transactions into local mempool!`)

    // Return true, signifying that the initialization was successful
    return true
  }

  /**
   * Create fcoin "Peers" for all peers that the rpc full node as access to.
   * @async
   */
  async connectToPeers () {
    // Initialize/wipe peers
    this.peers = []

    // Request peers to connect to from the RPC node we have access to
    let getPeerInfo = await this.rpcRequest('getpeerinfo', [])
    if (getPeerInfo.error) { throw new Error(getPeerInfo.error) }

    console.log(`[RPC Wallet] Connecting to ${getPeerInfo.result.length} Peers...`)

    // For each of those peers, open up a connection
    for (let peerInfo of getPeerInfo.result) {
      // Create an fcoin peer

      let peerHost = peerInfo.addr

      // Always rewrite the port.
      if (peerHost.includes(':')) {
        peerHost = peerHost.substring(0, peerHost.indexOf(':'))
      }

      // Set to test or mainnet ourselves.
      if (this.options.network && (this.options.network === 'mainnet' || this.options.network === 'livenet')) {
        peerHost = peerHost + ':7312'
      } else if (this.options.network && this.options.network === 'regtest') {
        peerHost = peerHost + ':17412'
      } else {
        peerHost = peerHost + ':17312'
      }

      console.log(`peer host ${peerHost}`)

      let peer = new Peer({ ip: peerHost, network: this.options.network })
      // Start the connection attempt
      peer.connect()
      // Add it to our peerrs array
      this.peers.push(peer)
    }

    // Wait for PEER_CONNECT_LENGTH in order to allow peers to initialize
    await new Promise((resolve, reject) => { setTimeout(() => { resolve() }, PEER_CONNECT_LENGTH) })

    // Count how many peers we have successfully connected to
    let connectedPeers = 0
    for (let peer of this.peers) {
      if (peer.connected) { connectedPeers++ }
    }

    // Log the connected count
    console.log(`[RPC Wallet] Connected to ${connectedPeers} Peers!`)
  }

  /**
   * Destroy peers created in rebroadcastTransactions
   */
  async destroyPeers () {
    // Destroy each `fcoin` peer
    for (let peer of this.peers) {
      peer.peer.destroy()
    }

    if (this.peers.length > 0) {
      // Wait for PEER_DESTROY_LENGTH in order to allow peers to destroy and be cleared outt
      await new Promise((resolve, reject) => { setTimeout(() => { resolve() }, PEER_DESTROY_LENGTH) })
    }

    // Wipe out the array
    this.peers = []
  }

  /**
   * Sign a message using the internal private key
   * @async
   * @param  {String} message - The message you wish to have signed
   * @return {String}  Returns the base64 version of the Signature
   */
  async signMessage (message) {
    // Create the ECPair to sign with (this is the Private Key basically)
    let myECPair = ECPair.fromWIF(this.wif, this.coin.network)
    let privateKeyBuffer = myECPair.privateKey

    // Check if we are a compress privKey
    let compressed = myECPair.compressed || true

    // Create the actual signature
    let signatureBuffer
    try {
      signatureBuffer = sign(message, privateKeyBuffer, compressed, myECPair.network.messagePrefix)
    } catch (e) {
      throw new Error(e)
    }

    // Convert the signature to a base64 string
    let signature = signatureBuffer.toString('base64')

    // Return the base64 signature
    return signature
  }

  /**
   * Get the latest unspent transaction outputs
   * @async
   * @return {Array.<Object>} Returns an Array of UTXO's
   */
  async getUTXOs () {
    // If we have a previous txo, then just return that one!
    if (this.previousTXOutput && this.previousTXOutput.amount > MIN_UTXO_AMOUNT) { return [ this.previousTXOutput ] }

    // On the first run, log that we are requesting the transaction output.
    if (!this.initialUTXOLog) {
      console.log('[RPC Wallet] Grabbing initial transaction output to use, this may take a few seconds...')
      this.initialUTXOLog = true
    }

    // Request the list of unspent transactions
    const MIN_CONFIRMATIONS = 0
    const MAX_CONFIRMATIONS = 9999999
    let utxoRes = await this.rpcRequest('listunspent', [ MIN_CONFIRMATIONS, MAX_CONFIRMATIONS, [this.publicAddress] ])
    // Throw if there was an error
    if (utxoRes.error && utxoRes.error !== null) { throw new Error('Unable to get unspent transactions for: ' + this.publicAddress + '\n' + JSON.stringify(utxoRes.error)) }

    // Pull out the utxos array
    let utxos = utxoRes.result

    // Filter out transactions that don't meet our minimum UTXO value
    let filtered = utxos.filter((utxo) => {
      if (utxo.amount >= MIN_UTXO_AMOUNT) { return true }

      return false
    })

    // Check if we have no transaction outputs available to spend from, and throw an error if so
    if (filtered.length === 0) { throw new Error('No previous unspent output available! Please send some FLO to ' + this.publicAddress + ' and then try again!') }

    // Sort by confirmations descending (highest conf first)
    filtered.sort((a, b) => {
      return b.confirmations - a.confirmations
    })

    // Return the filtered and sorted utxos
    return filtered
  }

  /**
   * Create and broadcast a transaction containing the requested data as floData
   * @async
   * @param  {String} floData - The data you wish to be placed into the `floData` of the transaction.
   * @return {String} Returns the TXID of the transaction if sent successfully
   */
  async sendDataToChain (floData) {
    // Grab the unspent outputs for our address
    let utxos = await this.getUTXOs()

    // Select the first input (since we have already sorted and filtered)
    let input = utxos[0]

    // Calculate the minimum Transaction fee for our transaction by counting the size of the inputs, outputs, and floData
    let myTxFee = (this.options.txFeePerByte || TX_FEE_PER_BYTE) * (TX_AVG_BYTE_SIZE + varIntBuffer(floData.length).toString('hex').length + Buffer.from(floData).length)

    // Create an output to send the funds to
    let output = {}
    output[this.publicAddress] = parseFloat((input.amount - myTxFee).toFixed(8))

    // Send the transaction
    let txid = await this.sendTX([ input ], output, floData)

    // Returns the TXID of the transaction if sent successfully
    return txid
  }

  /**
   * Create and sign a transaction using bitcoinjs-lib and js-oip libraries
   * @param  {Object} input   [description]
   * @param  {Object} outputs [description]
   * @param  {String} floData [description]
   * @return {String} Returns the built hex string
   */
  createAndSignTransaction (input, outputs, floData) {
    // Create a Bitcoinjs-lib transaction builder, and pass it the FLO network params
    let txb = new FLOTransactionBuilder(this.coin.network)

    // Add our single input
    txb.addInput(input.txid, input.vout)
    // Add our output
    txb.addOutput(this.publicAddress, parseInt(outputs[this.publicAddress] * SAT_PER_FLO))
    // Add our floData
    txb.setFloData(floData)

    // Sign our transaction using the local `flosigner` at `src/config/networks/flo/flosigner.js`
    txb.sign(0, ECPair.fromWIF(this.wif, this.coin.network))

    // Build the hex
    let builtHex
    try {
      builtHex = txb.build().toHex()
    } catch (err) {
      throw new Error(`Unable to build Transaction Hex!: ${err}`)
    }

    // Return the completed hex as a string
    return builtHex
  }

  /**
   * Send a Transaction using the requested inputs, outputs, and floData
   * @async
   * @param  {Array.<Object>} inputs  - An array of utxo inputs to use to fund the transaction
   * @param  {Object} outputs - An Object that contains addresses to output to as the key, and the amount to send as the value (i.e. `{ 'mypublicaddresshere': 1 }`)
   * @param  {String} floData - The `floData` you wish to include in the transaction
   * @return {String} Returns the txid of the transaction if sent successfully
   */
  async sendTX (inputs, outputs, floData) {
    // Perform validation checks on the floData being added to the chain
    if (typeof floData !== 'string') { throw new Error(`Data must be of type string. Got: ${typeof floData}`) }
    if (floData.length > FLODATA_MAX_LEN) { throw new Error(`Error: 'floData' length exceeds ${FLODATA_MAX_LEN} characters. Please send a smaller data package.`) }

    // Make sure that we don't have too many ancestors. If we do, then waits for some transactions to be confirmed.
    await this.checkAncestorCount()
    // Check if transactions have been confirmed, and if so run the callback provided
    await this.checkForConfirmations()

    // Create and sign the transaction hex
    let signedTXHex = this.createAndSignTransaction(inputs[0], outputs, floData)

    // Broadcast the transaction hex we created to the network
    let broadcastTX = await this.rpcRequest('sendrawtransaction', [ signedTXHex ])
    // Check if there was an error broadcasting the transaction
    if (broadcastTX.error && broadcastTX.error !== null) { throw new Error('Error broadcasting tx: ' + signedTXHex + '\n' + JSON.stringify(broadcastTX.error)) }

    // Add our tx hex to the unconfirmed transactions array
    this.unconfirmedTransactions.push(signedTXHex)
    this.unconfirmedTxids.push(broadcastTX.result)
    // Add the tx we just sent to the Ancestor count
    await this.addAncestor(signedTXHex)

    // Set the new tx to be used as the next output.
    this.previousTXOutput = {
      txid: broadcastTX.result,
      amount: outputs[this.publicAddress],
      vout: 0
    }

    // Mark a timestamp for the last time we have sent a transaction,
    // this is to allow us to check if we should be running `checkAncestorCount`
    // inside of the `onConfirmationInterval` check
    this.lastTXTime = Date.now()

    // Return the TXID of the transaction
    return broadcastTX.result
  }

  /**
   * Get the current onConfirmation subscription count
   * @return {Integer} returns the count of pending onConfirmation subscriptions
   */
  getConfirmationSubscriptionCount () {
    return Object.keys(this.onConfirmationSubscriptions).length
  }

  /**
   * Subscribe a callback function to be run when all TXIDs are confirmed.
   * @param  {Array<String>} response.txids - An Array of TXIDs
   * @param  {OIPRecord} response.record - The OIPRecord that was published (to be returned to the Callback)
   * @param {function} options.onConfirmation - A function to run once the transaction recieves a confirmation that it was included in a block.
   * @param {String} options.onConfirmationRef - A reference string that should be returned in the onConfirmation function (useful for ID's).
   */
  onConfirmation ({ txids, record }, options) {
    // If we do not have an onConfirmation subscription, exit the function
    if (!options || !options.onConfirmation || typeof options.onConfirmation !== 'function') { return }

    // Add this subscription to the tracked subscriptions
    this.onConfirmationSubscriptions[record.getTXID()] = {
      txids,
      record,
      options
    }

    // If we do not already have a loop going to make sure confirmations get fired off, create one
    if (!this.onConfirmationInterval) {
      this.onConfirmationInterval = setInterval((async () => {
        // Only run the checkAncestorCount function IF if has been at least CONFIRMATION_CHECK_UPDATE_ANCESTORS_AFTER
        // since the last transaction was sent
        if (Date.now() - this.lastTXTime > CONFIRMATION_CHECK_UPDATE_ANCESTORS_AFTER && !this.checkingAncestorCount) { 
          this.lastTXTime = Date.now()
          await this.checkAncestorCount(true)
        }
        await this.checkForConfirmations() 
      }).bind(this), CONFIRMATION_CHECK_INTERVAL)
    }
  }

  /**
   * Check if any of the confirmation subscriptions should be run because TXIDs got confirmed
   * @return {Promise} Returns a promise that resolves once all of the available confirmation callbacks have been run
   */
  async checkForConfirmations () {
    if (this.getConfirmationSubscriptionCount() === 0) { 
      // Sanity check to clear out the interval if for whatever reason it currently exists.
      if (this.onConfirmationInterval) {
        clearInterval(this.onConfirmationInterval)
        this.onConfirmationInterval = undefined
      }
      return 
    }

    // Note: Occasionally this will log a lower number than the Ancestor Count, this occurs
    // when a Multipart record is subscribed to using the onConfirmation subscription.
    console.log(`[RPC Wallet] Checking ${this.getConfirmationSubscriptionCount()} confirmation subscriptions...`)
    for (let subscription in this.onConfirmationSubscriptions) {
      let { txids, record, options } = this.onConfirmationSubscriptions[subscription]

      // Check if we are still waiting to be confirmed
      let waitingForConfirmation = false
      for (let txid of txids) {
        if (this.unconfirmedTxids.includes(txid)) {
          waitingForConfirmation = true
        }
      }

      if (!waitingForConfirmation) {
        try {
          await options.onConfirmation(record, txids, options.onConfirmationRef)
        } catch (e) {
          console.error(`[RPC Wallet] Error when running onConfirmation function in subscription: `)
          console.error(e)
        }
        delete this.onConfirmationSubscriptions[subscription]
      }
    }

    // Now that we have attempted to process confirmation subscriptions, see if we should immediately clear the setInterval
    if (this.getConfirmationSubscriptionCount() === 0 && this.onConfirmationInterval) {
      clearInterval(this.onConfirmationInterval)
      this.onConfirmationInterval = undefined
    }
  }

  /**
   * Wait for all Confirmation Subscriptions to complete, then resolves the Promise
   * @return {Promise} Returns a promise that resolves once all subscribed Confirmation callbacks have completed
   */
  async waitForConfirmations () {
    let subCount = this.getConfirmationSubscriptionCount()
    let lastConfirmationTime = Date.now()

    while (subCount > 0) {
      console.log(`[RPC Wallet] Waiting for ${Object.keys(this.onConfirmationSubscriptions).length} records to be confirmed! (onConfirmation subscription)`)
      await new Promise((resolve, reject) => { setTimeout(resolve, 10 * ONE_SECOND) })
      await this.checkAncestorCount(true)
      await this.checkForConfirmations()

      let tmpSubCount = subCount
      subCount = this.getConfirmationSubscriptionCount()
      if (tmpSubCount === subCount) {
        // Check if we have been waiting longer than CONFIRMATION_REBROADCAST_DELAY for a confirmation to happen
        if (Date.now() - lastConfirmationTime > CONFIRMATION_REBROADCAST_DELAY) {
          // If so, rebroadcast the pending transactions
          lastConfirmationTime = Date.now()
          console.log(`[RPC Wallet] Rebroadcasting Transactions! There were no record confirmations within the past ${CONFIRMATION_REBROADCAST_DELAY / 1000} seconds.`)
          await this.rebroadcastTransactions()
        }
      } else {
        // Update the last confirmation time
        lastConfirmationTime = Date.now()
      }
    }

    console.log(`[RPC Wallet] No more confirmation subscriptions exist, all Records have been confirmed`)
  }
}

export default RPCWallet
