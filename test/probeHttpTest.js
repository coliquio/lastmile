const assert = require('assert');
const express = require('express');
const probeHttp = require('../src/probeHttp');
const probeStatus = require('../src/probeStatus');

describe('probeHttp', () => {
  let server;
  let lastReqUserAgent;
  beforeEach((done) => {
    const app = express();
    app.get('/simulate/ok', (req, res) => {
      lastReqUserAgent = req.get('user-agent');
      res.status(200).send({hello: 'world'});
    });
    app.get('/simulate/500', (req, res) => {
      res.status(500).send({hello: 'world'});
    });
    app.get('/simulate/timeout', (req, res) => {
      setTimeout(() => {
        res.status(200).send({hello: 'world'});
      }, 1000);
    });
    server = app.listen(done);
  });
  afterEach(() => {
    server.close();
  });
  
  it('returns metrics', async () => {
    const metrics = await probeHttp({
      host: 'localhost',
      port: server.address().port,
      path: '/simulate/ok',
      expect: {
        status_code: 200
      }
    });
    assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    assert.deepEqual({
      probe_status: probeStatus.ok,
      res_status: 200,
      socket_dst_family: 'IPv4',
      socket_dst_address: '127.0.0.1',
      socket_src_family: 'IPv4',
      socket_src_address: '127.0.0.1'
    }, metrics);
  });

  it('sends user-agent header', async () => {
    await probeHttp({
      host: 'localhost',
      port: server.address().port,
      path: '/simulate/ok',
      expect: {
        status_code: 200
      },
      userAgent: 'user-agent-foo'
    });
    assert.equal(lastReqUserAgent, 'user-agent-foo');
  });

  it('returns metrics with failed expectations', async () => {
    const metrics = await probeHttp({
      host: 'localhost',
      port: server.address().port,
      path: '/simulate/500',
      expect: {
        status_code: 200
      }
    });
    assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    assert.deepEqual({
      probe_status: probeStatus.failedExpectation,
      probe_failed_expectations: 'RES_STATUS',
      res_status: 500,
      socket_dst_family: 'IPv4',
      socket_dst_address: '127.0.0.1',
      socket_src_family: 'IPv4',
      socket_src_address: '127.0.0.1'
    }, metrics);
  });

  it('returns metrics for refused port', async () => {
    const metrics = await probeHttp({
      host: 'localhost',
      port: 59999,
      path: '/',
      expect: {
        err_code: 'ECONNREFUSED'
      }
    });
    assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    assert.deepEqual({
      probe_status: probeStatus.ok,
      err_code: 'ECONNREFUSED'
    }, metrics);
  });

  it('returns metrics for failed expecation of timeout but instead refused port', async () => {
    const metrics = await probeHttp({
      host: 'localhost',
      port: 59999,
      path: '/',
      expect: {
        err_code: 'TIMEOUT'
      }
    });
    assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    assert.deepEqual({
      probe_status: probeStatus.failedExpectation,
      err_code: 'ECONNREFUSED'
    }, metrics);
  });

  it('returns metrics for error of successful response but instead refused port', async () => {
    const metrics = await probeHttp({
      host: 'localhost',
      port: 59999,
      path: '/',
      expect: {
        status_code: '200'
      }
    });
    assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    assert.deepEqual({
      probe_status: probeStatus.error,
      err_code: 'ECONNREFUSED'
    }, metrics);
  });

  it('returns metrics for timeout', async () => {
    const metrics = await probeHttp({
      host: 'localhost',
      port: server.address().port,
      path: '/simulate/timeout',
      timeout: 500,
      expect: {
        status_code: 200
      }
    });
    assert(metrics.duration >= 500, `duration >= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    assert.deepEqual({
      probe_status: probeStatus.error,
      err_code: 'TIMEOUT',
    }, metrics);
  });

  it('returns metrics for custom dns_resolver', async () => {
    const metrics = await probeHttp({
      host: 'www.example.com',
      port: '80',
      path: '/',
      expect: {
        status_code: 200
      },
      dns_resolvers: ['8.8.8.8']
    });
    assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    delete metrics.socket_dst_address;
    delete metrics.socket_src_address;
    assert.deepEqual({
      probe_status: probeStatus.ok,
      res_status: 200,
      socket_dst_family: 'IPv4',
      socket_src_family: 'IPv4',
    }, metrics);
  });
});
