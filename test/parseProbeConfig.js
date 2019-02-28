const parseProbeConfig = require('../src/parseProbeConfig');
const assert = require('assert');
describe('parseProbeConfig', () => {
  it('parses http probe config without path', () => {
    assert.deepEqual({
      url: 'http://example.com',
      type: 'http',
      host: 'example.com',
      probe_env: 'probe-env',
      port: '80',
      path: '/',
      expect: {
        status_code: '2[0-9][0-9]'
      }
    }, parseProbeConfig({url: 'http://example.com', probe_env: 'probe-env'}));
  });

  it('parses http probe config', () => {
    assert.deepEqual({
      url: 'http://example.com/foo/bar',
      type: 'http',
      host: 'example.com',
      probe_env: 'probe-env',
      port: '80',
      path: '/foo/bar',
      expect: {
        status_code: '2[0-9][0-9]'
      }
    }, parseProbeConfig({url: 'http://example.com/foo/bar', probe_env: 'probe-env'}));
  });


  it('parses https probe config', () => {
    assert.deepEqual({
      url: 'https://example.com/foo/bar',
      type: 'https',
      host: 'example.com',
      probe_env: 'probe-env',
      port: '443',
      path: '/foo/bar',
      expect: {
        status_code: '2[0-9][0-9]'
      },
      tls: {
        ca: 'tls-ca-cert'
      }
    }, parseProbeConfig({url: 'https://example.com/foo/bar', tls: {ca: 'tls-ca-cert'}, probe_env: 'probe-env'}));
  });

  it('parses dns probe config', () => {
    assert.deepEqual({
      type: 'dns',
      host: 'example.com',
      probe_env: 'probe-env',
      expect: {}
    }, parseProbeConfig({type: 'dns', host: 'example.com', probe_env: 'probe-env'}));
  });

  it('parses invalid probe config', () => {
    assert.deepEqual(null, parseProbeConfig({foo: 'bar'}));
  });
});
