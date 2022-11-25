const probeHttp = require('./probeHttp');
const probeHttps = require('./probeHttps');
const probeDns = require('./probeDns');
const probeInvalid = require('./probeInvalid');

module.exports = (probeConfig) => {
  let result;
  switch (probeConfig.typ) {
  case 'http':
    result = probeHttp(probeConfig);
    break;
  case 'https':
    result = probeHttps(probeConfig);
    break;
  case 'dns':
    result = probeDns(probeConfig);
    break;
  default:
    result = probeInvalid(probeConfig);
    break;
  }
  return result;
};