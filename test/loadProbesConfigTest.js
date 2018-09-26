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
          { 'url': 'http://example.com:8080' },
          { 'url': 'https://example.com:8443' }
        ]);
      });
      server = app.listen(done);
    });
    afterEach(() => {
      server.close();
    });
    
    it('returns parsed config', async () => {
      const config = await loadProbesConfig(`http://localhost:${server.address().port}/config`);
      assert.deepEqual([
        { type: 'http', host: 'example.com', port: '8080' },
        { type: 'https', host: 'example.com', port: '8443' }
      ], config);
    });
  });
  describe('file', () => {
    it('returns parsed config', async () => {
      const config = await loadProbesConfig('file://test/assets/exampe-config.json');
      assert.deepEqual([
        { type: 'http', host: 'example.com', port: '80' },
        { type: 'https', host: 'example.com', port: '443' }
      ], config);
    });
  });
});
