const measureDurationInMs = require('./measureDurationInMs');
const probeStatus = require('./probeStatus');
const matchHttpExpectation = require('./matchHttpExpectation');
const https = require('https');
module.exports = async (config) => {
  const getDurationInMs = measureDurationInMs();
  const options = {
    host: config.host,
    port: config.port,
    path: config.path || '/',
    method: config.method || 'GET'
  };
  if (typeof config.tls === 'object' && typeof config.tls.ca === 'string') {
    options.agent = new https.Agent({
      ca: config.tls.ca
    });
  }
  return new Promise((resolvePromise) => {
    let result = {};
    let timedOut = false;
    const resolve = (value) => {
      clearTimeout(timeout);
      resolvePromise(value);
    };
    const request = https.request(options, (res) => {
      const expectationMatch = matchHttpExpectation(config, res);
      result.probe_status = expectationMatch.ok ? probeStatus.ok : probeStatus.failedExpectation;
      if (!expectationMatch.ok) result.probe_failed_expectations = expectationMatch.failedExpectations.join(',');
      result.res_status = res.statusCode;
      result.socket_dst_family = res.socket.remoteFamily;
      result.socket_dst_address = res.socket.remoteAddress;
      result.socket_src_family = res.socket.address().family;
      result.socket_src_address = res.socket.address().address;
      result.socket_tls_procotol = res.socket.getProtocol();
      res.on('data', () => {});
      res.on('end', () => {
        resolve(Object.assign({
          duration: getDurationInMs()
        }, result));
      });
    });
    request.on('error', (e) => {
      resolve(Object.assign({
        probe_status: probeStatus.error,
        err_code: timedOut ? 'TIMEOUT' : e.code,
        duration: getDurationInMs()
      }, result));
    });
    request.end();
    const timeout = setTimeout(() => {
      timedOut = true;
      request.abort();
    }, config.timeout || 10000);
  });
};
