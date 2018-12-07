import Artifact from './artifact'

class PropertyParty extends Artifact {
	constructor(artifact) {
		super(artifact)
	}

	/**
	 * Returns the Artifact Type (to be used before class initialization)
	 * @static
	 * @returns {string}
	 */
	static getArtifactType() {
		return "property"
	}

	/**
	 * Return the Artifact Subtype (to be used before class initialization)
	 * @returns {string}
	 */
	static getArtifactSubtype() {
		return "party"
	}

	/**
	 * Get Party Type
	 * @returns {string}
	 */
	getPartyType() {
		return this.artifact.details.partyType
	}

	/**
	 * Set Party Type
	 * @param {string} partyType
	 */
	setPartyType(partyType) {
		this.artifact.details.partyType = partyType
	}

	/**
	 * Get Party Role
	 * @returns {string}
	 */
	getPartRole() {
		return this.artifact.details.partyRole
	}

	/**
	 * Set Party Role
	 * @param {string} partyRole
	 */
	setPartyRole(partyRole) {
		this.artifact.details.partyRole = partyRole
	}

	/**
	 * Get Members
	 * @returns {Array.<String>}
	 */
	getMembers() {
		return this.artifact.details.members
	}

	/**
	 * Set Members
	 * @param {Array.<String>}members
	 */
	setMembers(members) {
		this.artifact.details.members = members
	}

	/**
	 * Get Namespace
	 * @returns {string}
	 */
	getNamespace() {
		return this.artifact.details.ns
	}

	/**
	 * Set Namespace
	 * @param {string} ns
	 */
	setNamespace(ns) {
		this.artifact.details.geometry.ns = ns
	}


	/**
	 * Return Attributes
	 * @returns {Object}
	 */
	getAttributes() {
		return this.artifact.details.attrs
	}

	/**
	 * Set Attributes
	 * @param {Object} attrs
	 */
	setAttributes(attrs) {
		this.artifact.details.attrs = attrs
	}

}

export default PropertyParty