/**
 * Middleware to log errors and provide proper error responses
 */

const errorLogger = (err, req, res, next) => {
  // Log error details
  console.error('=== SERVER ERROR ===');
  console.error(`Path: ${req.method} ${req.path}`);
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('===================');
  
  next(err); // Pass to next error handler
};

const errorResponder = (err, req, res, next) => {
  // Default to 500 (Internal Server Error)
  const status = err.status || 500;
  
  // Don't send stack traces in production
  const errorResponse = {
    error: err.message || 'Something went wrong',
    status: status
  };
  
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }
  
  // Avoid sending error response if headers already sent
  if (!res.headersSent) {
    res.status(status).json(errorResponse);
  }
};

module.exports = {
  errorLogger,
  errorResponder
};
