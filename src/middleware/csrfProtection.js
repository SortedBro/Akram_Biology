const crypto = require('crypto');
const AppError = require('../utils/AppError');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function ensureToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
}

function csrfViewToken(req, res, next) {
  res.locals.csrfToken = ensureToken(req);
  next();
}

function csrfValidate(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const sessionToken = ensureToken(req);
  const sentToken =
    req.body?._csrf ||
    req.query?._csrf ||
    req.headers['x-csrf-token'] ||
    req.headers['csrf-token'];

  if (!sentToken || sentToken !== sessionToken) {
    return next(new AppError('Invalid session token. Please refresh and try again.', 403));
  }

  return next();
}

module.exports = {
  csrfViewToken,
  csrfValidate
};
