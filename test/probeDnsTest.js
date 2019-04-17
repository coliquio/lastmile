const assert = require('assert');
const probeDns = require('../src/probeDns');

describe('probeDns', () => {
  it('returns metrics', async () => {
    const metrics = await probeDns({
      host: 'example.s3-website.eu-central-1.amazonaws.com',
      expect: {}
    });
    assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    delete metrics.res_addresses;
    assert.deepEqual({
      probe_status: 0
    }, metrics);
  });

  it('returns metrics with expectation', async () => {
    const metrics = await probeDns({
      host: 'example.s3-website.eu-central-1.amazonaws.com',
      expect: {
        address: 's3-website.eu-central-1.amazonaws.com'
      }
    });
    assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    assert.deepEqual({
      probe_status: 0,
      res_addresses: 's3-website.eu-central-1.amazonaws.com'
    }, metrics);
  });

  it('returns metrics with failed expectations', async () => {
    const metrics = await probeDns({
      host: 'example.s3-website.eu-central-1.amazonaws.com',
      expect: {
        address: 'this-does-not-match'
      }
    });
    assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    assert.deepEqual({
      probe_status: 1,
      probe_failed_expectations: 'ADDRESS',
      res_addresses: 's3-website.eu-central-1.amazonaws.com'
    }, metrics);
  });

  it('returns metrics for ENOTFOUND', async () => {
    const metrics = await probeDns({
      host: 'this-does-not-exist',
      expect: {}
    });
    assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    assert.deepEqual({
      probe_status: 2,
      err_code: 'ENOTFOUND'
    }, metrics);
  });

  it('returns metrics for expected err_code', async () => {
    const metrics = await probeDns({
      host: 'this-does-not-exist',
      expect: {
        err_code: 'ENOTFOUND'
      }
    });
    assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    assert.deepEqual({
      probe_status: 0,
      err_code: 'ENOTFOUND'
    }, metrics);
  });

  it('returns metrics for unexpected err_code', async () => {
    const metrics = await probeDns({
      host: 'this-does-not-exist',
      expect: {
        err_code: 'FOO'
      }
    });
    assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    assert.deepEqual({
      probe_status: 1,
      err_code: 'ENOTFOUND',
      probe_failed_expectations: 'ERR_CODE'
    }, metrics);
  });
  
  it('returns metrics for unexpected resolve success', async () => {
    const metrics = await probeDns({
      host: 'example.s3-website.eu-central-1.amazonaws.com',
      expect: {
        err_code: 'ENOTFOUND'
      }
    });
    assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    assert.deepEqual({
      probe_status: 1,
      probe_failed_expectations: 'ERR_CODE',
      res_addresses: 's3-website.eu-central-1.amazonaws.com'
    }, metrics);
  });

  it('returns metrics for timeout', async () => {
    class ResolverMock {
      resolveAny(host, callback) {
        setTimeout(() => {
          callback()
        }, 1000)
      }
      cancel() {
        ResolverMock.cancelled = true
      }
    }
    ResolverMock.cancelled = false
    const metrics = await probeDns({
      host: 'example.s3-website.eu-central-1.amazonaws.com',
      expect: {
        err_code: 'TIMEOUT'
      },
      timeout: 500
    }, ResolverMock);
    assert(metrics.duration >= 500, `duration >= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    assert.deepEqual({
      probe_status: 2,
      err_code: 'TIMEOUT'
    }, metrics);
    assert.deepEqual(ResolverMock.cancelled, true)
  });
});
