require('dotenv').config();

const axios = require('axios');
const AxiosLogger = require('axios-logger');

const instance = axios.create();

if (process.env.PLG_DEBUG) {
  AxiosLogger.setGlobalConfig({ prefixText: 'Pluga' });

  const requestLogger = (request) => AxiosLogger.requestLogger(request, {
    params: true,
    data: true,
  });

  instance.interceptors.request.use(requestLogger, AxiosLogger.errorLogger);
  instance.interceptors.response.use(AxiosLogger.responseLogger, AxiosLogger.errorLogger);
}

module.exports = instance;
