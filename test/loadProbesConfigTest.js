const assert = require('assert');
const express = require('express');
const loadProbesConfig = require('../src/loadProbesConfig');

describe('loadProbesConfig', () => {
  describe('http', () => {
    let server;
    beforeEach((done) => {
      const app = express();
      app.get('/config', (req, res) => {
        res.status(200).send([
          { 'url': 'http://example.com:8080/foo/baz' },
          { 'url': 'https://example.com:8443' },
          { 'type': 'dns', host: 'example.com' }
        ]);
      });
      server = app.listen(done);
    });
    afterEach(() => {
      server.close();
    });
    
    it('returns parsed config', async () => {
      const config = await loadProbesConfig(`http://localhost:${server.address().port}/config`, {userAgent: 'test-user-agent'});
      assert.deepEqual([
        {
          url: 'http://example.com:8080/foo/baz', type: 'http', host: 'example.com', port: '8080',
          expect: {
            statusCode: '2[0-9][0-9]'
          },
          path: '/foo/baz',
          'userAgent': 'test-user-agent'
        },
        {
          url: 'https://example.com:8443', type: 'https', host: 'example.com', port: '8443',
          expect: {
            statusCode: '2[0-9][0-9]'
          },
          path: '/',
          'userAgent': 'test-user-agent'
        },
        {
          type: 'dns', host: 'example.com',
          expect: {}
        }
      ], config);
    });
  });
  describe('file', () => {
    it('returns parsed config', async () => {
      const config = await loadProbesConfig('file://test/assets/exampe-config.json', {userAgent: 'test-user-agent'});
      assert.deepEqual([
        {
          url: 'http://example.com/foo/bar', type: 'http', host: 'example.com', port: '80',
          expect: {
            statusCode: '2[0-9][0-9]'
          },
          path: '/foo/bar',
          'userAgent': 'test-user-agent'
        },
        {
          url: 'https://example.com', type: 'https', host: 'example.com', port: '443',
          expect: {
            statusCode: '2[0-9][0-9]'
          },
          path: '/',
          'userAgent': 'test-user-agent'
        }
      ], config);
    });
  });
});
