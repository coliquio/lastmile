const measureDurationInMs = require('./measureDurationInMs');
const probeStatus = require('./probeStatus');
const { Resolver } = require('dns');
module.exports = (config, DNSResolver = Resolver) => {
  return new Promise((resolvePromise) => {
    let timedOut = false;
    const resolve = (value) => {
      clearTimeout(timeout);
      resolvePromise(value);
    };
    const getDurationInMs = measureDurationInMs();
    const resolver = new DNSResolver();
    resolver.resolveAny(config.host, (err, rawAddresses) => {
      const result = {
        duration: getDurationInMs()
      };
      if (timedOut) {
        result.err_code = 'TIMEOUT';
        result.probe_status = probeStatus.error
      } else if (err) {
        result.err_code = err.code;
        if (config.expect.err_code) {
          if (config.expect.err_code == err.code) {
            result.probe_status = probeStatus.ok;
          } else {
            result.probe_status = probeStatus.failedExpectation;
            result.probe_failed_expectations = 'ERR_CODE';
          }
        } else {
          result.probe_status = probeStatus.error;
        }
      } else {
        const addresses = rawAddresses.map(a => a.value || a.address);
        result.res_addresses = addresses.join(',');
        if (config.expect.address && addresses.indexOf(config.expect.address) < 0) {
          result.probe_status = probeStatus.failedExpectation;
          result.probe_failed_expectations = 'ADDRESS';
        } else if (config.expect.err_code) {
          result.probe_status = probeStatus.failedExpectation;
          result.probe_failed_expectations = 'ERR_CODE';
        } else {
          result.probe_status = probeStatus.ok;
        }
      }
      resolve(result);
    });
    const timeout = setTimeout(() => {
      timedOut = true;
      resolver.cancel();
    }, config.timeout || 5000);
  });
};
