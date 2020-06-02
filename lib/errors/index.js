const AuthError = require('./authError');
const RateLimitError = require('./rateLimitError');
const TransientError = require('./transientError');

class Errors {
  static authError(message) {
    return new AuthError(message);
  }

  static rateLimitError(message, schedule, remaining) {
    return new RateLimitError(message, schedule, remaining);
  }

  static transientError(message) {
    return new TransientError(message);
  }
}

module.exports = {
  error: Error,
  authError: Errors.authError,
  rateLimitError: Errors.rateLimitError,
  transientError: Errors.transientError
};