const assert = require('assert');
const config = require('../src/config');
describe('config', () => {
  it('returns config', () => {
    process.env.GIT_REF = 'test-git-ref';
    process.env.INSTANCE = 'test-instance';
    const cfg = config();
    cfg.userAgent = cfg.userAgent.replace(/\d+\.\d+\.\d+\)$/, 'x.y.z)');
    assert.deepEqual({
      log: true,
      userAgent: 'lastmile/test-git-ref (nodejs/vx.y.z)',
      environment: 'test',
      instanceName: 'test-instance',
      instanceAddress: undefined,
      probesConfigUrl: 'file://./example/probes.json',
      probeOneShot: false,
      probeInterval: 60000,
      pushgatewayDisabled: false,
      pushgatewayUrl: 'http://localhost:9091',
      pushgatewayAuth: undefined
    }, cfg);
  });
});
