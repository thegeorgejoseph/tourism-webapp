class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // the error class only takes in message so it is automatically set
    this.statusCode = statusCode;
    this.status = String(this.statusCode).startsWith('4') ? 'failed' : 'error';
    this.isOperational = true; // we need to ensure that we are doing this type of error handling only for operational errors and not for programmatic errors also
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
