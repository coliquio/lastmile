const measureDurationInMs = require('./measureDurationInMs');
const http = require('http');
module.exports = async (config) => {
  const getDurationInMs = measureDurationInMs();
  const options = {
    host: config.host,
    port: config.port,
    path: config.path || '/',
    method: config.method || 'GET'
  };
  if (config.agent) {
    options.agent = config.agent;
  }
  return new Promise((resolvePromise, rejectPromise) => {
    let result = {}
    let timedOut = false;
    const resolve = (value) => {
      clearTimeout(timeout);
      resolvePromise(value);
    };
    const reject = (value) => {
      clearTimeout(timeout);
      rejectPromise(value);
    }
    const request = http.request(options, (res) => {
      result.socket_family = res.socket.remoteFamily
      result.socket_dst_ip = res.socket.remoteAddress
      res.on('data', (chunk) => {});
      res.on('end', () => {
        resolve(Object.assign({
          res_status: res.statusCode,
          duration: getDurationInMs()
        }, result))
      })
    })
    request.on('error', (e) => {
      resolve(Object.assign({
        err_code: timedOut ? 'TIMEOUT' : e.code,
        duration: getDurationInMs()
      }, result))
    });
    request.end();
    const timeout = setTimeout(() => {
      timedOut = true
      request.abort()
    }, config.timeout || 10000)
  })
};