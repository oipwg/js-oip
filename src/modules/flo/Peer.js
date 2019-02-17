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
				this.peer.sendInv(this.peer.invQueue)
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
				console.log(`[RPC Wallet] Relayed tx ${mytx.rhash()} to ${this.settings.ip}`)
			}
		}
	}
}

export default Peer