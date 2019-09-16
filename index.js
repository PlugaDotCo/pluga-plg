const fs = require('fs');
const axios = require('axios');

const package = JSON.parse(fs.readFileSync('./package.json'));

module.exports = {
  version: package.version,
  axios: axios
};
