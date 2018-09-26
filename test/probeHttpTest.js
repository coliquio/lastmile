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
      path: '/simulate/ok'
    });
    assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    assert.deepEqual({
      res_status: 200,
      socket_family: 'IPv4',
      socket_dst_ip: '127.0.0.1'
    }, metrics);
  });

  it('returns metrics for timeout', async () => {
    const metrics = await probeHttp({
      host: 'localhost',
      port: server.address().port,
      path: '/simulate/timeout',
      timeout: 500
    });
    assert(metrics.duration >= 500, `duration >= 500, but was ${metrics.duration}`);
    delete metrics.duration;
    assert.deepEqual({
      err_code: 'TIMEOUT',
    }, metrics);
  });
});
