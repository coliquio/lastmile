process.on('exit', function() {
  console.log('Stopping worker');
});
process.on('SIGINT', function() {
  console.log('SIGINT, Stopping worker');
  process.exit(1);
});
const os = require('os');

const PUSHGATEWAY_DISABLED = process.env.PUSHGATEWAY_DISABLED === 'yes';
const PUSHGATEWAY_URL = process.env.PUSHGATEWAY_URL || 'http://localhost:9091';
const PUSHGATEWAY_AUTH = process.env.PUSHGATEWAY_AUTH;
const PROBES_CONFIG_URL = process.env.PROBES_CONFIG_URL || 'file://./example/probes.json';
const INSTANCE = process.env.INSTANCE || os.hostname();
const INSTANCE_ADDRESS = process.env.INSTANCE_ADDRESS;
const ENVIRONMENT = process.env.ENVIRONMENT || 'test';
const PROBE_INTERVAL = parseInt(process.env.PROBE_INTERVAL || '60000');
const PROBE_ONE_SHOT = process.env.PROBE_ONE_SHOT === 'yes';

const probeAll = require('./src/probeAll');
const pushMetrics = require('./src/pushMetrics');
const loadProbesConfig = require('./src/loadProbesConfig');
const enrichMetrics = require('./src/enrichMetrics');
const evaluateMetrics = require('./src/evaluateMetrics');

const run = async () => {
  try {
    const probesConfig = await loadProbesConfig(PROBES_CONFIG_URL);
    const metrics = await probeAll(probesConfig);
    const enrichedMetrics = enrichMetrics(metrics, probesConfig);
    console.log(JSON.stringify(enrichedMetrics));
    if (!PUSHGATEWAY_DISABLED) {
      try {
        await pushMetrics({
          url: PUSHGATEWAY_URL,
          auth: PUSHGATEWAY_AUTH,
          environment: ENVIRONMENT,
          instance: INSTANCE,
          instance_address: INSTANCE_ADDRESS,
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
const result = run();
if (PROBE_ONE_SHOT) {
  result.then(metrics => {
    const {status, exitCode} = evaluateMetrics(metrics);
    console.log(`Probes finished with status = ${status} (${exitCode})`);
    process.exit(exitCode);
  });
} else {
  setInterval(() => {
    run();
  }, PROBE_INTERVAL);
}