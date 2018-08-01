const {
  VALIDATION_ERROR,
  UNAUTHORISED_ERROR
} = require("../utils/getCustomErrors");

const errorHandler = (err, req, res, next) => {
  if (err.name === VALIDATION_ERROR) {
    // will enter here for CastError and ValidatorError (custom, required and unique validators)
    // that occur during operations that involves writing to db
    return res.status(400).json(err.message);
  }

  if (err.name === UNAUTHORISED_ERROR) return res.status(401).json(err.message);
};

module.exports = errorHandler;
