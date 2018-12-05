/**
 * A custom Error class that extends the JS Error class to allow for an additional argument while keeping the stack trace
 */
class ErrorX extends Error {
	/**
	 * Create a Custom Error (ErrorX === Error Extension)
	 * ##### Example
	 * ```javascript
	 * let customError = new ErrorX("Some custom error message", caughtError)
	 * customError.message === "Some custom error message" //true
	 * customError.err === caughtError //true
	 * ```
	 * ##### Usage
	 * ```javascript
	 * try {
	 *     let someResponse = await someApiCall()
	 * } catch (err) {
	 *     throw new ErrorX("Some custom error message", err)
	 * }
	 *
	 * ```
	 * @param {String} message - custom error message
	 * @param err - a caught error
	 */
	constructor(message, err) {
		super(message)

		this.err = err
	}
}

export default ErrorX