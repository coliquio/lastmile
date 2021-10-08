const measureDurationInMs = require('./measureDurationInMs');
const probeStatus = require('./probeStatus');

const matchHttpExpectation = (probeConfig, response) => {
  const failedExpectations = [];
  if (`${response.statusCode}`.match(probeConfig.expect.status_code) === null) {
    failedExpectations.push('RES_STATUS');
  }
  return {
    ok: failedExpectations.length === 0,
    failedExpectations
  };
};

const matchHttpErrorExpectation = (config, error) => {
  if (config.expect && config.expect.err_code) {
    // did expect error, therefore either status ok or status failed expectation (== just wrong error)
    return config.expect.err_code == error.code ? probeStatus.ok : probeStatus.failedExpectation;
  } else {
    // did not expect error, therefore status error
    return probeStatus.error;
  }
};

module.exports = httpOrHttps => (config) => {
  const getDurationInMs = measureDurationInMs();
  const options = {
    host: config.host,
    port: config.port,
    path: config.path,
    method: config.method || 'GET',
    headers: {}
  };
  if (config.userAgent) options.headers['user-agent'] = config.userAgent;
  if (typeof config.tls === 'object' && typeof config.tls.ca === 'string') {
    options.agent = new httpOrHttps.Agent({
      ca: config.tls.ca
    });
  }
  if (typeof config.auth === 'object' && typeof config.auth.username === 'string' && typeof config.auth.password === 'string') {
    options.auth = `${config.auth.username}:${config.auth.password}`;
  }    
  return new Promise((resolvePromise) => {
    let result = {};
    let timedOut = false;
    const resolve = (value) => {
      clearTimeout(timeout);
      resolvePromise(value);
    };
    const request = httpOrHttps.request(options, (res) => {
      const expectationMatch = matchHttpExpectation(config, res);
      result.probe_status = expectationMatch.ok ? probeStatus.ok : probeStatus.failedExpectation;
      if (!expectationMatch.ok) result.probe_failed_expectations = expectationMatch.failedExpectations.join(',');
      result.res_status = res.statusCode;
      result.socket_dst_family = res.socket.remoteFamily;
      result.socket_dst_address = res.socket.remoteAddress;
      result.socket_src_family = res.socket.address().family;
      result.socket_src_address = res.socket.address().address;
      if (typeof res.socket.getProtocol === 'function') {
        result.socket_tls_procotol = res.socket.getProtocol();
      }
      res.on('data', () => {});
      res.on('end', () => {
        resolve(Object.assign({
          duration: getDurationInMs()
        }, result));
      });
    });
    request.on('error', (e) => {
      resolve(Object.assign({
        probe_status: matchHttpErrorExpectation(config, e),
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
