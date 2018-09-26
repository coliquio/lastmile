process.on('exit', function() {
  console.log('Stopping worker');
});
process.on('SIGINT', function() {
  console.log('SIGINT, Stopping worker');
  process.exit(1);
});
const os = require('os');

const PUSHGATEWAY_URL = process.env.PUSHGATEWAY_URL || 'http://localhost:9091';
const PUSHGATEWAY_AUTH = process.env.PUSHGATEWAY_AUTH;
const PROBES_CONFIG_URL = process.env.PROBES_CONFIG_URL || 'probes.json';
const INSTANCE = process.env.INSTANCE || os.hostname();
const ENVIRONMENT = process.env.ENVIRONMENT || 'test';

const probeAll = require('./src/probeAll');
const pushMetrics = require('./src/pushMetrics');
const loadProbesConfig = require('./src/loadProbesConfig');

setInterval(async () => {
  try {
    const probesConfig = await loadProbesConfig(PROBES_CONFIG_URL);
    const metrics = await probeAll(probesConfig);
    const publishMetrics = probesConfig.map((probeConfig, idx) => {
      return Object.assign({}, probeConfig, metrics[idx]);
    });
    console.log(publishMetrics);
    try {
      await pushMetrics({
        url: PUSHGATEWAY_URL,
        auth: PUSHGATEWAY_AUTH,
        environment: ENVIRONMENT,
        instance: INSTANCE
      }, publishMetrics);  
    } catch (e) {
      console.error('ERROR could not publish metrics', e);
    }
  } catch (e) {
    console.error(e);
  }
}, 1000);
