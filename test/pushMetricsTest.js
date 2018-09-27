const assert = require('assert');
const express = require('express');
const pushMetrics = require('../src/pushMetrics');
const basicAuth = require('basic-auth-connect');

describe('pushMetrics', () => {
  let latestReceivedReq = [];
  let server;
  beforeEach((done) => {
    const app = express();
    app.use(basicAuth('lastmile', 'secret'));
    app.use (function(req, res, next) {
      var data='';
      req.setEncoding('utf8');
      req.on('data', function(chunk) { 
        data += chunk;
      });
      req.on('end', function() {
        req.body = data;
        next();
      });
    });
    app.all('*', (req, res) => {
      latestReceivedReq.push({
        path: req.path,
        method: req.method,
        body: req.body
      });
      res.status(200).send({hello: 'world'});
    });
    server = app.listen(done);
  });
  afterEach(() => {
    latestReceivedReq = [];
    server.close();
  });
  
  it('deletes and sends metrics', async () => {
    const res = await pushMetrics({
      url: `http://localhost:${server.address().port}`,
      auth: 'lastmile:secret',
      instance: 'hostname_i1',
      instance_address: '192.0.0.3',
      environment: 'test'
    }, [
      {
        duration: 1337,
        err_code: 'ERR_FOO',
        probe_status: 1
      },
      {
        protocol: 'https',
        socket_src_address: '172.0.0.3',
        socket_dst_family: 'IPv4',
        socket_dst_address: '52.0.0.3',
        socket_tls_protocol: 'TLSv3',
        req_url: 'https://example.com/foo',
        req_host: 'example.com',
        req_port: '443',
        req_path: '/foo',
        req_method: 'GET',
        res_status: 200,
        duration: 140,
        probe_status: 0
      }
    ]);
    assert.equal(res.statusCode, 200);
    assert.equal('/metrics/job/lastmile/environment/test/instance/hostname_i1', latestReceivedReq[0].path);
    assert.equal('DELETE', latestReceivedReq[0].method);
    assert.equal(`# HELP lastmile_http_request_time_milliseconds duration of the request from lastmile
# TYPE lastmile_http_request_time_milliseconds gauge
lastmile_http_request_time_milliseconds{instance="hostname_i1",instance_address="192.0.0.3",err_code="ERR_FOO",probe_status="1"} 1337
lastmile_http_request_time_milliseconds{instance="hostname_i1",instance_address="192.0.0.3",protocol="https",req_url="https://example.com/foo",req_host="example.com",req_port="443",req_path="/foo",req_method="GET",socket_tls_protocol="TLSv3",socket_src_address="172.0.0.3",socket_dst_family="IPv4",socket_dst_address="52.0.0.3",res_status="200",probe_status="0"} 140

# HELP lastmile_probe_status probe status (0=ok, 1=error)
# TYPE lastmile_probe_status gauge
lastmile_probe_status{instance="hostname_i1",instance_address="192.0.0.3"} 1
lastmile_probe_status{instance="hostname_i1",instance_address="192.0.0.3",protocol="https",req_url="https://example.com/foo",req_host="example.com",req_port="443",req_path="/foo",req_method="GET"} 0
`, latestReceivedReq[1].body);
    assert.equal('/metrics/job/lastmile/environment/test/instance/hostname_i1', latestReceivedReq[1].path);
    assert.equal('POST', latestReceivedReq[1].method);
  });
});
