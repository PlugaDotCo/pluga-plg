const StorageService = require('../../lib/files/storageService');

describe('Storage service', () => {
  let client;
  let service;
  const params = { foo: 'bar ' };
  const successResp = { success: true };
  let streamFileWriter;

  beforeEach(() => {
    client = {
      upload: jest.fn(),
      download: jest.fn(),
      fileExists: jest.fn(),
      getSignedUrl: jest.fn(),
    };

    service = new StorageService(client);
  });

  beforeEach(() => {
    client = {
      upload: jest.fn(),
      download: jest.fn(),
      getSignedUrl: jest.fn(),
      fileExists: jest.fn(),
    };

    streamFileWriter = {
      writeToDisk: jest.fn(),
    };

    service = new StorageService(client, streamFileWriter);
  });

  describe('upload', () => {
    it('delegates upload to client', async () => {
      client.upload.mockResolvedValue(successResp);

      const response = await service.upload(params);

      expect(client.upload).toHaveBeenCalledWith(params);

      expect(response).toEqual(successResp);
    });
  });

  describe('download', () => {
    it('downloads stream from client and writes it to disk', async () => {
      const stream = { fake: 'stream' };
      const expectedResult = { success: true };

      client.download.mockReturnValue({ stream });
      streamFileWriter.writeToDisk.mockResolvedValue(expectedResult);

      const result = await service.download(params);

      expect(client.download).toHaveBeenCalledWith(params);
      expect(streamFileWriter.writeToDisk).toHaveBeenCalledWith({
        stream,
        ...params,
      });
      expect(result).toBe(expectedResult);
    });
  });

  describe('fileExists', () => {
    it('delegates fileExists to client', async () => {
      client.fileExists.mockResolvedValue(successResp);

      const response = await service.fileExists(params);

      expect(client.fileExists).toHaveBeenCalledWith(params);
      expect(response).toBe(successResp);
    });
  });

  describe('getSignedUrl', () => {
    it('delegates getSignedUrl to client', async () => {
      client.getSignedUrl.mockResolvedValue(successResp);

      const response = await service.getSignedUrl(params);

      expect(client.getSignedUrl).toHaveBeenCalledWith(params);

      expect(response).toEqual(successResp);
    });
  });
});
