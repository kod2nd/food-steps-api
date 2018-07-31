const handleAsyncError = asyncMiddleware => {
	return async (req, res, next) => {
		try {
			await asyncMiddleware(req, res, next);
		} catch (err) {
			next(err);
		}
	};
};

module.exports = handleAsyncError;
