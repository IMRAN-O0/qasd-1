const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errors);
  }
  next();
};

module.exports = { handleValidationErrors };