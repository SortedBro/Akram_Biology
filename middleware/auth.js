// Protect admin routes
function isAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  req.flash('error', 'Please login to access admin panel');
  res.redirect('/admin/login');
}

// Redirect if already logged in
function isGuest(req, res, next) {
  if (req.session && req.session.isAdmin) return res.redirect('/admin/dashboard');
  next();
}

module.exports = { isAdmin, isGuest };
