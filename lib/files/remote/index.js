const StorageService = require('../storageService');
const S3Service = require('./s3Service');

const s3Service = new S3Service();
const storageService = new StorageService(s3Service);

module.exports = storageService;
