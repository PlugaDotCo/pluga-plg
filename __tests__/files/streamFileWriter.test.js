const fs = require('fs');
const { PassThrough } = require('stream');

const StreamFileWriter = require('../../lib/files/streamFileWriter');

jest.mock('fs', () => ({
  createWriteStream: jest.fn(),
}));

describe('Stream file writer', () => {
  it('writes stream to disk successfully without callbacks', async () => {
    const readStream = new PassThrough();
    readStream.end('hello');

    const writeStream = new PassThrough();
    fs.createWriteStream.mockReturnValue(writeStream);

    const result = await StreamFileWriter.writeToDisk({
      stream: readStream,
      pathToWrite: '/tmp/file.txt',
    });

    expect(fs.createWriteStream).toHaveBeenCalledWith('/tmp/file.txt');
    expect(result).toEqual({ success: true });
  });

  describe('Callbacks', () => {
    it('calls onData callback with accumulated bytes', async () => {
      const readStream = new PassThrough();
      const writeStream = new PassThrough();
      fs.createWriteStream.mockReturnValue(writeStream);

      const onData = jest.fn();

      const promise = StreamFileWriter.writeToDisk({
        stream: readStream,
        pathToWrite: '/tmp/file.txt',
        callbacks: { onData },
      });

      readStream.write(Buffer.from('foo'));
      readStream.write(Buffer.from('bar'));
      readStream.end();

      await promise;

      expect(onData).toHaveBeenNthCalledWith(1, expect.any(Buffer), 3);
      expect(onData).toHaveBeenNthCalledWith(2, expect.any(Buffer), 6);
    });

    it('resolves with onEnd return value when provided', async () => {
      const readStream = new PassThrough();
      readStream.end('done');

      const writeStream = new PassThrough();
      fs.createWriteStream.mockReturnValue(writeStream);

      const onEnd = jest.fn(() => ({ finished: true }));

      const result = await StreamFileWriter.writeToDisk({
        stream: readStream,
        pathToWrite: '/tmp/file.txt',
        callbacks: { onEnd },
      });

      expect(onEnd).toHaveBeenCalled();
      expect(result).toEqual({ finished: true });
    });
  });

  describe('Errors', () => {
    it('throws typed error when onData throws', async () => {
      const readStream = new PassThrough();
      const writeStream = new PassThrough();
      fs.createWriteStream.mockReturnValue(writeStream);

      const onData = jest.fn(() => {
        throw new Error('onData failed');
      });

      const promise = StreamFileWriter.writeToDisk({
        stream: readStream,
        pathToWrite: '/tmp/file.txt',
        callbacks: { onData },
      });

      readStream.write(Buffer.from('boom'));

      await expect(promise).rejects.toMatchObject({
        type: 'onDataCallback',
      });
    });

    it('throws typed error when onEnd throws', async () => {
      const readStream = new PassThrough();
      readStream.end('done');

      const writeStream = new PassThrough();
      fs.createWriteStream.mockReturnValue(writeStream);

      const onEnd = jest.fn(() => {
        throw new Error('onEnd failed');
      });

      await expect(
        StreamFileWriter.writeToDisk({
          stream: readStream,
          pathToWrite: '/tmp/file.txt',
          callbacks: { onEnd },
        }),
      ).rejects.toMatchObject({
        type: 'onEndCallback',
      });

      expect(onEnd).toHaveBeenCalled();
    });

    it('wraps pipeline errors with StreamPipelineError', async () => {
      const readStream = new PassThrough();

      const writeStream = new PassThrough();
      fs.createWriteStream.mockReturnValue(writeStream);

      const pipelineError = new Error('pipeline failed');
      writeStream.destroy(pipelineError);

      await expect(
        StreamFileWriter.writeToDisk({
          stream: readStream,
          pathToWrite: '/tmp/file.txt',
        }),
      ).rejects.toMatchObject({
        type: 'StreamPipelineError',
      });
    });
  });
});
