const probe = require('./probe');
module.exports = async (probesConfig, onProgress) => {
  let metrics = [];
  for (const probeConfig of probesConfig) {
    const metric = await probe(probeConfig);
    metrics.push(metric);
    onProgress(metric);
  }
  return Promise.resolve(metrics);
};
