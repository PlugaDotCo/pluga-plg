/* eslint-disable class-methods-use-this */
const axios = require('../../axios');

class AxiosService {
  async download({
    downloadRequestParams: { downloadUrl, headers },
  }) {
    const res = await axios({
      method: 'get',
      url: downloadUrl,
      responseType: 'stream',
      headers,
    });

    return { stream: res.data };
  }
}

module.exports = AxiosService;
