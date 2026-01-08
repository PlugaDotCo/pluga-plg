const StreamFileWriter = require('./streamFileWriter');

class StorageService {
  #client;

  #streamFileWriter;

  constructor(client, streamFileWriter = StreamFileWriter) {
    this.#client = client;
    this.#streamFileWriter = streamFileWriter;
  }

  async upload(params) {
    return this.#client.upload(params);
  }

  async download(params) {
    const { stream } = this.#client.download(params);
    return this.#streamFileWriter.writeToDisk({ stream, ...params });
  }

  async getSignedUrl(params) {
    return this.#client.getSignedUrl(params);
  }

  async fileExists(params) {
    return this.#client.fileExists(params);
  }
}

module.exports = StorageService;
