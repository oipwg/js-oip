const { OIP } = require('../lib')
const { Publisher } = require('../lib/modules/records')

// Constants used to register the publisher
const authorPublicAddress = 'FV7atpb74f6ZNhn7Lsex4RR3xgiYXrYKCH'
const authorPrivateKey = 'RDTF8BmEiA5Wmyy7aooQQsKsdRB9PBxZ32qiB9K5soPbcGKSKsSo'
const authorAlias = 'My Example Publisher'

const main = async () => {
  // Create the author (used to write to the Blockchain)
  const author = new OIP(authorPrivateKey)

  // Create the Publisher object to "register" our publisher
  let myPublisher = new Publisher()
  myPublisher.setAlias(authorAlias)
  myPublisher.setMainAddress(authorPublicAddress)
  myPublisher.setTimestamp(Date.now())

  // Write the author to the chain
  let response = await author.broadcastRecord(myPublisher, 'register')

  console.log(response)
}

main().then(()=>{}).catch((e)=>{console.error(e)})