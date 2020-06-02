class TransientError extends Error {
  constructor(message) {
    super(message);

    this.name = 'TransientError';
  }
}

module.exports = TransientError;