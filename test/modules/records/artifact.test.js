import {Artifact, PropertyParty, PropertyTenure, PropertySpatialUnit, ResearchTomogram} from '../../../src/modules/records/artifact/index'

const oip41_artifact_wJSON = "5f399eef8f93c03502efbd51691350cbacbf3c16eba228409bf7453ffff78207"

const artifact041JSON = {
	"artifact": {
		"publisher": "FPkvwEHjddvva2smpYwQ4trgudwFcrXJ1X",
		"payment": {
			"addresses": [],
			"retailer": 15,
			"sugTip": [],
			"fiat": "USD",
			"scale": "1000:1",
			"promoter": 15,
			"maxdisc": 30
		},
		"storage": {
			"files": [
				{
					"fname": "headshot.jpg",
					"fsize": 100677,
					"type": "Image"
				}
			],
			"location": "QmUjSCcBda9YdEUKVLPQomHzSatwytPqQPAh4fdMiRV8bp",
			"network": "IPFS"
		},
		"type": "Image-Basic",
		"info": {
			"title": "Headshot",
			"extraInfo": {
				"artist": "David Vasandani",
				"genre": "People"
			}
		},
		"timestamp": 1531065099
	},
	"meta": {
		"block_hash": "a2ca4c3f06032dc4f9df7eca829b42b91da9595dbe9f4623a1c7f92a5508cfb9",
		"txid": "5f399eef8f93c03502efbd51691350cbacbf3c16eba228409bf7453ffff78207",
		"block": 2832215,
		"time": 1531065167,
		"type": "oip041"
	}
}

const artifactResearchTomogramJSON = {
	"artifact": {
		"signature": "IEoXQRwrF5AqT8imORattfcyin2xGDBHx2vpSLZf6+NHPT6G/TMhrDmWXyN8FasxV9zP9hopExx/yuFFrqoEsdM=",
		"subtype": "tomogram",
		"details": {
			"date": 1389657600,
			"strain": "P2",
			"tiltMax": 55,
			"dosage": 180,
			"magnification": 22500,
			"tiltStep": 1,
			"scopeName": "Caltech Polara",
			"NCBItaxID": 273057,
			"lab": "Jensen Lab",
			"tiltConstant": 1,
			"defocus": -10,
			"tiltSingleDual": 1,
			"sid": "rr2014-01-14-5",
			"institution": "Caltech",
			"tiltMin": -55,
			"speciesName": "Sulfolobus solfataricus ",
			"microscopist": "Rasika Ramdasi",
			"artNotes": "Tilt series notes: STIV - infected Sulfolobus solfataricus, Sulfolobus turreted \r\nicosahedral virus, Taxonomy ID 269145, Sulfolobus solfataricus, \r\nthermophile, pyramid, intrapyramidal body, virus infection \r\n\r\n10 hour post infection\n"
		},
		"storage": {
			"files": [
				{
					"fname": "AutoCaps/rr2014-01-14-5_slicer3727.jpg",
					"fsize": 157176,
					"subtype": "snapshot",
					"fNotes": "STIV turrets",
					"dname": "rr2014-01-14-5_slicer3727.jpg",
					"type": "tomogram"
				},
				{
					"fname": "AutoCaps/rr2014-01-14-5_slicer10483.jpg",
					"fsize": 364450,
					"subtype": "snapshot",
					"fNotes": "Baby pyramid STIV",
					"dname": "rr2014-01-14-5_slicer10483.jpg",
					"type": "tomogram"
				},
				{
					"fname": "AutoCaps/rr2014-01-14-5_slicer10560.jpg",
					"fsize": 214333,
					"subtype": "snapshot",
					"dname": "rr2014-01-14-5_slicer10560.jpg",
					"type": "tomogram"
				},
				{
					"fname": "AutoCaps/rr2014-01-14-5_slicer10561.jpg",
					"fsize": 216830,
					"subtype": "snapshot",
					"fNotes": "Sulfolobus liposomes",
					"dname": "rr2014-01-14-5_slicer10561.jpg",
					"type": "tomogram"
				},
				{
					"fname": "3dimage_37677/stiv10h3_0004_full.rec",
					"fsize": 623617024,
					"software": "Raptor",
					"subtype": "reconstruction",
					"dname": "stiv10h3_0004_full.rec",
					"type": "tomogram"
				},
				{
					"fname": "rawdata/stiv10h3_0004.mrc",
					"fsize": 3161185656,
					"software": "UCSFTomo",
					"subtype": "tiltSeries",
					"dname": "stiv10h3_0004.mrc",
					"type": "tomogram"
				},
				{
					"fname": "keyimg_rr2014-01-14-5_s.jpg",
					"fsize": 17177,
					"subtype": "thumbnail",
					"cType": "image/jpeg",
					"type": "image"
				},
				{
					"fname": "keyimg_rr2014-01-14-5.jpg",
					"fsize": 1028432,
					"subtype": "keyimg",
					"cType": "image/jpeg",
					"type": "tomogram"
				},
				{
					"fname": "keymov_rr2014-01-14-5.mp4",
					"fsize": 18321118,
					"subtype": "keymov",
					"cType": "video/mp4",
					"type": "tomogram"
				},
				{
					"fname": "keymov_rr2014-01-14-5.flv",
					"fsize": 57815879,
					"subtype": "keymov",
					"cType": "video/x-flv",
					"type": "tomogram"
				}
			],
			"location": "Qmat8i2pn4WnnMiPQcKsKJZahr1scUbuUyXjgSuCPBcsYY",
			"network": "ipfs"
		},
		"type": "research",
		"floAddress": "FTSTq8xx8yWUKJA5E3bgXLzZqqG9V6dvnr",
		"info": {
			"description": "Auto imported from etdb",
			"title": "Sulfolobus solfac.P2+STIV",
			"tags": "etdb,jensen.lab,tomogram,electron.tomography"
		},
		"timestamp": 1528156632
	},
	"meta": {
		"block_hash": "2581122c83779a504e9a2a5431e87d6cfbd9b728f3f404bbf28b2738452240ba",
		"txid": "8a07e957cce6473887e8f9d042b0a3b95fc7dd2b9110b4a37890887de6528f10",
		"block": 2783156,
		"time": 1528156646,
		"type": "oip042"
	}
}

const artifact041Payments = {
	"artifact": {
		"publisher": "FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k",
		"payment": {
			"addresses": [
				{
					"address": "1FjQxmrue5jdgVhmVMN3Y4XjXdtiDC257K",
					"token": "BTC"
				}
			],
			"retailer": 15,
			"sugTip": [],
			"fiat": "USD",
			"scale": "1000:1",
			"promoter": 15,
			"maxdisc": 30
		},
		"storage": {
			"files": [
				{
					"fname": "scout.jpg",
					"fsize": 1571667,
					"disBuy": true,
					"sugPlay": 1,
					"type": "Image"
				}
			],
			"location": "QmcEAy2sEp7dTdyPea7TCUe9zwpkwaxGZRiq9d79YyNxip",
			"network": "IPFS"
		},
		"type": "Image-Basic",
		"info": {
			"year": 2018,
			"description": "A super amazing puppy!",
			"title": "Scouty Test",
			"extraInfo": {
				"artist": "Sky Young",
				"genre": "Animals/Wildlife",
				"tags": [
					"Border Collie",
					"Puppy",
					"Dog"
				]
			}
		},
		"timestamp": 1532632036
	},
	"meta": {
		"block_hash": "b83d0ada97384cdf23866bbbce70fb94fc295bc3085318ab304c8eade9984df7",
		"txid": "9f02a90bd126bd5b2aa78a06821843eaf1e9ab338430da8fe8003933d317656c",
		"block": 2866488,
		"time": 1532632038,
		"type": "oip041"
	}
}

//======================================================================

describe("Artifact", () => {
	describe("Creation", () => {
		it("A Blank Artifact can be created", () => {
			let artifact = new Artifact();
			expect(artifact).toBeDefined();
			expect(artifact instanceof Artifact)
		})
		it('Should create a PropertyParty Artifact', () => {
			let artifact = new PropertyParty()
			expect(artifact).toBeDefined()
			expect(artifact instanceof PropertyParty).toBeTruthy()
			expect(artifact instanceof Artifact)
		})
		it('Should create a PropertyTenure Artifact', () => {
			let artifact = new PropertyTenure()
			expect(artifact).toBeDefined()
			expect(artifact instanceof PropertyTenure).toBeTruthy()
			expect(artifact instanceof Artifact)
		})
		it('Should create a PropertySpatialUnit Artifact', () => {
			let artifact = new PropertySpatialUnit()
			expect(artifact).toBeDefined()
			expect(artifact instanceof PropertySpatialUnit).toBeTruthy()
			expect(artifact instanceof Artifact)
		})
		it('Should create a ResearchTomogram Artifact', () => {
			let artifact = new ResearchTomogram()
			expect(artifact).toBeDefined()
			expect(artifact instanceof ResearchTomogram).toBeTruthy()
			expect(artifact instanceof Artifact)
		})
	})
	describe("Construction", () => {
		it('Create an Artifact from JSON string', () => {
			let artifact = new Artifact(artifact041JSON);
			expect(artifact.getTXID()).toBe("5f399eef8f93c03502efbd51691350cbacbf3c16eba228409bf7453ffff78207")
		})
		it("getTXID is undefined if not set", () => {
			let artifact = new Artifact();
			expect(artifact.getTXID()).toBeUndefined()
		})
		it("it setTXID and getTXID", () => {
			let artifact = new Artifact();
			artifact.setTXID("it-txid")
			expect(artifact.getTXID()).toBe("it-txid")
		})
		it("Get Publisher Name is blank string if main address is not set", () => {
			let artifact = new Artifact();
			expect(artifact.getPublisherName()).toBe("")
		})
		it("Get Publisher Name is main address if publisher name is not set", () => {
			let artifact = new Artifact();
			artifact.setPubAddress("main-address")
			expect(artifact.getPublisherName()).toBe("main-address")
		})
		it("Get Publisher Name is correct when set", () => {
			let artifact = new Artifact();
			artifact.setPubAddress("main-address")
			artifact.setPublisherName("publisher-name")
			expect(artifact.getPublisherName()).toBe("publisher-name")
		})
		it("setPubAddress and getPubAddress", () => {
			let artifact = new Artifact();
			artifact.setPubAddress("main-address")
			expect(artifact.getPubAddress()).toBe("main-address")
		})
		it("setTimestamp and getTimestamp allow seconds", () => {
			let artifact = new Artifact();
			let milisecondsTime = Date.now()
			let secondsTime = parseInt(milisecondsTime / 1000)
			artifact.setTimestamp(secondsTime)
			expect(artifact.getTimestamp()).toEqual(secondsTime)
		})
		it("setTimestamp and getTimestamp allow miliseconds", () => {
			let artifact = new Artifact();
			let milisecondsTime = Date.now()
			artifact.setTimestamp(milisecondsTime)
			expect(artifact.getTimestamp()).toEqual(milisecondsTime)
		})
		it("setTimestamp enforces that it is a number", () => {
			let artifact = new Artifact();
			let time = "not-time"
			artifact.setTimestamp(time)
			expect(artifact.getTimestamp()).toBeUndefined()
		})
		it("setTitle and getTitle", () => {
			let artifact = new Artifact();
			artifact.setTitle("title")
			expect(artifact.getTitle()).toBe("title")
		})
		it("getTitle is blank string if undefined", () => {
			let artifact = new Artifact();
			expect(artifact.getTitle()).toBe("")
		})
		it("setDescription and getDescription", () => {
			let artifact = new Artifact();
			artifact.setDescription("it description")
			expect(artifact.getDescription()).toBe("it description")
		})
		it("getDescription is blank string if undefined", () => {
			let artifact = new Artifact();
			expect(artifact.getDescription()).toBe("")
		})
		it("setType and getType", () => {
			let artifact = new Artifact();
			artifact.setType("Audio")
			expect(artifact.getType()).toBe("Audio")
		})
		it("setType capitalizeFirstLetter", () => {
			let artifact = new Artifact();
			artifact.setType("audio")
			expect(artifact.getType()).toBe("Audio")
		})
		it("setType doesn't allow non-supported base types", () => {
			let artifact = new Artifact();
			artifact.setType("Newtype")
			expect(artifact.getType()).toBeUndefined()
		})
		it("getType is undefined if undefined", () => {
			let artifact = new Artifact();
			expect(artifact.getType()).toBeUndefined()
		})
		it("setSubtype and getSubtype", () => {
			let artifact = new Artifact();
			artifact.setSubtype("Basic")
			expect(artifact.getSubtype()).toBe("Basic")
		})
		it("setSubtype capitalizeFirstLetter", () => {
			let artifact = new Artifact();
			artifact.setSubtype("basic")
			expect(artifact.getSubtype()).toBe("Basic")
		})
		it("getSubtype is undefined if undefined", () => {
			let artifact = new Artifact();
			expect(artifact.getSubtype()).toBeUndefined()
		})
		it("setYear and getYear", () => {
			let artifact = new Artifact();
			artifact.setYear(2018)
			expect(artifact.getYear()).toBe(2018)
		})
		it("setYear restricts to number", () => {
			let artifact = new Artifact();
			artifact.setYear("Year")
			expect(artifact.getYear()).toBeUndefined()
		})
		it("getYear is undefined if undefined", () => {
			let artifact = new Artifact();
			expect(artifact.getYear()).toBeUndefined()
		})
		it("setNSFW and getNSFW", () => {
			let artifact = new Artifact();
			artifact.setNSFW(true)
			expect(artifact.getNSFW()).toBe(true)
		})
		it("getNSFW is false if not set", () => {
			let artifact = new Artifact();
			expect(artifact.getNSFW()).toBe(false)
		})
		it("setTags can be defined by array", () => {
			let artifact = new Artifact();
			artifact.setTags(["tag1", "tag2", "tag3"])
			expect(artifact.getTags()).toEqual(["tag1", "tag2", "tag3"])
		})
		it("setTags can be defined from string", () => {
			let artifact = new Artifact();
			artifact.setTags("tag1, tag2, tag3")
			expect(artifact.getTags()).toEqual(["tag1", "tag2", "tag3"])
		})
		it("getTags is blank array if undefined", () => {
			let artifact = new Artifact();
			expect(artifact.getTags()).toEqual([])
		})
		it("setDetail", () => {
			let artifact = new Artifact();
			artifact.setDetail("artist", "Artist Name")
			expect(artifact.getDetail("artist")).toBe("Artist Name")
		})
		it("getDetail is undefined if undefined", () => {
			let artifact = new Artifact();
			expect(artifact.getDetail("artist")).toBeUndefined()
		})
		it("setSignature and getSignature", () => {
			let artifact = new Artifact();
			artifact.setSignature("signature")
			expect(artifact.getSignature()).toBe("signature")
		})
		it("getSignature is undefined if undefined", () => {
			let artifact = new Artifact();
			expect(artifact.getSignature()).toBeUndefined()
		})
		it("setNetwork and getNetwork", () => {
			let artifact = new Artifact();
			artifact.setNetwork("storj")
			expect(artifact.getNetwork()).toBe("storj")
		})
		it("getNetwork is IPFS if not set", () => {
			let artifact = new Artifact();
			expect(artifact.getNetwork()).toBe("IPFS")
		})
		it("setLocation and getLocation", () => {
			let artifact = new Artifact();
			artifact.setLocation("location")
			expect(artifact.getLocation()).toBe("location")
		})
		it("getLocation is undefined if not set", () => {
			let artifact = new Artifact();
			expect(artifact.getLocation()).toBeUndefined()
		})
		it("setPaymentFiat and getPaymentFiat", () => {
			let artifact = new Artifact();
			artifact.setPaymentFiat("usd")
			expect(artifact.getPaymentFiat()).toBe("usd")
		})
		it("getPaymentFiat is undefined if not set", () => {
			let artifact = new Artifact();
			expect(artifact.getPaymentFiat()).toBeUndefined()
		})
		it("setPaymentScale and getPaymentScale", () => {
			let artifact = new Artifact();
			artifact.setPaymentScale(1000)
			expect(artifact.getPaymentScale()).toBe(1000)
		})
		it("setPaymentScale from ratio string", () => {
			let artifact = new Artifact();
			artifact.setPaymentScale("1000:1")
			expect(artifact.getPaymentScale()).toBe(1000)
		})
		it("getPaymentScale is 1 if undefined", () => {
			let artifact = new Artifact();
			expect(artifact.getPaymentScale()).toBe(1)
		})
		it("setSuggestedTip and getSuggestedTip", () => {
			let artifact = new Artifact();
			artifact.setSuggestedTip([1, 100, 1000])
			expect(artifact.getSuggestedTip()).toEqual([1, 100, 1000])
		})
		it("getSuggestedTip is empty array if undefined", () => {
			let artifact = new Artifact();
			expect(artifact.getSuggestedTip()).toEqual([])
		})
		it("addPaymentAddresses and getPaymentAddress", () => {
			let artifact = new Artifact();
			artifact.addSinglePaymentAddress("flo", "F6esyn5opgUDcEdJpujxS9WLfu8Zj9XUZQ")
			artifact.addSinglePaymentAddress("ltc", "LbpjYYPwYBjoPQ44PrNZr7nTq7HkYgcoXN")
			artifact.addSinglePaymentAddress("btc", "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps")
			expect(artifact.getPaymentAddress(["flo"])).toEqual({flo: "F6esyn5opgUDcEdJpujxS9WLfu8Zj9XUZQ"})
		})
		it("addPaymentAddresses and getPaymentAddresses with input coins", () => {
			let artifact = new Artifact();
			artifact.addSinglePaymentAddress("flo", "F6esyn5opgUDcEdJpujxS9WLfu8Zj9XUZQ")
			artifact.addSinglePaymentAddress("ltc", "LbpjYYPwYBjoPQ44PrNZr7nTq7HkYgcoXN")
			artifact.addSinglePaymentAddress("btc", "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps")
			expect(artifact.getPaymentAddress(["flo", "ltc"])).toEqual(
				{
					flo: "F6esyn5opgUDcEdJpujxS9WLfu8Zj9XUZQ",
					ltc: "LbpjYYPwYBjoPQ44PrNZr7nTq7HkYgcoXN"
				})
		})
		it("addSinglePaymentAddress and getPaymentAddresses", () => {
			let artifact = new Artifact();
			artifact.addSinglePaymentAddress("flo", "FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k")
			expect(artifact.getPaymentAddresses()).toEqual({flo: "FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k"})
		})
		it("getPaymentAddresses is blank array if unset & no mainAddress is set", () => {
			let artifact = new Artifact();
			expect(artifact.getPaymentAddresses()).toEqual({})
		})
		it("getPaymentAddresses returns main address if unset", () => {
			let artifact = new Artifact();
			artifact.setPubAddress("FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k")
			expect(artifact.getPaymentAddresses()).toEqual({"flo": "FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k"})
		})
	})
})


//
// //==================================================================================================
//
// it("getPaymentAddress() 042 with string parameter", () => {
//     let artifact = new new Artifact(artifact042Dehydrated);
//     expect(artifact.getPaymentAddress("btc")).toEqual(
//         {
//             btc: "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
//         }
//     )
// })
//
// it("getPaymentAddress() 042 single item array", () => {
//     let artifact = new new Artifact(artifact042Dehydrated);
//     expect(artifact.getPaymentAddress(["btc"])).toEqual(
//         {
//             btc: "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
//         }
//     )
// })
//
//
// it("getPaymentAddress() 042 multiple coin array", () => {
//     let artifact = new new Artifact(artifact042Dehydrated);
//     expect(artifact.getPaymentAddress(["btc", "ltc"])).toEqual(
//         {
//             btc: "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
//             ltc: "LbpjYYPwYBjoPQ44PrNZr7nTq7HkYgcoXN"
//         }
//     )
// })
//
// it("getPaymentAddress() 042 no params", () => {
//     let artifact = new new Artifact(artifact042Dehydrated);
//     expect(artifact.getPaymentAddress()).toEqual({})
// })
//
// it("getPaymentAddresses() 042 no params",  () => {
//     let artifact = new new Artifact(artifact042Dehydrated);
//     expect(artifact.getPaymentAddresses()).toEqual(
//         {
//             btc: "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
//             ltc: "LbpjYYPwYBjoPQ44PrNZr7nTq7HkYgcoXN",
//             oip: "F6esyn5opgUDcEdJpujxS9WLfu8Zj9XUZQ"
//         }
//     )
// })
//
// it("getPaymentAddresses() 042 string params",  () => {
//     let artifact = new new Artifact(artifact042Dehydrated);
//     expect(artifact.getPaymentAddresses("oip")).toEqual(
//         {
//             oip: "F6esyn5opgUDcEdJpujxS9WLfu8Zj9XUZQ"
//         }
//     )
// })
//
// it("getPaymentAddresses() 042 single item array param",  () => {
//     let artifact = new new Artifact(artifact042Dehydrated);
//     expect(artifact.getPaymentAddresses(["oip"])).toEqual(
//         {
//             oip: "F6esyn5opgUDcEdJpujxS9WLfu8Zj9XUZQ"
//         }
//     )
// })
//
// //==================================================================================================
//
// it("getPaymentAddress() 041 with no params", () => {
//     let artifact041 = new new Artifact(artifact041Payments);
//     expect(artifact041.getPaymentAddress()).toEqual(
//         {}
//     )
// })
//
// it("getPaymentAddress() 041 with string parameter", () => {
//     let artifact041 = new new Artifact(artifact041Payments);
//     expect(artifact041.getPaymentAddress("btc")).toEqual(
//         {
//             btc: "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
//         }
//     )
// })
//
// it("getPaymentAddress() 041 with single item array", () => {
//     let artifact041 = new new Artifact(artifact041Payments);
//     expect(artifact041.getPaymentAddress(["btc"])).toEqual(
//         {
//             btc: "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
//         }
//     )
// })
//
// it("getPaymentAddress() 041 multiple coins", () => {
//     let artifact041 = new new Artifact(artifact041Payments);
//     expect(artifact041.getPaymentAddress(["btc", "ltc"])).toEqual(
//         {
//             btc: "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
//             ltc: "LbpjYYPwYBjoPQ44PrNZr7nTq7HkYgcoXN"
//         }
//     )
// })
//
// it("getPaymentAddresses() 041",  () => {
//     let artifact041 = new new Artifact(artifact041Payments);
//     expect(artifact041.getPaymentAddresses()).toEqual(
//         {
//             btc: "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
//             ltc: "LbpjYYPwYBjoPQ44PrNZr7nTq7HkYgcoXN",
//             oip: "F6esyn5opgUDcEdJpujxS9WLfu8Zj9XUZQ"
//         }
//     )
// })
//
// it("getPaymentAddresses() 041 with single string", () => {
//     let artifact041 = new new Artifact(artifact041Payments);
//     expect(artifact041.getPaymentAddresses("oip")).toEqual(
//         {
//             oip: "F6esyn5opgUDcEdJpujxS9WLfu8Zj9XUZQ"
//         }
//     )
// })
//
// it("getPaymentAddresses() 041 with single item array", () => {
//     let artifact041 = new new Artifact(artifact041Payments);
//     expect(artifact041.getPaymentAddresses(["oip"])).toEqual(
//         {
//             oip: "F6esyn5opgUDcEdJpujxS9WLfu8Zj9XUZQ"
//         }
//     )
// })
//
// it("getPaymentAddresses() 041 with multiple item array", () => {
//     let artifact041 = new new Artifact(artifact041Payments);
//     expect(artifact041.getPaymentAddresses(["oip", "btc"])).toEqual(
//         {
//             btc: "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
//             oip: "F6esyn5opgUDcEdJpujxS9WLfu8Zj9XUZQ"
//         }
//     )
// })
//
// //==================================================================================================
//
// it("getSupportedCoins() ", () => {
//     let artifact041 = new new Artifact(artifact041Payments);
//     expect(artifact041.getSupportedCoins()).toEqual(["btc", "ltc", "oip"])
// })
//
// it("getSupportedCoins() with string parameter", () => {
//     let artifact041 = new new Artifact(artifact041Payments);
//     expect(artifact041.getSupportedCoins("oip")).toEqual("oip")
// })
//
// it("getSupportedCoins() with string parameter bs coin", () => {
//     let artifact041 = new new Artifact(artifact041Payments);
//     expect(artifact041.getSupportedCoins("kazy")).toEqual("")
// })
//
// it("getSupportedCoins() with coin_array parameter", () => {
//     let artifact041 = new new Artifact(artifact041Payments);
//     expect(artifact041.getSupportedCoins(["btc", "ltc"])).toEqual(["btc", "ltc"])
// })
//
// it("getSupportedCoins() with non existant payment coin", () => {
//     let artifact041 = new new Artifact(artifact041Payments);
//     expect(artifact041.getSupportedCoins(["tron"])).toEqual([])
// })
//
//
// it("setRetailerCut and getRetailerCut", () => {
// 	let artifact = new new Artifact();
//
// 	artifact.setRetailerCut(10)
//
// 	expect(artifact.getRetailerCut()).toBe(10)
// })
//
// it("setRetailerCut cant be set by a string", () => {
// 	let artifact = new new Artifact();
//
// 	artifact.setRetailerCut("string")
//
// 	expect(artifact.getRetailerCut()).toBe(0)
// })
//
// it("getRetailerCut is 0 if unset", () => {
// 	let artifact = new new Artifact();
//
// 	expect(artifact.getRetailerCut()).toBe(0)
// })
//
// it("setPromoterCut and getPromoterCut", () => {
// 	let artifact = new new Artifact();
//
// 	artifact.setPromoterCut(10)
//
// 	expect(artifact.getPromoterCut()).toBe(10)
// })
//
// it("setPromoterCut cant be set by a string", () => {
// 	let artifact = new new Artifact();
//
// 	artifact.setPromoterCut("string")
//
// 	expect(artifact.getPromoterCut()).toBe(0)
// })
//
// it("getPromoterCut is 0 if unset", () => {
// 	let artifact = new new Artifact();
//
// 	expect(artifact.getPromoterCut()).toBe(0)
// })
//
// it("setMaxDiscount and getMaxDiscount", () => {
// 	let artifact = new new Artifact();
//
// 	artifact.setMaxDiscount(30)
//
// 	expect(artifact.getMaxDiscount()).toBe(30)
// })
//
// it("setMaxDiscount cant be set by string", () => {
// 	let artifact = new new Artifact();
//
// 	artifact.setMaxDiscount("string")
//
// 	expect(artifact.getMaxDiscount()).toBe(0)
// })
//
// it("getMaxDiscount is 0 if unset", () => {
// 	let artifact = new new Artifact();
//
// 	expect(artifact.getMaxDiscount()).toBe(0)
// })
//
// it("addFile ArtifactFile object", () => {
// 	let artifact = new new Artifact();
//
// 	let file = new ArtifactFile();
//
// 	artifact.addFile(file);
//
// 	expect(artifact.getFiles()[0].toJSON()).toEqual(file.toJSON())
// })
//
// it("addFile json object", () => {
// 	let artifact = new new Artifact();
//
// 	let file = new ArtifactFile();
//
// 	artifact.addFile(file.toJSON());
//
// 	expect(artifact.getFiles()[0].toJSON()).toEqual(file.toJSON())
// })
//
// it("getFiles is blank array if undefined", () => {
// 	let artifact = new new Artifact();
//
// 	expect(artifact.getFiles()).toEqual([])
// })
//
// it("getThumbnail Image and Thumbnail set", () => {
// 	let artifact = new new Artifact();
//
// 	let file = new ArtifactFile();
//
// 	file.setType("Image")
//
// 	artifact.addFile(file);
//
// 	let file2 = new ArtifactFile();
//
// 	file2.setType("Image")
// 	file2.setSubtype("Thumbnail")
//
// 	artifact.addFile(file2);
//
// 	expect(artifact.getThumbnail().toJSON()).toEqual(file2.toJSON())
// })
//
// it("getThumbnail get free Image & not paid thumbnail", () => {
// 	let artifact = new new Artifact();
//
// 	let file = new ArtifactFile();
//
// 	file.setType("Image")
// 	file.setSubtype("Thumbnail")
// 	file.setSuggestedPlayCost(1)
//
// 	artifact.addFile(file);
//
// 	let file2 = new ArtifactFile();
//
// 	file2.setType("Image")
//
// 	artifact.addFile(file2);
//
// 	expect(artifact.getThumbnail().toJSON()).toEqual(file2.toJSON())
// })
//
// it("getThumbnail is undefined if no files are available", () => {
// 	let artifact = new new Artifact();
//
// 	expect(artifact.getThumbnail()).toBe(undefined)
// })
//
// it("getThumbnail is undefined if no free images are found", () => {
// 	let artifact = new new Artifact();
//
// 	let file = new ArtifactFile();
//
// 	file.setType("Image")
// 	file.setSuggestedPlayCost(1)
//
// 	artifact.addFile(file);
//
// 	expect(artifact.getThumbnail()).toBe(undefined)
// })
//
// it("getThumbnail is undefined if no free thumbnails are found", () => {
// 	let artifact = new new Artifact();
//
// 	let file = new ArtifactFile();
//
// 	file.setType("Image")
// 	file.setSubtype("Thumbnail")
// 	file.setSuggestedPlayCost(1)
//
// 	artifact.addFile(file);
//
// 	expect(artifact.getThumbnail()).toBe(undefined)
// })
//
// it("getDuration is undefined if no files have a duration", () => {
// 	let artifact = new new Artifact();
//
// 	artifact.addFile(new ArtifactFile())
// 	artifact.addFile(new ArtifactFile())
// 	artifact.addFile(new ArtifactFile())
//
// 	expect(artifact.getDuration()).toBeUndefined()
// })
//
// it("getDuration returns the duration of a found file", () => {
// 	let artifact = new new Artifact();
//
// 	artifact.addFile(new ArtifactFile())
//
// 	let file = new ArtifactFile();
//
// 	file.setDuration(123)
//
// 	artifact.addFile(file)
//
// 	artifact.addFile(new ArtifactFile())
//
// 	expect(artifact.getDuration()).toBe(123)
// })
//
// it("isValid requires title and mainAddress to be set", () => {
// 	let artifact = new new Artifact();
//
// 	artifact.setTitle("title")
// 	artifact.setPubAddress("FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k")
//
// 	expect(artifact.isValid()).toEqual({success: true})
// })
//
// it("isValid fails on only title", () => {
// 	let artifact = new new Artifact();
//
// 	artifact.setTitle("title")
//
// 	expect(artifact.isValid()).toEqual({success: false, error: "floAddress is a Required Field!"})
// })
//
// it("isValid fails on only mainAddress", () => {
// 	let artifact = new new Artifact();
//
// 	artifact.setPubAddress("FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k")
//
// 	expect(artifact.isValid()).toEqual({success: false, error: "Artifact Title is a Required Field"})
// })
//
// it("isPaid no files", () => {
// 	let artifact = new new Artifact();
//
// 	expect(artifact.isPaid()).toBe(false)
// })
//
// it("isPaid only free files", () => {
// 	let artifact = new new Artifact();
//
// 	artifact.addFile(new ArtifactFile())
// 	artifact.addFile(new ArtifactFile())
// 	artifact.addFile(new ArtifactFile())
// 	artifact.addFile(new ArtifactFile())
//
// 	expect(artifact.isPaid()).toBe(false)
// })
//
// it("isPaid one paid file several free files", () => {
// 	let artifact = new new Artifact();
//
// 	artifact.addFile(new ArtifactFile())
// 	artifact.addFile(new ArtifactFile())
// 	let file = new ArtifactFile()
// 	file.setSuggestedPlayCost(1);
// 	artifact.addFile(file);
// 	artifact.addFile(new ArtifactFile())
//
// 	expect(artifact.isPaid()).toBe(true)
// })
//
// it("toJSON", () => {
// 	let artifact = new new Artifact();
//
// 	expect(artifact.toJSON()).toEqual({
// 		"oip042": {
// 			"artifact": {
// 				"details": {},
// 				"floAddress": "",
// 				"info": {},
// 				"payment": {},
// 				"storage": {
// 					"files": [], "network": "IPFS"
// 				}
// 			}
// 		}
// 	})
// })
//
// it("fromJSON toJSON", () => {
// 	let artifact = new new Artifact({
// 		"oip042": {
// 			"artifact": {
// 				"details": {},
// 				"floAddress": "",
// 				"info": {
// 					"title": "it Title"
// 				},
// 				"payment": {},
// 				"storage": {
// 					"files": [], "network": "IPFS"
// 				}
// 			}
// 		}
// 	});
//
// 	expect(artifact.toJSON()).toEqual({
// 		"oip042": {
// 			"artifact": {
// 				"details": {},
// 				"floAddress": "",
// 				"info": {
// 					"title": "it Title"
// 				},
// 				"payment": {},
// 				"storage": {
// 					"files": [], "network": "IPFS"
// 				}
// 			}
// 		}
// 	})
// })
//
// it("import AlexandriaMedia", () => {
// 	let artifact = new new Artifact({
// 		"media-data":{
// 			"alexandria-media":{
// 				"torrent":"QmRA3NWM82ZGynMbYzAgYTSXCVM14Wx1RZ8fKP42G6gjgj",
// 				"publisher":"FTmRrnn3g9trv6WjBvG6r5ueCyey6tU9Ro",
// 				"timestamp":1432164849000,
// 				"type":"book",
// 				"info":{"title":"Bitcoin: A Peer-to-Peer Electronic Cash System","description":"Abstract. A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution. Digital signatures provide part of the solution, but the main benefits are lost if a trusted third party is still required to prevent double-spending. We propose a solution to the double-spending problem using a peer-to-peer network. The network timestamps transactions by hashing them into an ongoing chain of hash-based proof-of-work, forming a record that cannot be changed without redoing the proof-of-work. The longest chain not only serves as proof of the sequence of events witnessed, but proof that it came from the largest pool of CPU power. As long as a majority of CPU power is controlled by nodes that are not cooperating to attack the network, they'll generate the longest chain and outpace attackers. The network itself requires minimal structure. Messages are broadcast on a best effort basis, and nodes can leave and rejoin the network at will, accepting the longest proof-of-work chain as proof of what happened while they were gone.  satoshin@gmx.com www.bitcoin.org","year":2008,"extra-info":{"Bitcoin Address":"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa","DHT Hash":"QmRA3NWM82ZGynMbYzAgYTSXCVM14Wx1RZ8fKP42G6gjgj","artist":"Satoshi Nakamoto","filename":"bitcoin.pdf"}},"payment":{"amount":"0,0,0","currency":"USD","type":"tip"},"extras":""},"signature":"IMAgFowf8TFdaTLDb3MUwTermXEtuAv6NN/MvQt1nkNWzDSg0KfSSQfF1QnzS75OLzM08J2rTIZXFT2OH0QlaUU="},"txid":"aab940a3d233b2101ab1aa242da3727cc402a7d192b5af40ac80836aaa60c27f","block":1194848,"publisher-name":"satoshi"});
//
// 	expect(artifact.getTitle()).toBe("Bitcoin: A Peer-to-Peer Electronic Cash System")
// 	expect(artifact.getDetail('artist')).toBe("Satoshi Nakamoto")
// 	expect(artifact.getLocation()).toBe("QmRA3NWM82ZGynMbYzAgYTSXCVM14Wx1RZ8fKP42G6gjgj")
// 	expect(artifact.getNetwork()).toBe("IPFS")
// })
//
// it("import 041", () => {
// 	let artifact = new new Artifact({"block":2795950,
// 		"oip-041":{
// 			"artifact":{
// 				"publisher":"FEAFV8xroed1CyAx1mUH4iSyXvMZXhj6mZ",
// 				"timestamp":1529386915,
// 				"type":"Video-Basic",
// 				"info":{"title":"Open Index Protocol: Alice & Bob (and Izzy & Sam)","description":"This is a draft of an explainer animation for the Open Index Protocol. Please send any notes, questions or media requests to amy@alexandria.io","tags":"","year":2016,"nsfw":false,"extraInfo":{"artist":"Alexandria","genre":"Science & Technology"}},
// 				"storage":{"network":"IPFS","location":"QmTYNkdv12XKvLYV6n89j5Dp7rTTiGmdkYzL3eZXBRKcBH","files":[{"dname":"Introducing the Open Index Protocol (480p)","duration":146,"fname":"OIP_intro_video1_480p.mp4","fsize":40522567,"type":"Video","subtype":"SD480"},{"dname":"Introducing the Open Index Protocol (720p)","duration":146,"fname":"OIP_intro_video1_720p.mp4","fsize":70150121,"type":"Video","subtype":"HD720"},{"fname":"previewimage.png","fsize":1968602,"type":"Image","subtype":"cover"}]},
// 				"payment":{"fiat":"USD","scale":"1000:1","sugTip":[],"tokens":null,"addresses":[],"retailer":15,"promoter":15,"maxdisc":30}}},"txid":"d286baa9aa624677bb87e4cc806f847e75239ce9f0eb37b441ea3fc59e1c7933","publisherName":"publisher1"});
//
// 	expect(artifact.getTitle()).toBe("Open Index Protocol: Alice & Bob (and Izzy & Sam)")
// 	expect(artifact.getType()).toBe("Video")
// 	expect(artifact.getSubtype()).toBe("Basic")
// 	expect(artifact.getNetwork()).toBe("IPFS")
// 	expect(artifact.getLocation()).toBe("QmTYNkdv12XKvLYV6n89j5Dp7rTTiGmdkYzL3eZXBRKcBH")
// 	expect(artifact.getRetailerCut()).toBe(15)
// 	expect(artifact.getPromoterCut()).toBe(15)
//     expect(artifact.getPaymentAddresses()).toEqual({"oip": "FEAFV8xroed1CyAx1mUH4iSyXvMZXhj6mZ"})
// })
//
// it("import 042", () => {
// 	let artifact = new new Artifact({
// 		"oip042":{
// 			"artifact":{
// 				"floAddress":"FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k",
// 				"timestamp":1526153770,
// 				"type":"Image",
// 				"subtype":"Basic",
// 				"info":{"title":"Alexandria Logo","year":2018},
// 				"storage":{"network":"IPFS","location":"QmNmVHfXuh5Tub76H1fog7wSM8of4Njfm2j1oTg8ZYUBZm","files":[{"fname":"Alexandria.png","fsize":638001,"type":"Image"}]},
// 				"signature":"IO0i5yhuwDy5p93VdNvEAna6vsH3UmIert53RedinQV+ScLzESIX8+QrL4vsquCjaCY0ms0ZlaSeTyqRDXC3Iw4="}
// 			},"txid":"2c5140f5da2c7ab5434af0953e22fe4800b7e09ecbec2836fe91d6bbe771134e","publisherName":"OstlerDev"});
//
// 	expect(artifact.getTitle()).toBe("Alexandria Logo")
// 	expect(artifact.getYear()).toBe(2018)
// 	expect(artifact.getLocation()).toBe("QmNmVHfXuh5Tub76H1fog7wSM8of4Njfm2j1oTg8ZYUBZm")
// 	expect(artifact.getSignature()).toBe("IO0i5yhuwDy5p93VdNvEAna6vsH3UmIert53RedinQV+ScLzESIX8+QrL4vsquCjaCY0ms0ZlaSeTyqRDXC3Iw4=")
// 	expect(artifact.getTXID()).toBe("2c5140f5da2c7ab5434af0953e22fe4800b7e09ecbec2836fe91d6bbe771134e")
// 	expect(artifact.getPublisherName()).toBe("OstlerDev")
//     expect(artifact.getPaymentAddresses()).toEqual({"oip": "FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k"})
// })
//
// it("getMultiparts (too short)", () => {
// 	let artifact = new new Artifact();
//
// 	artifact.setPubAddress("mainAddress")
//
// 	artifact.setDescription("a short description")
//
// 	expect(artifact.getMultiparts()).toBeUndefined()
// })
//
// it("getMultiparts", () => {
// 	let artifact = new new Artifact();
//
// 	artifact.setPubAddress("mainAddress")
//
// 	artifact.setDescription("a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description ")
//
//     let expectedMultiparts = [
//         new Multipart('oip-mp(0,2,mainAddress,,):json:{"oip042":{"artifact":{"floAddress":"mainAddress","info":{"description":"a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very lo'),
//         new Multipart('oip-mp(1,2,mainAddress,,):ng description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description "},"details":{},"storage":{"network":"IPFS"'),
//         new Multipart('oip-mp(2,2,mainAddress,,):,"files":[]},"payment":{}}}}')
//     ]
//
// 	expect(artifact.getMultiparts()).toEqual(expectedMultiparts)
//     // artifact.getMultiparts()
// })
//
// it("fromMultiparts matches getMultiparts json identifier", () => {
// 	let artifact = new new Artifact([
// 		new Multipart('oip-mp(0,2,mainAddress,,):{"oip042":{"artifact":{"floAddress":"mainAddress","info":{"description":"a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very lo'),
// 		new Multipart('oip-mp(1,2,mainAddress,,):ng description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description "},"details":{},"storage":{"network":"IPFS"'),
// 		new Multipart('oip-mp(2,2,mainAddress,,):,"files":[]},"payment":{}}}}')
// 	]);
//
// 	expect(artifact.getMultiparts()).toEqual([
// 		new Multipart('oip-mp(0,2,mainAddress,,):{"oip042":{"artifact":{"floAddress":"mainAddress","info":{"description":"a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very lo'),
// 		new Multipart('oip-mp(1,2,mainAddress,,):ng description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description a very long description "},"details":{},"storage":{"network":"IPFS"'),
// 		new Multipart('oip-mp(2,2,mainAddress,,):,"files":[]},"payment":{}}}}')
// 	])
// })
//
// it("capitalizeFirstLetter", () => {
// 	let artifact = new new Artifact();
//
// 	expect(artifact.capitalizeFirstLetter("it")).toBe("it")
// 	expect(artifact.capitalizeFirstLetter("it")).toBe("it")
// 	expect(artifact.capitalizeFirstLetter("it")).toBe("it")
// 	expect(artifact.capitalizeFirstLetter("it")).toBe("it")
// 	expect(artifact.capitalizeFirstLetter("it")).toBe("it")
// 	expect(artifact.capitalizeFirstLetter("it")).toBe("it")
// })
//
// it("getClassName", () => {
// 	let artifact = new new Artifact();
// 	expect(artifact.getClassName()).toBe("Artifact")
// })

//==================================================================================================

// it("Construct Artifact with floData that has a json: prefix", async (done) => {
//     let Network = new Index();
//     let flo_data = await Network.getFloData(oip41_artifact_wJSON)
//     let art = new new Artifact(flo_data)
//     expect(art.isValid()).toBeTruthy()
//     done()
// }, 10000)
//
// it("Construct Artifact with floData (invalid multipart)", async () => {
//     const oip41_artifact_ = "8a5fae038747565fab39b992907ea738a56736806153741610ad53c6c38567eb"
//     let Network = new Index();
//     let flo_data = await Network.getFloData(oip41_artifact_)
//     let art = new new Artifact(flo_data)
//     // console.log(art)
//     expect(art.isValid()).toBeTruthy()
// })
//
// it("Construct Artifact with floData", async () => {
//     let Network = new Index();
//     let flo_data = await Network.getFloData(oip41_artifact_wJSON)
//     if (flo_data.startsWith("json:")) {flo_data = flo_data.slice(5)}
//     let art = new new Artifact(flo_data)
//     // console.log(art.isValid())
// })
//
// it("Artifact can be created from Multiparts", () => {
// 	let multipartStrings = [
// 		'oip-mp(0,1,FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k,,IPw0M1gDPlY21v7aFYyYBiM7C641PhnSLUAw0jla9B18FteQ6f8dHc2m0a0rpMNmh8gUjRDbHTFYqz4MD/S820Y=):{"oip-041":{"artifact":{"type":"Image-Basic","info":{"extraInfo":{"genre":"The Arts"},"title":"Alexandria Logo"},"storage":{"network":"IPFS","files":[{"fname":"Alexandria.png","fsize":638001,"type":"Image"}],"location":"QmNmVHfXuh5Tub76H1fog7wSM8of4Njfm2j1oTg8ZYUBZm"},"payment":{"fiat":"USD","scale":"1000:1","maxdisc":30,"promoter":15,"retailer":15,"sugTip":[],"addres',
// 		'oip-mp(1,1,FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k,2c5140f5da,H8fjRKrXyMJlxjZLGWxjzdJG/BW5Bn+k+tmud5yGf3sYGhAQDd+aYVtAC1H8LGy+w011kYPjApuF29jrcZPQJP4=):ses\":[]},\"timestamp\":1526153770,\"publisher\":\"FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k\"},\"signature\":\"IO0i5yhuwDy5p93VdNvEAna6vsH3UmIert53RedinQV+ScLzESIX8+QrL4vsquCjaCY0ms0ZlaSeTyqRDXC3Iw4=\"}}'
// 	]
//
// 	let artifact = new new Artifact();
//
// 	artifact.fromMultiparts(multipartStrings);
//
// 	expect(artifact.getLocation()).toBe("QmNmVHfXuh5Tub76H1fog7wSM8of4Njfm2j1oTg8ZYUBZm")
//
// 	let multiparts = artifact.getMultiparts();
//
// 	expect(multiparts.length).toBe(2);
//
// 	for (let mp in multiparts){
// 		expect(multipartStrings[mp]).toEqual(multiparts[mp].toString())
// 	}
// })

