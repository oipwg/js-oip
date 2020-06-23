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

function makeDescription(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

async function run () {
  for (let i = 0; i < 1000; i++) {
    // Create and broadcast a record
    let myRecord = new Artifact()
    myRecord.setTitle('js-oip onConfirmation test #' + i)
    myRecord.setDescription(makeDescription(5000))

    let original = await author.publish(myRecord, {
      onConfirmation: async (recordedRecord, txids, ref) => {
        await new Promise((resolve, reject) => { setTimeout(resolve, 100) })
        console.log(`onConfirmation: ${recordedRecord.getTXID()}, ${ref}`)
      },
      onConfirmationRef: `my-id-${i}`
    })

    if (original.success) {
      console.log(`Record ${i} main TXID: ${original.record.getTXID()}`)
    } else {
      console.log(`Error recording ${i}`, original)
    }
  }
    
  // Wait for all records to be confirmed into the Blockchain
  await author.waitForConfirmations()
}

run().then(() => {}).catch((e) => { throw e })
