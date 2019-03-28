import { TransactionBuilder } from 'bitcoinjs-lib'

import FloTransaction from './FloTransaction'

class FloTransactionBuilder extends TransactionBuilder {
  constructor (network, maximumFeeRate) {
    super(network, maximumFeeRate)

    this.__tx = new FloTransaction()
    this.__tx.version = 2
  }
}

export default FloTransactionBuilder
