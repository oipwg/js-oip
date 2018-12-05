it('error', () => {
	let m = {success: false, message: 'nah'}

	class ErrorX extends Error {
		constructor(...args) {
			super(...args)
			this.args = args
			console.log(this.args)
		}
		getArgs() {
			return this.args
		}
	}

	let err = new ErrorX('so coo', {success: false})
	console.log(err.message)
})