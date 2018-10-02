const assert = require('assert');
const run = require('../src/run');

describe('run', () => {
  it('returns enriched metrics', async () => {
    const mockModulesResults = {
      loadProbesConfig: {},
      probeAll: {},
      enrichMetrics: {},
      pushMetrics: {}
    }
    const mockModules = {
      loadProbesConfig: (url) => {
        mockModulesResults.loadProbesConfig.url = url;
        return [{url: 'http://example.com'}]
      },
      probeAll: (probesConfig, onProgress) => {
        mockModulesResults.probeAll.probesConfig = probesConfig
        mockModulesResults.probeAll.onProgress = onProgress
        return [{res_code: 200}]
      },
      enrichMetrics: (metrics, probeConfig) => {
        mockModulesResults.enrichMetrics.metrics = metrics
        mockModulesResults.enrichMetrics.probeConfig = probeConfig
        return [{enriched: true}]
      },
      pushMetrics: (config, metrics) => {
        mockModulesResults.pushMetrics.config = config
        mockModulesResults.pushMetrics.metrics = metrics
        return;
      }
    }
    const result = await run({
      probesConfigUrl: 'file://./probe_config.json',
      fakeTime: 1337
    }, mockModules)
    assert.deepEqual('file://./probe_config.json', mockModulesResults.loadProbesConfig.url)
    assert.deepEqual([{url: 'http://example.com'}], mockModulesResults.probeAll.probesConfig)
    assert.deepEqual('function', typeof mockModulesResults.probeAll.onProgress)
    assert.deepEqual([{res_code: 200}], mockModulesResults.enrichMetrics.metrics)
    assert.deepEqual([{url: 'http://example.com'}], mockModulesResults.enrichMetrics.probeConfig)
    assert.deepEqual([{enriched: true}], result)
    assert.deepEqual({
      url: undefined,
      auth: undefined,
      environment: undefined,
      instance: undefined,
      instance_address: undefined,
      timestamp: 1337
    }, mockModulesResults.pushMetrics.config)
    assert.deepEqual([{enriched: true}], mockModulesResults.pushMetrics.metrics)
  })
})