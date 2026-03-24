const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const message = errors
    .array()
    .map((error) => error.msg)
    .join(' | ');

  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return next(new AppError(message, 422));
  }

  req.flash('error', message);
  return res.redirect(req.get('Referrer') || '/');
}

module.exports = validateRequest;
