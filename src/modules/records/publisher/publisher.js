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

  setTimestamp (timestamp) {
    if (typeof timestamp !== 'number') { throw new Error('Timestamp must be a Number!') }

    if (String(timestamp).length === 13) {
      let seconds_time_string = parseInt(timestamp / 1000)
      this._publisher.timestamp = seconds_time_string
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

  setEmailMD5 (email_md5) {
    if (typeof email_md5 !== 'string') { throw new Error('Email MD5 must be a string!') }

    this._publisher.info.emailmd5 = email_md5
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

  setVerification (type, verification_url) {
    if (typeof type !== 'string') { throw new Error('Verification Type must be a string!') }

    if (typeof verification_url !== 'string') { throw new Error('Verification URL must be a string!') }

    // Test if verification type is allowed
    let supported_verification_types = Object.keys(this._publisher.verification)

    if (supported_verification_types.indexOf(type) === -1) { throw new Error(`Verification for ${type} is not yet supported!`) }

    this._publisher.verification[type] = verification_url
  }

  getVerification (type) {
    if (typeof type !== 'string') { throw new Error('Verification Type must be a string!') }

    // Test if verification type is allowed
    let supported_verification_types = Object.keys(this._publisher.verification)

    if (supported_verification_types.indexOf(type) === -1) { throw new Error(`Verification for ${type} is not yet supported!`) }

    return this._publisher.verification[type]
  }
}
