const errorHandler = (err, req, res, next) => {
	if (err.name === "ValidationError") {
		// will enter here for CastError and ValidatorError (custom, required and unique validators)
		// that occur during operations that involves writing to db
		return res.status(400).json(err.message);
	}
};

module.exports = errorHandler;
