const probeHttp = require('./probeHttp');
const probeHttps = require('./probeHttps');
const probeDns = require('./probeDns');
const probeInvalid = require('./probeInvalid');

module.exports = async (probeConfig) => {
  let result;
  if (probeConfig.type === 'http') {
    result = await probeHttp(probeConfig);
  } else if (probeConfig.type === 'https') {
    result = await probeHttps(probeConfig);
  } else if (probeConfig.type === 'dns') {
    result = await probeDns(probeConfig);
  } else {
    result = probeInvalid(probeConfig);
  }
  return result;
};