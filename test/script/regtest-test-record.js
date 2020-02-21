const OIP = require('../../lib/core/oip/oip.js').default
const { Artifact } = require('../../lib/modules/records/artifact/')

// oMGVCJ68Q54woRwqq8uVcSM1x7CCxiLnpe
const authorWif = 'cVrcv3NnTJEfQ3ZpT7yUoSPgMsrngsMWZ7uBBBjR3vWgi6nGbUKr'

const author = new OIP(authorWif, 'regtest', {
  oipdURL: 'http://localhost:1606/oip',
  rpc: {
    host: '127.0.0.1',
    username: 'x',
    password: 'password'
  }
})

async function run () {
  // Create and broadcast a record
  const myRecord = new Artifact()
  myRecord.setTitle('OIP Test Record')

  const original = await author.publish(myRecord)
  console.log('Record TXIDs: ' + original.txids)
}

run().then(() => {}).catch((e) => { throw e })
