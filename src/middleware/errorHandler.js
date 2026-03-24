function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 'EBADCSRFTOKEN') {
    statusCode = 403;
    message = 'Invalid session token. Please refresh and try again.';
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate data found. Please use a different value.';
  }

  if (req.xhr || req.headers.accept?.includes('application/json')) {
    res.status(statusCode).json({
      status: err.status || 'error',
      message
    });
    return;
  }

  res.status(statusCode).render('errors/error', {
    title: `Error ${statusCode}`,
    statusCode,
    message
  });
}

module.exports = errorHandler;
