import OIPRecord from '../oip-record'

export default class Publisher extends OIPRecord {
  constructor () {
    super()

    this.txid = undefined
    this._publisher = {
      alias: undefined,
      floAddress: undefined,
      timestamp: undefined,
      authorized: [],
      info: {
        emailmd5: undefined,
        avatarNetwork: undefined,
        avatar: undefined,
        headerImageNetwork: undefined,
        headerImage: undefined
      },
      verification: {
        imdb: undefined,
        twitter: undefined,
        facebook: undefined
      }
    }
    this.signature = undefined
  }

  /**
   * Create message to use for Publisher signature
   * @see `alias-address-timestamp`: https://oip.wiki/Message_protocol#Publisher_Register_signature
   * @return {string}
   */
  createPreimage () {
    if (!this.getTimestamp()) { this.setTimestamp(Date.now()) }

    let preimage = `${this.getAlias() || ''}-${this.getMainAddress()}-${this.getTimestamp()}`
    this.preimage = preimage
    return preimage
  }

  /**
   * Check if the Publisher is Valid and has all the required fields to be registered
   * @return {StatusObject}
   */
  isValid () {
    if (!this._publisher.timestamp || isNaN(this._publisher.timestamp)) {
      return { success: false, error: 'Timestamp is a Required Field!' }
    }
    if (!this._publisher.floAddress || this._publisher.floAddress === '') {
      return { success: false, error: 'floAddress is a Required Field! Please set it using `setMainAddress`!' }
    }

    return { success: true }
  }

  toJSON() {
    return JSON.parse(JSON.stringify({ pub: this._publisher }))
  }

  serialize (method) {
    // convert this to json and extract artifact
    let publisherJSON = this.toJSON()
    let pub = publisherJSON.pub

    /* @ToDo: Reimplement publishing of `authorized`, `info`, and `verificatiton` once they are added to be supported by OIP daemon */
    // Remove `pub.authorized` section
    pub.authorized = undefined
    // Remove `pub.info` section
    pub.info = undefined
    // Remove `pub.verification` section
    pub.verification = undefined

    // setup initial object
    let pubMessage = { oip042: {} }
    // insert method type
    pubMessage['oip042'][method] = { pub, signature: this.signature }
    // add json prefix
    return 'json:' + JSON.stringify(pubMessage)
  }

  /**
   * Set the Signature of the Publisher
   * @example
   * publisher.setSignature("IO0i5yhuwDy5p93VdNvEAna6vsH3UmIert53RedinQV+ScLzESIX8+QrL4vsquCjaCY0ms0ZlaSeTyqRDXC3Iw4=")
   * @param {string} signature - The signature of the Publisher
   */
  setSignature (signature) {
    this.signature = signature
  }

  /**
   * Get the Signature of the Publisher
   * @example
   * let signature = publisher.getSignature()
   * @return {string} Returns `undefined` if signature is not set
   */
  getSignature () {
    return this.signature
  }

  setTXID (txid) {
    this.txid = txid
  }

  getTXID () {
    return this.txid
  }

  setAlias (alias) {
    if (typeof alias !== 'string') { throw new Error('Alias must be a string!') }

    this._publisher.alias = alias
  }

  getAlias () {
    return this._publisher.alias
  }

  setMainAddress (address) {
    this._publisher.floAddress = address
  }

  getMainAddress () {
    return this._publisher.floAddress
  }

  setPubAddress (address) {
    return this.setMainAddress(address)
  }

  getPubAddress () {
    return this.getMainAddress()
  }

  setTimestamp (timestamp) {
    if (typeof timestamp !== 'number') { throw new Error('Timestamp must be a Number!') }

    if (String(timestamp).length === 13) {
      let secondsTimeString = parseInt(timestamp / 1000)
      this._publisher.timestamp = secondsTimeString
    } else if (String(timestamp).length === 10) {
      this._publisher.timestamp = timestamp
    }
  }

  getTimestamp () {
    return this._publisher.timestamp
  }

  addAuthorizedAddress (address) {
    if (typeof address !== 'string') { throw new Error('Authorized Address must be a string!') }
  }

  getAuthorizedAddresses () {
    return this._publisher.authorized
  }

  setEmailMD5 (emailmd5) {
    if (typeof emailmd5 !== 'string') { throw new Error('Email MD5 must be a string!') }

    this._publisher.info.emailmd5 = emailmd5
  }

  getEmailMD5 () {
    return this._publisher.info.emailmd5
  }

  setAvatarNetwork (network) {
    if (typeof network !== 'string') { throw new Error('Network must be a string!') }

    this._publisher.info.avatarNetwork = network
  }

  getAvatarNetwork () {
    return this._publisher.info.avatarNetwork
  }

  setAvatar (avatar) {
    if (typeof avatar !== 'string') { throw new Error('Avatar Location must be a string!') }

    this._publisher.info.avatar = avatar
  }

  getAvatar () {
    return this._publisher.info.avatar
  }

  setHeaderNetwork (network) {
    if (typeof network !== 'string') { throw new Error('Network must be a string!') }

    this._publisher.info.headerImageNetwork = network
  }

  getHeaderNetwork () {
    return this._publisher.info.headerImageNetwork
  }

  setHeader (header) {
    if (typeof header !== 'string') { throw new Error('Header Location must be a string!') }

    this._publisher.info.headerImage = header
  }

  getHeader () {
    return this._publisher.info.headerImage
  }

  setVerification (type, verificationUrl) {
    if (typeof type !== 'string') { throw new Error('Verification Type must be a string!') }

    if (typeof verificationUrl !== 'string') { throw new Error('Verification URL must be a string!') }

    // Test if verification type is allowed
    let supportedVerificationTypes = Object.keys(this._publisher.verification)

    if (supportedVerificationTypes.indexOf(type) === -1) { throw new Error(`Verification for ${type} is not yet supported!`) }

    this._publisher.verification[type] = verificationUrl
  }

  getVerification (type) {
    if (typeof type !== 'string') { throw new Error('Verification Type must be a string!') }

    // Test if verification type is allowed
    let supportedVerificationTypes = Object.keys(this._publisher.verification)

    if (supportedVerificationTypes.indexOf(type) === -1) { throw new Error(`Verification for ${type} is not yet supported!`) }

    return this._publisher.verification[type]
  }
}
