const axios = require('axios');
const AxiosLogger = require('axios-logger');

const instance = axios.create();

AxiosLogger.setGlobalConfig({ prefixText: 'Pluga' });
instance.interceptors.request.use(AxiosLogger.requestLogger, AxiosLogger.errorLogger);
instance.interceptors.response.use(AxiosLogger.responseLogger, AxiosLogger.errorLogger);

module.exports = instance;
