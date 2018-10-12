const os = require('os');

module.exports = () => ({
  log: true,
  userAgent: `lastmile/${process.env.GIT_REF} (nodejs/${process.version})`,
  environment: process.env.ENVIRONMENT || 'test',
  instanceName: process.env.INSTANCE || os.hostname(),
  instanceAddress: process.env.INSTANCE_ADDRESS,
  probesConfigUrl: process.env.PROBES_CONFIG_URL || 'file://./example/probes.json',
  probeOneShot: process.env.PROBE_ONE_SHOT === 'yes',
  probeInterval: parseInt(process.env.PROBE_INTERVAL || '60000'),
  pushgatewayDisabled: process.env.PUSHGATEWAY_DISABLED === 'yes',
  pushgatewayUrl: process.env.PUSHGATEWAY_URL || 'http://localhost:9091',
  pushgatewayAuth: process.env.PUSHGATEWAY_AUTH,
});
