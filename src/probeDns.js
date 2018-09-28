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
        result.probe_status = probeStatus.error;
        result.err_code = err.code;
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
