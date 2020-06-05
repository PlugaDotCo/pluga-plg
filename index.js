const axios = require('./lib/axios');
const errors = require('./lib/errors');
const package = require('./package.json');

module.exports = {
  axios: axios,
  errors: errors,
  version: package.version,
};
