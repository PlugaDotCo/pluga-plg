const axios = require('./lib/axios');
const errors = require('./lib/errors');
const files = require('./lib/files');
const packge = require('./package.json');

module.exports = {
  axios,
  errors,
  files,
  version: packge.version,
};
