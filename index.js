process.on('exit', function() {
  console.log('Stopping worker');
});
process.on('SIGINT', function() {
  console.log('SIGINT, Stopping worker');
  process.exit(1);
});
const os = require('os');

const config = {
  log: true,
  environment: process.env.ENVIRONMENT || 'test',
  instanceName: process.env.INSTANCE || os.hostname(),
  instanceAddress: process.env.INSTANCE_ADDRESS,
  probesConfigUrl: process.env.PROBES_CONFIG_URL || 'file://./example/probes.json',
  probeOneShot: process.env.PROBE_ONE_SHOT === 'yes',
  probeInterval: parseInt(process.env.PROBE_INTERVAL || '60000'),
  pushgatewayDisabled: process.env.PUSHGATEWAY_DISABLED === 'yes',
  pushgatewayUrl: process.env.PUSHGATEWAY_URL || 'http://localhost:9091',
  pushgatewayAuth: process.env.PUSHGATEWAY_AUTH,
}

const run = require('./src/run');
const evaluateMetrics = require('./src/evaluateMetrics');

const firstRun = run(config);
if (config.probeOneShot) {
  firstRun.then(metrics => {
    const {status, exitCode} = evaluateMetrics(metrics);
    console.log(`Probes finished with status = ${status} (${exitCode})`);
    process.exit(exitCode);
  });
} else {
  setInterval(() => {
    run(config);
  }, config.probeInterval);
}
