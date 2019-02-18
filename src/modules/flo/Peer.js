import { peer, netaddress, packets, tx, logger, invitem } from 'fcoin'

/* Create a Flo p2p Peer */
class Peer {
	/**
	 * Initialize the Peer
	 * @param  {Object} settings
	 * @param  {Object} settings.ip - The IP address of the Flo Peer to connect to
	 * @param  {Object} [settings.agent="js-oip fcoin Peer"] - The "name" to display to nodes you connect to.
	 * @return {Peer} 
	 */
	constructor(settings){
		// Store our internally settings for later use
		this.settings = settings

		// Set the initial connection status
		this.connected = false
		// Initialize the transaction map to store { 'txid': 'hex' } the txid related to the hex
		this.txMap = {}
		// Initialize a logging limiter variable
		this.singleLog = 0
	}

	/**
	 * Open a p2p connection to the Peer
	 * @return {Boolean} Returns the connection status
	 */
	async connect(){
		let log = logger({ level: 'spam' })
		// Create the Fcoin Peer
		this.peer = peer.fromOptions({
			logger: log,
			network: "testnet",
			agent: this.settings.agent,
			hasWitness: () => {
				return false;
			}
		});

		// Create a netaddress from our passed in IP address:port
		let address = netaddress.fromHostname(this.settings.ip)

		// Fire off the initial connection attempt
		this.peer.connect(address)

		// When we recieve packets from peers, process them using the onPacket function
		this.peer.on("packet", this.onPacket.bind(this))
		// Handle/log errors
		this.peer.on("error", (e) => {
			console.log("Peer Error: " + e)
		})

		try {
			// Wait for the peer to open up
			await this.peer.open()
			// Set connected to true once we have connected
			this.connected = true
		} catch (e) {
			// Handle connection error and set connected explicitly to false
			this.connected = false
		}

		// Return the final connection status
		return this.connected
	}

	/**
	 * Announce the availability of a Transaction to the Peer
	 * @param  {String} hex - The hex string of the transaction
	 */
	announceTX(hex){
		// First, check if we are connected before attempting to broadcast out
		if (this.connected){
			try {
				// Create an `fcoin` transaction from our tx hex
				let mytx = tx().fromRaw(Buffer.from(hex, 'hex'))

				// Store the hash of the transaction in our txMap
				this.txMap[mytx.hash('hex')] = hex

				// Announce the Transaction to the peer
				this.peer.announceTX(mytx)
			} catch (e) {
				// Throw an error if one happened
				console.error("Announce TX Error: " + e)
			}
		}
	}

	/**
	 * Handle incoming p2p packets
	 * @param  {Packet} packet - The packet that is incoming
	 */
	onPacket(packet){
		// Check which packet type is incoming
		switch (packet.type) {
			// If the packet is `GETDATA` that means they are requesting us to send them tne transaction
			case packets.types.GETDATA:
				// Send the transaction to the peer
				this.handleGetData(packet)
				break
		}
	}

	/**
	 * Handle (respond to) a p2p getdata request
	 * @param  {GetDataPacket} getDataPacket - The packet to respond to with data
	 */
	handleGetData(getDataPacket){
		// Track the total number of transactions relayed
		let txsRelayed = 0
		// Track the last txid hash that we sent
		let lastHash
		
		// If the peer is requesting more than one transaction, or if they have not met the singlelog maximum, then log the request
		if (getDataPacket.items.length > 1 || this.singleLog < 5)
			console.log(`[RPC Wallet] Peer ${this.settings.ip} requested ${getDataPacket.items.length} items...`)

		// Loop through each requested item in the getData packet
		for (let item of getDataPacket.items){
			// We only care about responding if they are requesting a transction
			let regTX = (item.type === invitem.types.TX)
			let segTX = (item.type === invitem.types.WITNESS_TX)
			// If we are a regular tx, or a segwit tx, then continue
			if (regTX || segTX){
				// Check to see if we have this transction in our txMap, and if not, skip it (ignore transactions that are not our own)
				if (!this.txMap[item.hash])
					return

				// Create an `fcoin` tx from the cached tx hex
				let mytx = tx().fromRaw(Buffer.from(this.txMap[item.hash], 'hex'))
				// Include the transaction in a TXPacket to be sent to the Peer
				let txPacket = packets.TXPacket(mytx, segTX)

				// Send out the TXPacket to the Peer
				this.peer.send(txPacket)
				// Increase our count of transactions relayed
				txsRelayed++
				// Store the previous hash (for logging purposes)
				lastHash = mytx.rhash()
			}
		}

		// If we have responded to at least one getdata item, then log our response
		if (txsRelayed > 0){
			// If we have logged a single tx being relayed more than 5 times, then just skip logging (to prevent spam)
			if (txsRelayed === 1 && this.singleLog > 5)
				return

			// If we only relayed a single transaction, then increase the "singleLog" counter
			if (txsRelayed === 1)
				this.singleLog++

			// Log information about the sent transactions
			console.log(`[RPC Wallet] Relayed ${txsRelayed} requested transactions to ${this.settings.ip} (last txid ${lastHash})`)
		}
	}
}

export default Peer