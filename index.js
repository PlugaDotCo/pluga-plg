const axios = require('axios');
const package = require('./package.json');

module.exports = {
  version: package.version,
  axios: axios
};
