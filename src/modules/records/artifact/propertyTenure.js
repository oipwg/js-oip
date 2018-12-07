import Artifact from './artifact'

class PropertyTenure extends Artifact {
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
		return "tenure"
	}

	/**
	 * Set Tenure Type
	 * @returns {string}
	 */
	getTenureType() {
		return this.artifact.details.tenureType
	}

	/**
	 * Set Tenure type
	 * @param {string} tenureType
	 */
	setTenureType(tenureType) {
		this.artifact.details.tenureType = tenureType
	}

	/**
	 * Return Tenures
	 * @returns {Array<String>}
	 */
	getTenures() {
		return this.artifact.details.tenures
	}

	/**
	 * Set Tenures
	 * @param {Array.<String>}tenures
	 */
	setTenures(tenures) {
		this.artifact.details.tenures = tenures
	}

	/**
	 * Get Namespace
	 * @returns {*}
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
	 * Get Spacial Unit
	 * @returns {*}
	 */
	getSpacialUnit() {
		return this.artifact.details.spacialUnit
	}

	/**
	 * Set Spacial Unit
	 * @param {string} spacialUnit
	 */
	setSpacialUnit(spacialUnit) {
		this.artifact.details.spacialUnit = spacialUnit
	}

	/**
	 * Get Party
	 * @returns {string}
	 */
	getParty() {
		return this.details.party
	}

	/**
	 * Set party
	 * @param {string} party
	 */
	setParty(party) {
		this.artifact.details.party = party
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

export default PropertyTenure