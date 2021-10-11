const assert = require('assert');
const probeAll = require('../src/probeAll');

describe('probeAll', () => {
  it('returns results and logs them while doing', async () => {
    const onProgressLog = [];
    const onProgress = (progress) => onProgressLog.push(progress);
    const probeConfigs = [1,2,3];
    const probeMock = (probeConfig) => {
      return Promise.resolve(`result #${probeConfig}`);
    };
    const result = await probeAll(probeConfigs, onProgress, probeMock);
    assert.deepEqual([
      'result #1',
      'result #2',
      'result #3'
    ], onProgressLog);
    assert.deepEqual(onProgressLog, result);
  });

  describe('performance', function() {
    // set threshold very low to about 100ms
    this.timeout(100); 

    // run 10x probes a 20ms
    // - sequence would take about 200ms and run into timeout (TEST FAIL)
    // - parallel would take about 20ms + overhead and not run into timeout (TEST PASS)
    it('runs slow probes in parallel', async () => {
      const probeMock = () => {
        return new Promise((resolve) => {
          setTimeout(resolve, 20);
        });
      };
      await probeAll([1,2,3,4,5,6,7,8,9,10], () => {}, probeMock);
    });
  });
});
