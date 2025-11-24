/* eslint-disable class-methods-use-this */
const fs = require('fs');
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

class S3Service {
  #DEFAULT_URL_EXPIRATION_IN_SECONDS = 30 * 60;

  #client;

  #bucket;

  constructor({ client = null, bucket = null } = {}) {
    this.#bucket = bucket || process.env.AWS_S3_BUCKET;
    this.#client = client || new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async upload({ fileKey, filePath }) {
    const fileStream = fs.createReadStream(filePath);
    await this.#runCommand(
      new PutObjectCommand({
        Bucket: this.#bucket,
        Key: fileKey,
        Body: fileStream,
      }),
    );
    return { fileKey };
  }

  async download({ fileKey, sizeLimit }) {
    const file = await this.#runCommand(
      new GetObjectCommand({ Bucket: this.#bucket, Key: fileKey }),
    );

    this.#validateSize(file.ContentLength, sizeLimit);
    return { stream: file.Body };
  }

  async getSignedUrl({ fileKey, expiresIn = this.#DEFAULT_URL_EXPIRATION_IN_SECONDS }) {
    if (await this.fileExists({ fileKey })) {
      const command = new GetObjectCommand({ Bucket: this.#bucket, Key: fileKey });
      const url = await getSignedUrl(this.#client, command, { expiresIn });
      return { fileKey, signedUrl: url, expiresIn };
    }
    return null;
  }

  async fileExists({ fileKey }) {
    try {
      await this.#runCommand(new HeadObjectCommand({ Bucket: this.#bucket, Key: fileKey }));
      return true;
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  #validateSize(fileSize, sizeLimit) {
    if (!sizeLimit) return;
    if (fileSize != null && fileSize > sizeLimit) {
      throw new Error('File size limit exceeded');
    }
  }

  #writeStreamToDisk(readStream, pathToWrite) {
    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(pathToWrite);
      readStream
        .pipe(writeStream)
        .on('finish', resolve)
        .on('error', reject);
    });
  }

  async #runCommand(command) {
    return this.#client.send(command);
  }
}

module.exports = S3Service;
