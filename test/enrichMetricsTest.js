const assert = require('assert');
const enrichMetrics = require('../src/enrichMetrics');
describe('enrichMetrics', () => {
  it('returns enriched metrics', () => {
    assert.deepEqual([{
      socket_dst_family: 'socket_dst_family',
      socket_dst_address: 'socket_dst_address',
      socket_src_family: 'socket_src_family',
      socket_src_address: 'socket_src_address',
      res_status: 'res_status',
      duration: 'duration',
      err_code: 'err_code',
      probe_type: 'type',
      probe_id: 'url',
      req_url: 'url',
      req_host: 'host',
      req_port: 'port',
      req_path: 'path',
      probe_env: 'probe-env',
      dns_resolvers: ['8.8.8.8'],
      record_type: 'A'
    }], enrichMetrics([{
      socket_dst_family: 'socket_dst_family',
      socket_dst_address: 'socket_dst_address',
      socket_src_family: 'socket_src_family',
      socket_src_address: 'socket_src_address',
      res_status: 'res_status',
      duration: 'duration',
      err_code: 'err_code'
    }], [{
      url: 'url',
      type: 'type',
      host: 'host',
      port: 'port',
      path: 'path',
      probe_env: 'probe-env',
      dns_resolvers: ['8.8.8.8'],
      record_type: 'A'
    }]));
  });
});