import { TransactionBuilder } from 'bitcoinjs-lib'

import { network as mainnetNetwork } from '../../config/networks/flo/mainnet'
import FLOTransaction from './FLOTransaction'

class FLOTransactionBuilder extends TransactionBuilder {
  constructor (network = mainnetNetwork, maximumFeeRate) {
    super(network, maximumFeeRate)

    this.__TX = new FLOTransaction()
    this.__TX.version = 2
  }
  setFloData (data, dataType) {
    return this.__TX.setFloData(data, dataType)
  }
}

export default FLOTransactionBuilder
