import fs from 'fs'
import JsIpfs from '../../../src/core/ipfs/jsIpfs'
const IPFS = require('ipfs')


let test_file_A = {
	path: `hello text`,
	content: Buffer.from('Hello ryan')
}

let test_file_B = {
	path: `world text`,
	content: Buffer.from('Hello world')
}

let godImg_path = "/home/orpheus/Pictures/Wallpapers/4rdYuG.jpg"
let godImg_stats = fs.statSync(godImg_path)
let godImg_size = godImg_stats.size
let godImg_stream = fs.createReadStream(godImg_path)

let godImg_ipfsFile = {
	path: "4rdYuG.jpg",
	content: godImg_stream
}
// console.log('god img: ', godImg_stats)

// let readStreamA = fs.createReadStream(__dirname + "/testFiles/hello.txt")
// let writeStreamA = fs.createWriteStream(__dirname + "/testFiles/writeStream.txt")
// readStreamA.pipe(writeStreamA)

// console.log(fs.statSync(test_file_B.path))

async function test() {
	let ipfs = new JsIpfs()
	await ipfs.readyCheck()
	let files
	try {
		files = await ipfs.addFiles(godImg_ipfsFile, {wrapWithDirectory: true, recursive: false})
	} catch (err) {
		console.error(err)
	}
	console.log(files)
	let myfile
	for (let file of files) {
		if ("wrapper/"+file.path === godImg_ipfsFile.path) {
			myfile = file
		}
	}

	let {hash} = myfile
	console.log(hash)


	let pinnedHashes = []
	let pinnedFiles = await ipfs.node.pin.ls()
	for (let file of pinnedFiles) {
		console.log(file)
		pinnedHashes.push(file.hash)
	}

	console.log(pinnedHashes)

	let hashCheck = []
	for (let hash of pinnedHashes) {
		if (hashCheck.includes(hash)) {
			console.log('duplicate hash: ', hash)
			continue
		}
		hashCheck.push(hash)
	}
	hashCheck = null

	for (let hash of pinnedHashes) {
		try {
			let res = await ipfs.node.pin.rm(hash)
			console.log('res: ', res)
		} catch (err) {
			console.error('hash not pinned: ', hash)
		}
	}

	pinnedHashes = []
	pinnedFiles = await ipfs.node.pin.ls()
	// console.log('pinnedFiles: ', pinnedFiles)
	for (let file of pinnedFiles) {
		// console.log(file)
		pinnedHashes.push(file.hash)
	}

	let catted
	try {
		catted = await ipfs.catFile(hash)
	} catch (err) {
		console.error(err)
	}

	console.log("catted file: ", catted)

	await ipfs.stop()
}

test()
