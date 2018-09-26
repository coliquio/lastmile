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
      req_host: 'host',
      req_port: 'port',
      req_path: 'path'
    }], enrichMetrics([{
      socket_dst_family: 'socket_dst_family',
      socket_dst_address: 'socket_dst_address',
      socket_src_family: 'socket_src_family',
      socket_src_address: 'socket_src_address',
      res_status: 'res_status',
      duration: 'duration',
      err_code: 'err_code'
    }], [{
      type: 'type',
      host: 'host',
      port: 'port',
      path: 'path'
    }]));
  });
});