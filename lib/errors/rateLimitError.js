class RateLimitError extends Error {
  constructor(message, remaining = 0) {
    super(message);

    this.name = 'RateLimitError';
    this.remaining = remaining;
  }
}

module.exports = RateLimitError;
