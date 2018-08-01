const getValidationError = message => {
  return {
    name: "ValidationError",
    message
  };
};
module.exports = {
  getValidationError
};
