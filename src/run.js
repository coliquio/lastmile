const probeAll = require('./probeAll');
const pushMetrics = require('./pushMetrics');
const loadProbesConfig = require('./loadProbesConfig');
const enrichMetrics = require('./enrichMetrics');

module.exports = async (config, modules = {
  probeAll,
  pushMetrics,
  loadProbesConfig,
  enrichMetrics
}) => {
  try {
    const probesConfig = await modules.loadProbesConfig(config.probesConfigUrl, {userAgent: config.userAgent});
    if (config.probeOneShot && config.log) process.stdout.write('[RUN]\n');
    const metrics = await modules.probeAll(probesConfig, () => {
      if (config.probeOneShot && config.log) process.stdout.write('.');
    });
    if (config.probeOneShot && config.log) process.stdout.write('\n[DONE]\n');
    const enrichedMetrics = modules.enrichMetrics(metrics, probesConfig);
    if (config.log) console.log(JSON.stringify(enrichedMetrics));
    if (!config.pushgatewayDisabled) {
      try {
        await modules.pushMetrics({
          url: config.pushgatewayUrl,
          auth: config.pushgatewayAuth,
          environment: config.environment,
          instance: config.instanceName,
          instance_address: config.instanceAddress,
          timestamp: config.fakeTime || (new Date()).getTime()
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
