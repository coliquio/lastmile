const probe = require('./probe');
module.exports = async (probesConfig) => {
  let metrics = [];
  for (const probeConfig of probesConfig) {
    metrics.push(await probe(probeConfig));
  }
  return Promise.resolve(metrics);
};
