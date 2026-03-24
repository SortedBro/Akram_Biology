const AppError = require('../utils/AppError');

function ensureAuthenticated(req, res, next) {
  if (req.session?.userId) {
    return next();
  }

  req.flash('error', 'Please login to continue.');
  return res.redirect('/admin/login');
}

function ensureGuest(req, res, next) {
  if (req.session?.userId) {
    return res.redirect('/admin/dashboard');
  }
  return next();
}

function ensureRole(...roles) {
  return function roleMiddleware(req, res, next) {
    const role = req.session?.role;
    if (!role || !roles.includes(role)) {
      return next(new AppError('Access denied', 403));
    }
    return next();
  };
}

module.exports = {
  ensureAuthenticated,
  ensureGuest,
  ensureRole
};
