const VALIDATION_ERROR = "ValidationError";
const UNAUTHORISED_ERROR = "UnauthorisedError";

const getValidationError = message => {
  return {
    name: VALIDATION_ERROR,
    message
  };
};

const getUnauthorisedError = message => {
  return {
    name: UNAUTHORISED_ERROR,
    message
  };
};

module.exports = {
  getValidationError,
  getUnauthorisedError,
  VALIDATION_ERROR,
  UNAUTHORISED_ERROR
};
