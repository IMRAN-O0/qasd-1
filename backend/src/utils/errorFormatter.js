const formatValidationErrors = (errors) => {
  const formattedErrors = {};
  errors.forEach(error => {
    if (!formattedErrors[error.param]) {
      formattedErrors[error.param] = [];
    }
    formattedErrors[error.param].push(error.msg);
  });
  return formattedErrors;
};

module.exports = {
  formatValidationErrors,
};