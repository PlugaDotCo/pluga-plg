const StorageService = require('../storageService');
const AxiosService = require('./axiosService');

const service = new StorageService(new AxiosService());

async function downloadStream(params) {
  return service.download(params);
}

module.exports = { downloadStream };
