const measureDurationInMs = require('./measureDurationInMs');
const probeStatus = require('./probeStatus');
const dns = require('dns');
module.exports = (config) => {
  return new Promise((resolve) => {
    const getDurationInMs = measureDurationInMs();
    dns.resolve(config.host, config.rrtype || 'A', (err, addresses) => {
      const result = {
        duration: getDurationInMs()
      };
      if (err) {
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
        result.res_addresses = addresses.join(',');
        if (config.expect.address && addresses.indexOf(config.expect.address) < 0) {
          result.probe_status = probeStatus.failedExpectation;
          result.probe_failed_expectations = 'ADDRESS';
        } else {
          result.probe_status = probeStatus.ok;
        }
      }
      resolve(result);
    });
  });
};
