const probeAll = require('./probeAll');
const pushMetrics = require('./pushMetrics');
const loadProbesConfig = require('./loadProbesConfig');
const enrichMetrics = require('./enrichMetrics');

module.exports = async (config) => {
  try {
    const probesConfig = await loadProbesConfig(config.probesConfigUrl);
    const metrics = await probeAll(probesConfig, () => {
      if (config.probeOneShot) process.stdout.write('.')
    });
    const enrichedMetrics = enrichMetrics(metrics, probesConfig);
    console.log(JSON.stringify(enrichedMetrics));
    if (!config.pushgatewayDisabled) {
      try {
        await pushMetrics({
          url: config.pushgatewayUrl,
          auth: config.pushgatewayAuth,
          environment: config.environment,
          instance: config.instanceName,
          instance_address: config.instanceAddress,
          timestamp: (new Date()).getTime()
        }, enrichedMetrics);
      } catch (e) {
        console.log(JSON.stringify({
          priority: 'error',
          message: 'ERROR could not publish metrics',
          error: e
        }));
      }
    }
    return enrichedMetrics;
  } catch (e) {
    console.log(JSON.stringify({
      priority: 'error',
      error: e
    }));
  }
};
