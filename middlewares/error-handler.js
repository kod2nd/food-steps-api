const { CastError } = require("mongoose").Error;
const {
  VALIDATION_ERROR,
  UNAUTHORISED_ERROR
} = require("../utils/getCustomErrors");

const errorHandler = (err, req, res, next) => {
  if (err instanceof CastError || err.name === VALIDATION_ERROR) {
    // will enter here for CastError and ValidatorError (custom, required and unique validators)
    // that occur during operations that involves writing to db
    // 2. will enter here for uncaught mongoose CastError
    return res.status(400).json(err.message);
  }

  if (err.name === UNAUTHORISED_ERROR) return res.status(401).json(err.message);
  next(err);
};

module.exports = errorHandler;
