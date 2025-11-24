/* eslint-disable class-methods-use-this */
const fs = require('fs');
const { pipeline } = require('stream');
const { promisify } = require('util');

const pipelineAsync = promisify(pipeline);

const Errors = {
  ON_DATA: 'onDataCallback',
  ON_END: 'onEndCallback',
  PIPELINE: 'StreamPipelineError',
};

class StreamFileWriter {
  static async writeToDisk({ stream, pathToWrite, callbacks = {} }) {
    const writableStream = fs.createWriteStream(pathToWrite);
    let callbackError = null;

    if (callbacks.onData) {
      this.#attachOnData(stream, callbacks.onData, (err) => {
        callbackError = err;
      });
    }

    try {
      await pipelineAsync(stream, writableStream);

      this.#throwIfCallbackFailed(callbackError);

      return callbacks.onEnd
        ? this.#handleOnEnd(callbacks.onEnd)
        : { success: true };
    } catch (err) {
      this.#throwIfCallbackFailed(callbackError);

      throw this.#normalizePipelineError(err);
    }
  }

  static #attachOnData(stream, onData, reportCallbackError) {
    let downloadedBytes = 0;

    const onDataHandler = (chunk) => {
      downloadedBytes += chunk.length;

      try {
        onData(chunk, downloadedBytes);
      } catch (err) {
        reportCallbackError(
          this.#buildError(Errors.ON_DATA, err),
        );

        stream.off('data', onDataHandler);
        stream.destroy(err);
      }
    };

    stream.on('data', onDataHandler);
  }

  static #handleOnEnd(onEnd) {
    try {
      return onEnd() ?? { success: true };
    } catch (err) {
      throw this.#buildError(Errors.ON_END, err);
    }
  }

  static #throwIfCallbackFailed(callbackError) {
    if (callbackError) {
      throw callbackError;
    }
  }

  static #normalizePipelineError(err) {
    if (err?.type && err?.error) {
      return err;
    }

    return this.#buildError(Errors.PIPELINE, err);
  }

  static #buildError(type, error) {
    return { type, error };
  }
}

module.exports = StreamFileWriter;
