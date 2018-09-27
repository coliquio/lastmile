const parseProbeConfig = require('../src/parseProbeConfig');
const assert = require('assert');
describe('parseProbeConfig', () => {
  it('parses probe config', () => {
    assert.deepEqual({
      url: 'http://example.com',
      type: 'http',
      host: 'example.com',
      port: '80',
      expect: {
        statusCode: '2[0-9][0-9]'
      }
    }, parseProbeConfig({url: 'http://example.com'}));
    assert.deepEqual({
      url: 'https://example.com',
      type: 'https',
      host: 'example.com',
      port: '443',
      expect: {
        statusCode: '2[0-9][0-9]'
      }
    }, parseProbeConfig({url: 'https://example.com'}));
  });
});
