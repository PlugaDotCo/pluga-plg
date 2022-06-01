require('dotenv').config()

const axios = require('axios');
const AxiosLogger = require('axios-logger');

const instance = axios.create();

const requestLogger = (request) => AxiosLogger.requestLogger(request, {
  params: true,
  data: true,
});

if (process.env.PLG_DEBUG) {
  AxiosLogger.setGlobalConfig({ prefixText: 'Pluga' });

  instance.interceptors.request.use(requestLogger, AxiosLogger.errorLogger);
  instance.interceptors.response.use(AxiosLogger.responseLogger, AxiosLogger.errorLogger);
}

module.exports = instance;
