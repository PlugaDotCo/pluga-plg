const AuthError = require('./authError');
const RateLimitError = require('./rateLimitError');
const TransientError = require('./transientError');

class Errors {
  static error(message) {
    return new Error(message);
  }

  static authError(message) {
    return new AuthError(message);
  }

  static rateLimitError(message, remaining) {
    return new RateLimitError(message, remaining);
  }

  static transientError(message) {
    return new TransientError(message);
  }
}

module.exports = {
  error: Errors.error,
  authError: Errors.authError,
  rateLimitError: Errors.rateLimitError,
  transientError: Errors.transientError
};
