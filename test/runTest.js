const assert = require('assert');
const run = require('../src/run');

describe('run', () => {
  it('returns enriched metrics', async () => {
    const mockModulesResults = {
      loadProbesConfig: {},
      probeAll: {},
      enrichMetrics: {},
      pushMetrics: {}
    };
    const mockModules = {
      loadProbesConfig: (url, defaultConfig) => {
        mockModulesResults.loadProbesConfig.url = url;
        return [{url: 'http://example.com', userAgent: defaultConfig.userAgent, dns_resolvers: ['8.8.8.8']}];
      },
      probeAll: (probesConfig, onProgress) => {
        mockModulesResults.probeAll.probesConfig = probesConfig;
        mockModulesResults.probeAll.onProgress = onProgress;
        return [{res_code: 200}];
      },
      enrichMetrics: (metrics, probeConfig) => {
        return [{enriched: true, metrics, probeConfig}];
      },
      pushMetrics: (config, metrics) => {
        mockModulesResults.pushMetrics.config = config;
        mockModulesResults.pushMetrics.metrics = metrics;
        return;
      }
    };
    const result = await run({
      probesConfigUrl: 'file://./probe_config.json',
      userAgent: 'test-user-agent',
      fakeTime: 1337,
      __version: 'x.x.x'
    }, mockModules);
    assert.deepEqual('file://./probe_config.json', mockModulesResults.loadProbesConfig.url);
    assert.deepEqual([{url: 'http://example.com', userAgent: 'test-user-agent', dns_resolvers: ['8.8.8.8']}], mockModulesResults.probeAll.probesConfig);
    assert.deepEqual('function', typeof mockModulesResults.probeAll.onProgress);
    assert.deepEqual([{
      enriched: true,
      metrics: [{res_code: 200}],
      probeConfig: [{url: 'http://example.com', userAgent: 'test-user-agent', dns_resolvers: ['8.8.8.8']}]
    }], result);
    assert.deepEqual({
      url: undefined,
      auth: undefined,
      environment: undefined,
      instance: undefined,
      instance_address: undefined,
      lastmile_version: 'x.x.x',
      timestamp: 1337
    }, mockModulesResults.pushMetrics.config);
    assert.deepEqual(result, mockModulesResults.pushMetrics.metrics);
  });
});