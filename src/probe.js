const probeHttp = require('./probeHttp');
const probeHttps = require('./probeHttps');
const probeDns = require('./probeDns');
const probeInvalid = require('./probeInvalid');

module.exports = (probeConfig) => {
  let result;
  if (probeConfig.type === 'http') {
    result = probeHttp(probeConfig);
  } else if (probeConfig.type === 'https') {
    result = probeHttps(probeConfig);
  } else if (probeConfig.type === 'dns') {
    result = probeDns(probeConfig);
  } else {
    result = probeInvalid(probeConfig);
  }
  return result;
};