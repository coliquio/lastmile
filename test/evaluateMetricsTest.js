const assert = require('assert');
const evaluateMetrics = require('../src/evaluateMetrics');
describe('evaluateMetrics', () => {
  it('returns ok', () => {
    assert.deepEqual({
      exitCode: 0,
      status: 'OK'
    }, evaluateMetrics([
      {probe_status: 0},
      {probe_status: 0},
      {probe_status: 0}
    ]));
  });

  it('returns probe failed expectation', () => {
    assert.deepEqual({
      exitCode: 1,
      status: 'PROBE_FAILED_EXPECTATION'
    }, evaluateMetrics([
      {probe_status: 0},
      {probe_status: 1},
      {probe_status: 0}
    ]));
  });

  it('returns probe err', () => {
    assert.deepEqual({
      exitCode: 2,
      status: 'PROBE_ERR'
    }, evaluateMetrics([
      {probe_status: 0},
      {probe_status: 2},
      {probe_status: 0}
    ]));
  });

  it('returns err', () => {
    assert.deepEqual({
      exitCode: 3,
      status: 'ERR'
    }, evaluateMetrics());
  });
});