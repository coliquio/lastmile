const parseProbeConfig = require('../src/parseProbeConfig');
const assert = require('assert');
describe('parseProbeConfig', () => {
  it('parses probe config', () => {
    assert.deepEqual({
      type: 'http',
      host: 'example.com',
      port: '80'
    }, parseProbeConfig({url: 'http://example.com'}));
    assert.deepEqual({
      type: 'https',
      host: 'example.com',
      port: '443'
    }, parseProbeConfig({url: 'https://example.com'}));
  });
});
