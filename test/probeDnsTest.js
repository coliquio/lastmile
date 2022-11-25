const assert = require('assert');
const probeDns = require('../src/probeDns');
const probeStatus = require('../src/probeStatus');

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
      probe_status: probeStatus.ok,
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
      probe_status: probeStatus.ok,
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
      probe_status: probeStatus.failedExpectation,
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
      probe_status: probeStatus.error,
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
      probe_status: probeStatus.ok,
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
      probe_status: probeStatus.failedExpectation,
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
      probe_status: probeStatus.failedExpectation,
      probe_failed_expectations: 'ERR_CODE',
      res_addresses: 's3-website.eu-central-1.amazonaws.com'
    }, metrics);
  });

  it('returns metrics for timeout', async () => {
    class ResolverMock {
      resolveAny(host, callback) {
        setTimeout(() => {
          callback();
        }, 1000);
      }
      cancel() {
        ResolverMock.cancelled = true;
      }
    }
    ResolverMock.cancelled = false;
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
      probe_status: probeStatus.error,
      err_code: 'TIMEOUT'
    }, metrics);
    assert.deepEqual(ResolverMock.cancelled, true);
  });

  it('returns metrics for broken custom dns_resolver ECONNREFUSED', async () => {
    const metrics = await probeDns({
      host: 'example.s3-website.eu-central-1.amazonaws.com',
      expect: {},
      dns_resolvers: ['127.0.0.123'] // should not have local resolver
    });
    assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    delete metrics.res_addresses;
    assert.deepEqual({
      err_code: 'ECONNREFUSED',
      probe_status: probeStatus.error
    }, metrics);
  });

  it('returns metrics for custom dns_resolver', async () => {
    const metrics = await probeDns({
      host: 'www.example.com',
      expect: {},
      dns_resolvers: ['8.8.8.8'] // google resolves any
    });
    assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    delete metrics.res_addresses;
    assert.deepEqual({
      probe_status: probeStatus.ok
    }, metrics);
  });
});
