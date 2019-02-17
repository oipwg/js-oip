import { peer, netaddress, packets, tx, logger, invitem } from 'fcoin'

/* Create a Flo p2p Peer */
class Peer {
	/**
	 * Initialize the Peer
	 * @param  {Object} settings
	 * @param  {Object} settings.ip - The IP address of the Flo Peer to connect to
	 * @param  {Object} [settings.agent="js-oip fcoin Peer"] - The "name" to display to nodes you connect to.
	 * @return {[type]}          [description]
	 */
	constructor(settings){
		this.settings = settings
		this.connected = false

		this.txMap = {}

		this.singleLog = 0
	}
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

		let address = netaddress.fromHostname(this.settings.ip)

		this.peer.connect(address)
		this.peer.on("packet", this.onPacket.bind(this))
		this.peer.on("error", (e) => {
			console.log("Peer Error: " + e)
		})
		try {
			await this.peer.open()
			this.connected = true
		} catch (e) {
			this.connected = false
		}
	}
	async announceTX(hex){
		if (this.connected){
			try {
				let mytx = tx().fromRaw(Buffer.from(hex, 'hex'))

				this.txMap[mytx.hash('hex')] = hex

				this.peer.announceTX(mytx)
			} catch (e) {
				console.error("Announce TX Error: " + e)
			}
		}
	}
	onPacket(packet){
		switch (packet.type) {
			case packets.types.GETDATA:
				this.handleGetData(packet)
		}
	}
	async handleGetData(getDataPacket){
		let txsRelayed = 0
		let lastHash
		// console.log(`[RPC Wallet] Peer ${this.settings.ip} requested ${getDataPacket.items.length} items...`)
		for (let item of getDataPacket.items){
			let regTX = (item.type === invitem.types.TX)
			let segTX = (item.type === invitem.types.WITNESS_TX)
			if (regTX || segTX){
				if (!this.txMap[item.hash])
					return

				let mytx = tx().fromRaw(Buffer.from(this.txMap[item.hash], 'hex'))
				let txPacket = packets.TXPacket(mytx, segTX)

				// Send out the packet
				this.peer.send(txPacket)
				txsRelayed++
				lastHash = mytx.rhash()
			}
		}

		if (txsRelayed > 0){
			// If we have logged a single tx being relayed more than 5 times, then just skip logging (to prevent spam)
			if (txsRelayed === 1 && this.singleLog > 5)
				return

			if (txsRelayed === 1)
				this.singleLog++

			console.log(`[RPC Wallet] Relayed ${txsRelayed} requested transactions to ${this.settings.ip} (last txid ${lastHash})`)

		}
	}
}

export default Peer