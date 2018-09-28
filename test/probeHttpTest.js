const assert = require('assert');
const express = require('express');
const probeHttp = require('../src/probeHttp');

describe('probeHttp', () => {
  let server;
  beforeEach((done) => {
    const app = express();
    app.get('/simulate/ok', (req, res) => {
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
        statusCode: 200
      }
    });
    assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    assert.deepEqual({
      probe_status: 0,
      res_status: 200,
      socket_dst_family: 'IPv4',
      socket_dst_address: '127.0.0.1',
      socket_src_family: 'IPv4',
      socket_src_address: '127.0.0.1'
    }, metrics);
  });

  it('returns metrics with failed expectations', async () => {
    const metrics = await probeHttp({
      host: 'localhost',
      port: server.address().port,
      path: '/simulate/500',
      expect: {
        statusCode: 200
      }
    });
    assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    assert.deepEqual({
      probe_status: 1,
      probe_failed_expectations: 'RES_STATUS',
      res_status: 500,
      socket_dst_family: 'IPv4',
      socket_dst_address: '127.0.0.1',
      socket_src_family: 'IPv4',
      socket_src_address: '127.0.0.1'
    }, metrics);
  });

  it('returns metrics for timeout', async () => {
    const metrics = await probeHttp({
      host: 'localhost',
      port: server.address().port,
      path: '/simulate/timeout',
      timeout: 500,
      expect: {
        statusCode: 200
      }
    });
    assert(metrics.duration >= 500, `duration >= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    assert.deepEqual({
      probe_status: 2,
      err_code: 'TIMEOUT',
    }, metrics);
  });
});
