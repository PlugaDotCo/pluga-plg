const fs = require('fs');
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PassThrough } = require('stream');

const S3Service = require('../../../lib/files/remote/s3Service');

jest.mock('fs', () => ({
  createReadStream: jest.fn(),
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  PutObjectCommand: jest.fn((params) => params),
  GetObjectCommand: jest.fn((params) => params),
  HeadObjectCommand: jest.fn((params) => params),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('S3Service', () => {
  let mockSend;
  let s3Service;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSend = jest.fn();
    S3Client.mockImplementation(() => ({ send: mockSend }));

    s3Service = new S3Service({
      client: new S3Client(),
      bucket: 'foo-bucket',
    });
  });

  describe('upload', () => {
    it('uploads file to S3', async () => {
      const mockStream = {};
      fs.createReadStream.mockReturnValue(mockStream);
      mockSend.mockResolvedValue({});

      const result = await s3Service.upload({
        fileKey: 'foo',
        filePath: '/tmp/bar',
      });

      expect(fs.createReadStream).toHaveBeenCalledWith('/tmp/bar');
      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: 'foo-bucket',
        Key: 'foo',
        Body: mockStream,
      });
      expect(result).toEqual({ fileKey: 'foo' });
    });
  });

  describe('download', () => {
    it('downloads and writes file to disk', async () => {
      const mockReadStream = new PassThrough();
      mockReadStream.end('foo bar');

      mockSend.mockResolvedValue({
        Body: mockReadStream,
        ContentLength: 100,
      });

      const result = await s3Service.download({
        fileKey: 'foo',
      });

      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'foo-bucket',
        Key: 'foo',
      });

      expect(result).toEqual({
        stream: mockReadStream,
      });
    });

    it('throws error when size exceeds limit', async () => {
      mockSend.mockResolvedValue({
        Body: {},
        ContentLength: 9999,
      });

      await expect(
        s3Service.download({
          fileKey: 'foo',
          pathToWrite: '/tmp/y',
          sizeLimit: 10,
        }),
      ).rejects.toThrow('File size limit exceeded');
    });
  });

  describe('fileExists', () => {
    it('returns true if file exists', async () => {
      mockSend.mockResolvedValue({});

      const exists = await s3Service.fileExists({ fileKey: 'foo' });

      expect(exists).toBe(true);
    });

    it('returns false if file does not exist', async () => {
      const error = new Error('Not found');
      error.name = 'NotFound';
      mockSend.mockRejectedValue(error);

      const exists = await s3Service.fileExists({ fileKey: 'foo' });

      expect(exists).toBe(false);
    });
  });

  describe('getSignedUrl', () => {
    it('returns signedUrl if file exists', async () => {
      mockSend.mockResolvedValue({});
      getSignedUrl.mockResolvedValue('http://signed-url.com');

      const result = await s3Service.getSignedUrl({
        fileKey: 'foo',
        expiresIn: 123,
      });

      expect(result).toEqual({
        fileKey: 'foo',
        signedUrl: 'http://signed-url.com',
        expiresIn: 123,
      });
    });

    it('returns null if file does not exist', async () => {
      const error = new Error('Not found');
      error.name = 'NotFound';
      mockSend.mockRejectedValue(error);

      const result = await s3Service.getSignedUrl({ fileKey: 'foo' });

      expect(result).toBeNull();
    });
  });
});
