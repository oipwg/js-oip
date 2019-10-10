[![npm version](https://badge.fury.io/js/js-oip.svg)](https://badge.fury.io/js/js-oip)
[![Build Status](https://travis-ci.org/oipwg/js-oip.svg?branch=master)](https://travis-ci.org/oipwg/js-oip)

# js-oip
The `js-oip` is a javascript module that allows you to easily interact with the Open Index using the Open Index Protocol.

## Table of Contents
* [Installation Instructions](https://github.com/oipwg/js-oip/#installation-instructions)
* [Getting Started](https://github.com/oipwg/js-oip/#getting-started)
    * [Formal OIP Definitions](https://github.com/oipwg/js-oip/#formal-oip-definitions)
        * [OIP](https://github.com/oipwg/js-oip/#oip)
        * [floData](https://github.com/oipwg/js-oip/#flodata)
        * [Record](https://github.com/oipwg/js-oip/#record)
        * [Artifact](https://github.com/oipwg/js-oip/#artifact)
        * [Multipart](https://github.com/oipwg/js-oip/#multipart)
    * [Using the HTTP API to interact with an OIP Daemon](https://github.com/oipwg/js-oip/#using-the-http-api-to-interact-with-an-oip-daemon)
        * [Spawn a DaemonApi](https://github.com/oipwg/js-oip/#spawn-a-daemonapi)
        * [Get an Artifact Record from the Open Index](https://github.com/oipwg/js-oip/#get-an-artifact-record-from-the-open-index)
        * [Get latest Artifact Records](https://github.com/oipwg/js-oip/#get-latest-artifact-records)
        * [Search Artifact Records](https://github.com/oipwg/js-oip/#search-artifact-records)
        * [Create a complex search query](https://github.com/oipwg/js-oip/#create-a-complex-search-query)
        * [Get multiparts](https://github.com/oipwg/js-oip/#get-multiparts)
        * [Search floData](https://github.com/oipwg/js-oip/#search-flodata)
        * [Get floData](https://github.com/oipwg/js-oip/#get-flodata)
    * [Using the OIP API to publish records to the Open Index](https://github.com/oipwg/js-oip/#using-the-oip-api-to-publish-records-to-the-open-index)
        * [Importing the OIP API](https://github.com/oipwg/js-oip/#importing-the-oip-api)
        * [Publishing an Artifact Record](https://github.com/oipwg/js-oip/#publishing-an-artifact-record)
        * [Using MultipartX and MPSingle](https://github.com/oipwg/js-oip/#using-multipartx-and-mpsingle)
        * [Publish using an RPC Wallet](https://github.com/oipwg/js-oip/#publish-using-an-rpc-wallet)
    * [Adding files to IPFS](https://github.com/oipwg/js-oip/#adding-files-to-ipfs)
    * [Creating an Artifact Record](https://github.com/oipwg/js-oip/#creating-an-artifact-record)
        * [Using the Artifact Decoder](https://github.com/oipwg/js-oip/#using-the-artifact-decoder)
    * [Networks](https://github.com/oipwg/js-oip/#networks)
    * [Importing submodules](https://github.com/oipwg/js-oip/#importing-submodules)
* [API Documentation](https://github.com/oipwg/js-oip/#api-documentation)
* [License](https://github.com/oipwg/js-oip/#license)

## Installation Instructions
Make sure you have the latest version of npm and nodejs installed. Instructions on installing the latest versions can be found on nodesource: [nodesource](https://github.com/nodesource/distributions#debinstall).

You can install the latest version by running the following `npm install` command.
```bash
$ npm install --save js-oip
```
or with yarn.
```bash
$ yarn add js-oip
```
## Getting Started
This module is based entirely around the Open Index Protocol. To read in depth material about this protocol, please refer to the [OIP Wiki](https://oip.wiki).

### Formal OIP Definitions
It will be helpful to understand certain terms used throughout this module.
#### OIP
*"The Open Index Protocol (OIP) is a specification for a worldwide database for decentralized publishing, distribution and payments. OIP uses distributed networking and peer-to-peer technology to operate with no central authority: content indexing, file storage/distribution and transaction management are carried out collectively by the network."*
#### floData
The Open Index 'sits' on top of the [FLO Blockchain](https://www.flo.cash/) (formerly known as Florincoin). FLO is a fork of Litecoin, itelf a fork of Bitcoin. FLO operates in
almost the exact same way except for certain key elements, one of those being floData.

floData is arbitrary text data appended to the end of a FLO transaction. Allowing up to 1040 bytes of data to be appended onto a transaction,
the FLO chain is a perfect fit for the Open Index use case. We use this extra field as an immutable record holder of data. Using the OIP,
users can serialize/format their data and push it to the blockchain where it remains unchangeable and decentralized. Using our 
modules/libraries we can then retrieve this information from the blockchain and use it to populate our own apps.

For a live example, check out [this transaction](https://livenet.flocha.in/tx/6ffbffd475c7eabe0acc664087ac56c13ac7c2084746619182b360c2f19e430e) on the FLO chain. 
In the Details section at the bottom we see a floData field containing text that begins with 'oip-mp'. This is an example of data that was serialized with the Open Index Protocol
and pushed to the chain. The '-mp' refers to the fact that its a multipart which we'll get to in a sec.
#### Record
By our current definition a Record is a piece of data that was serialized with the OIP and pushed to the blockchain and indexed by an OIP Daemon.
The major types of Records will be: Artifact, Publisher, Platform, Influencer, and Autominers ("spartanbots"). Currently, only Artifact Records
are in main implementation so that's all we'll focus on for now.
#### Artifact
An Artifact [Record] is a piece of data published to the Index. It typically contains the IPFS locations to the raw data published (mp3, mp4, mpeg, mov, etc), 
as well as the metadata about the raw data. Artifact types can range from image, movie, audio, text, etc. Any digital form of data can be published as an artifact.
Think of an Artifact as a piece of content. Similiar to how one would upload a piece of content to YouTube, so one would 'upload' a piece of content to the Open Index, 
but in our case, we use the word 'Artifact' instead of 'content'.
#### Multipart
A Multipart is a term that relates to a Record on the FLO Chain that is split up into chunks or pieces. As stated previously, the FLO Chain allows
for 1040 bytes of data to be appended to a transaction. If when a Record is being pushed to the chain is more than 1040 bytes, it gets split up into mulitple
parts and gets sent as multiple transactions. We use a special serialization format for multiparts that allows us to easily retrieve all pieces of a Record back with ease.
You can tell if a record was published in multiple parts if the floData in which it is contained in begins with 'oip-mp' (open index protocl multipart). 
## Using the HTTP API to interact with an OIP Daemon
### Spawn a DaemonApi
First we must import the DaemonApi from the module and then initialize it with the 'new' keyword. For these examples we will be using es6 import syntax.
Also note the object deconstruction import. 
```javascript
import {DaemonApi} from 'js-oip'

let api = new DaemonApi()
```
### Spawn a DaemonApi with a custom OIPd server
OIPd refers to an Open Index Protocol Daemon. Our current implementation is in golang and can be found [here](https://github.com/oipwg/oip).
If for instance, we are running a daemon locally, we hit the endpoints it exposes by pointing our DaemonApi to the URL its running at.
```javascript
import {DaemonApi} from 'js-oip'

let api = new DaemonApi('http://localhost:1606')
``` 

Alternatively you can manually set the URL:
```javascript
let api = new DaemonApi()
api.setUrl('http://localhost:1606')
console.log(api.getUrl())
```
### Get an Artifact Record from the Open Index
Once we have our Daemon Api spawned, we can use its methods to retrieve data back from the Index. In this example we'll get back an Artifact Record.
```javascript
import {DaemonApi} from 'js-oip'

let api = new DaemonApi()
let txid = 'cc9a11050acdc4401aec3f40c4cce123d99c0f2c27d4403ae4a2536ee38a4716'
let {success, error, artifact} = await api.getArtifact(txid)
console.log(artifact instanceof Artifact) //true
console.log(artifact instanceof Record) //true
```
### Get latest Artifact Records
Similiarly, we can get back just the latest Artifact Records.
```javascript
import {DaemonApi} from 'js-oip'

let api = new DaemonApi()
const limit = 50
let {success, artifacts, error} = await api.getLatestArtifacts(limit)
```
### Search Artifact Records
Or we can search for Artifacts with a text query. In this example we are searching for Artifacts that contain the text: 'ryan' in it.
```javascript
import {DaemonApi} from 'js-oip'

let api = new DaemonApi()
let query = 'ryan'
let {success, error, artifacts} = await api.searchArtifacts(query)
```
### Create a complex search query
We can even create complex search queries, searching on certain fields using AND, OR, or NOT. For examples on how 
to do this please refer to the our [query documentation](https://oipwg.github.io/js-oip/global.html#queryObject). But essentially 
what it comes out to is creating a query as such: `(artifact.type:"research" OR artifact.type:"music") AND artifact.info.year:"2017"`. Plugging that into 
DaemonApi.searchArtifact(query) will get you the results you can intuit from that complex query.
### Get multiparts
For a brief descrpition of what a multipart is, navigate [here](https://github.com/oipwg/js-oip/#multipart). 
This first example gets all multiparts back by given the method the txid of the first multipart, known as the `reference` txid.
```javascript
import {DaemonApi} from 'js-oip'

let api = new DaemonApi()
let reference = '8c204c5f39'
let {success, multiparts, error} = await api.getMultiparts(reference)
```
Or alternatively, you can retrieve just a single multipart.
```javascript
import {DaemonApi} from 'js-oip'

let api = new DaemonApi()
let txid = 'f550b9739e7453224075630d44cba24c31959af913aeb7cb364a563f96f54548'
let {success, multipart, error} = await api.getMultipart(txid)
```
### Search floData
[The OIP Daemon](https://github.com/oipwg/oip) indexes *not only* data serialized using the OIP, but all floData found on the FLO Chain. 
Using this method we can search for text found within any TX's floData field. Again, Ryan seems like a cool guy so we'll search for his name.
Note here how we're going to receive back transactions (`txs`) that contain the floData and not just the floData itself.
```javascript
import {DaemonApi} from 'js-oip'

let api = new DaemonApi()
let query = 'ryan'
let {success, txs, error} = await api.searchFloData(q)
```
### Get floData
Or if we know the txid of the floData we want we can do:
```javascript
import {DaemonApi} from 'js-oip'

let api = new DaemonApi()
let txid = '83452d60230d3c2c69000c2a79da79fe60cdf63012f946ac46e6df3409fb1fa7'
let {success, tx, error} = await api.getFloData(txid)
```
## Using the OIP API to publish records to the Open Index
This is where this module gets kind of fun. We can use the OIP API to send data to the FLO Chain... where it stays... forever! =O Become immortal. Use the Open Index Protocol.
### Importing the OIP API
Two important things: This module accepts two arguments, a wif and a network. We take care of the network details so all
you have to do is specify whether you want mainnet (default) or testnet by giving it `'mainnet'` or `'testnet'` as a string argument. If nothing is passed
it will default to mainnet. 

The WIF, or the first argument passed to the module, stands for [Wallet Import Format](https://en.bitcoin.it/wiki/Wallet_import_format). It's essentially your private key. It's needed to sign
transactions and Records going out to the blockchain. If you need to generate a WIF, you can do so by generating an ECPair (Elliptic Curve Pair), generally known as a just a key-pair. 
This [module](https://github.com/bitcoinjs/bitcoinjs-lib) allows you to easily to that - just make sure you pass in the correct network parameters (which you can get from one of our [submodules](https://github.com/oipwg/js-oip/#importing-submodules)).
```javascript
import {OIP} from 'js-oip'

let wif = '5HueCGU8rMjxEXxiPuD5BDk_SAMPLE_PRIVATE_KEY_DO_NOT_IMPORT_u4MkFqeZyd4dZ1jvhTVqvbTLvyTJ'
let oip = new OIP(wif, 'testnet')
```
### Publishing an Artifact Record
is super easy!
```javascript
import {OIP} from 'js-oip'

let artifact = new Artifact(someValidArtifactJSON)
let results = await OIP.publish(artifact)
//results can be either a txid or an array of transcation ids
```
### Using MultipartX and MPSingle
MultipartX is a Multipart Converter (X). It can take in either string data (a stringified Record) or an array of multiparts, known as
Multipart Singles (MPSingle)s. Using MultipartX, you can take a large Record and convert it into valid parts that can be published independently to the blockchain. Or 
you can take MPSingles and form them back into the original Record (in JSON/string format).

See how to [import submodules](https://github.com/oipwg/js-oip/#importing-submodules) to import these two classes.

Taken straight from one of our tests:
```javascript
import {DaemonApi} from 'js-oip'
import {MultipartX} from 'js-oip/modules'


let assembled = '{"oip-041":{"artifact":{"type":"Audio-Basic","info":{"extraInfo":{"genre":"Acoustic"},"title":"Visionen_von_Marie"},"storage":{"network":"IPFS","files":[{"fname":"Visionen_von_Marie.mp3","fsize":3771195,"type":"Audio","duration":187}],"location":"QmZCcTJJUG2Dp1uLsMhe9bSWZbWp5hCprfjfBtJiLU67bf"},"payment":{"fiat":"USD","scale":"1000:1","maxdisc":30,"promoter":15,"retailer":15,"sugTip":[],"addresses":[]},"timestamp":1532864918,"publisher":"F95Q4zxMiafqyZDBaJRuLNyvGD7dCwjezX"},"signature":"IK9mtLY+sugytM4URKiRyRxUVtkeZGT5JaVYSw3tqlhnboRJo1HFcEv6mQjbUmkjVZ8TOgOilaBPZD+Kyj2E1sM="}}'
let ref = 'd148b56799'
let results = await DaemonApi.getMultiparts(ref)
let mps = results.multiparts

let mpx = new MultipartX(mps)
expect(mpx.toString()).toEqual(assembled)
expect(mpx.getMultiparts().length).toEqual(2) //this would return an array of two MPSingle[s]
```
### Publish using an RPC Wallet
You can publish an Artifact using an RPC Wallet instead of the built in Web Explorer Wallet by including RPC settings as a third parameter when initializing OIP. After that, just use the OIP class like normal.

```javascript
import {OIP} from 'js-oip'

let wif = '5HueCGU8rMjxEXxiPuD5BDk_SAMPLE_PRIVATE_KEY_DO_NOT_IMPORT_u4MkFqeZyd4dZ1jvhTVqvbTLvyTJ'
let oip = new OIP(wif, "testnet", {
    rpc: {
        port: 17313,
        host: "127.0.0.1",
        username: "username",
        password: "password"
    }
})

let artifact = new Artifact(someValidArtifactJSON)
let results = await OIP.publish(artifact)
```

## Adding files to IPFS
[IPFS](https://ipfs.io/) is a peer-to-peer file transfer network (techincally a 'hypermedia protocol'). Anyway's we need IPFS for 
the actual storage of raw data and they let us have that for free and in a decentralized manner. Perfect! To create a valid Artifact, you need to include
the address or location of the files which your Record contains. Using the `ipfs-http-api`, we can add a file to IPFS and get back its location. 
This module is just a wrapper around their API. 

To see what formats the IPFS API accepts files in, please see: [their documentation](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add).

Other methods and classes for IPFS coming soon...

```javascript
import {IpfsHttpApi} from 'js-oip'

let file = ipfsFormattedFile

let options = {
	filename: "someFileName.mp4",
	filesize: 777,
	host: 'ipfs-dev.alexandria.io',
	port: 443,
	protocol: 'https',
	oip_auth: {
		address:"oNRs1nuR1vUAjWJwhMtxJPQoTFAm9MWz1G",
		message:'1534278675842{"oip042":{}}',
		signature:"Hw2iuomv/fhYYoKX8bNroVXmOvbh/e9gqZjP+I9kZymHD72mqtDw1qjN6/Qh4nhTDOHI8mkxbWtsaLSTuCkSihU="
	}
}

let fileUploader = new IpfsHttpApi(file, options)
let response = await fileUploader.start()
```
## Creating an Artifact Record
To see the current spec, refer to [the wiki](https://oip.wiki/Message_protocol#Artifact_Publish).
```javascript
import {Artifact} from 'js-oip/modules/records/artifact'

let artifact = new Artifact(artifactJSON)
let {success} = artifact.isValid())
``` 
### Using the Artifact Decoder
While it may be necessary to import the Artifact module directly, we recommend using an Artifact Decoder which will parse a JSON Artifact
and return an Artifact based on its type. Currently there are only a few unique types, but as more get added it will be a good habit to use this function
instead of an Artifact constructor.
```javascript
import {decodeArtifact} from 'js-oip'

let artifact = decodeArtifact(artifactJSON)
let {success} = artifact.isValid()
```
## Networks
To import our current Coin Network modules. Use these to generate ECPairs and much more! Currently just contains the FLO and FLO_testnet networks.
```javascript
import {Networks} from 'js-oip'
```
## Importing submodules
To import Records or other modules directly.
```javascript
import * as modules from 'js-oip/modules'
```
```javascript
import {Records} from 'js-oip/modules'
```
```javascript
import {ArtifactFile} from 'js-oip/modules'
```
```javascript
import {MultipartX} from 'js-oip/modules'
```
```javascript
import {MPSingle} from 'js-oip/modules'
```
```javascript
import {Artifact} from 'js-oip/modules/records'
```
```javascript
import {Artifact} from 'js-oip/modules/records/artifact'
```

You get the jist. You can import everything (*) from `js-oip/[folder]` where folder is `modules`, `decoders`, `core`, or `config` to see what else lies in this library.

## API Documentation
For further documentation on use cases and methods, please see the [official documentation page](https://oipwg.github.io/js-oip/)
## License
MIT License

Copyright (c) 2019 Open Index Protocol Working Group

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
