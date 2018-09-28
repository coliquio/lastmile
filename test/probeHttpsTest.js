const assert = require('assert');
const express = require('express');
const https = require('https');
const probeHttps = require('../src/probeHttps');
const fs = require('fs');

describe('probeHttps', () => {
  describe('cert-with-trusted-ca', () => {
    let server;
    beforeEach((done) => {
      const privateKey  = fs.readFileSync('test/assets/https-certs/https.srv.key', 'utf8');
      const certificate = fs.readFileSync('test/assets/https-certs/https.srv.crt', 'utf8');
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
      server = https.createServer({
        key: privateKey,
        cert: certificate
      }, app);
      server.listen(done);
    });
    afterEach(() => {
      server.close();
    });
    
    it('returns metrics', async () => {
      const metrics = await probeHttps({
        host: 'localhost',
        port: server.address().port,
        path: '/simulate/ok',
        expect: {
          statusCode: 200
        },
        tls: {
          ca: fs.readFileSync('test/assets/https-certs/https.ca.crt', 'utf8')
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
        socket_src_address: '127.0.0.1',
        socket_tls_procotol: 'TLSv1.2'
      }, metrics);
    });
    
    it('returns metrics with failed expectation', async () => {
      const metrics = await probeHttps({
        host: 'localhost',
        port: server.address().port,
        path: '/simulate/500',
        expect: {
          statusCode: 200
        },
        tls: {
          ca: fs.readFileSync('test/assets/https-certs/https.ca.crt', 'utf8')
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
        socket_src_address: '127.0.0.1',
        socket_tls_procotol: 'TLSv1.2'
      }, metrics);
    });

    it('returns metrics for timeout', async () => {
      const metrics = await probeHttps({
        host: 'localhost',
        port: server.address().port,
        path: '/simulate/timeout',
        expect: {
          statusCode: 200
        },
        tls: {
          ca: fs.readFileSync('test/assets/https-certs/https.ca.crt', 'utf8') 
        },
        timeout: 500
      });
      assert(metrics.duration >= 500, `duration >= 500, but was ${metrics.duration}`);
      delete metrics.duration;
      assert.deepEqual({
        probe_status: 2,
        err_code: 'TIMEOUT',
      }, metrics);
    });

    it('returns metrics for wrong hostname', async () => {
      const metrics = await probeHttps({
        host: '127.0.0.1',
        port: server.address().port,
        path: '/simulate/ok',
        expect: {
          statusCode: 200
        },
        tls: {
          ca: fs.readFileSync('test/assets/https-certs/https.ca.crt', 'utf8')
        }
      });
      assert(metrics.duration <= 500, `duration <= 500, but was ${metrics.duration}`);
      delete metrics.duration;
      assert.deepEqual({
        probe_status: 2,
        err_code: 'ERR_TLS_CERT_ALTNAME_INVALID'
      }, metrics);
    });
  });

  describe('cert-with-unknown-ca', () => {
    let server;
    beforeEach((done) => {
      const privateKey  = fs.readFileSync('test/assets/https-certs/https.srv.key', 'utf8');
      const certificate = fs.readFileSync('test/assets/https-certs/https.srv.crt', 'utf8');
      const app = express();
      app.get('/simulate/ok', (req, res) => {
        res.status(200).send({hello: 'world'});
      });
      server = https.createServer({
        key: privateKey,
        cert: certificate
      }, app);
      server.listen(done);
    });
    afterEach(() => {
      server.close();
    });
    
    it('returns metrics with err UNABLE_TO_VERIFY_LEAF_SIGNATURE', async () => {
      const metrics = await probeHttps({
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
        probe_status: 2,
        err_code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
      }, metrics);
    });
  });

  describe('cert-selfsigned', () => {
    let server;
    beforeEach((done) => {
      const privateKey  = fs.readFileSync('test/assets/https-certs/https.srv-selfsigned.key', 'utf8');
      const certificate = fs.readFileSync('test/assets/https-certs/https.srv-selfsigned.crt', 'utf8');
      const app = express();
      app.get('/simulate/ok', (req, res) => {
        res.status(200).send({hello: 'world'});
      });
      server = https.createServer({
        key: privateKey,
        cert: certificate
      }, app);
      server.listen(done);
    });
    afterEach(() => {
      server.close();
    });
    
    it('returns metrics with err DEPTH_ZERO_SELF_SIGNED_CERT', async () => {
      const metrics = await probeHttps({
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
        probe_status: 2,
        err_code: 'DEPTH_ZERO_SELF_SIGNED_CERT'
      }, metrics);
    });
  });
});
