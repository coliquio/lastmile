const _probe = require('./probe');
module.exports = async (probesConfig, onProgress, probe=_probe) => {
  return Promise.all(probesConfig.map(probeConfig => {
    return probe(probeConfig).then(metric => {
      onProgress(metric)
      return metric
    })
  }))
};
