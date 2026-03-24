const env = require('../config/env');

function viewLocals(req, res, next) {
  res.locals.appName = env.appName;
  res.locals.hideHeader = false;
  res.locals.currentPath = req.path;
  res.locals.currentUser = req.session?.user || null;
  res.locals.successMessages = req.flash('success');
  res.locals.errorMessages = req.flash('error');
  next();
}

module.exports = viewLocals;
