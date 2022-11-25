const measureDurationInMs = require('./measureDurationInMs');
const probeStatus = require('./probeStatus');
const { Resolver } = require('dns');

const PROBE_RESULT_TIMEOUT = {
  err_code: 'TIMEOUT',
  probe_status: probeStatus.error
};

function buildProbeResultForError(expect, err) {
  const result = {};
  result.err_code = err.code;
  if (expect.err_code) {
    if (expect.err_code == err.code) {
      result.probe_status = probeStatus.ok;
    } else {
      result.probe_status = probeStatus.failedExpectation;
      result.probe_failed_expectations = 'ERR_CODE';
    }
  } else {
    result.probe_status = probeStatus.error;
  }
  return result;
}

function buildProbeResultForResolvedAddresses(expect, rawAddresses) {
  const result = {};
  const addresses = rawAddresses.map(a => a.value || a.address);
  result.res_addresses = addresses.join(',');
  if (expect.address && addresses.indexOf(expect.address) < 0) {
    result.probe_status = probeStatus.failedExpectation;
    result.probe_failed_expectations = 'ADDRESS';
  } else if (expect.err_code) {
    result.probe_status = probeStatus.failedExpectation;
    result.probe_failed_expectations = 'ERR_CODE';
  } else {
    result.probe_status = probeStatus.ok;
  }
  return result;
}

module.exports = (config, DNSResolver = Resolver) => {
  return new Promise((resolvePromise) => {
    let timedOut = false;
    const resolve = (value) => {
      clearTimeout(timeout);
      resolvePromise(value);
    };
    const getDurationInMs = measureDurationInMs();
    const resolver = new DNSResolver();
    if (config.dns_resolvers) { // optionally overwriting system dns server
      resolver.setServers(config.dns_resolvers);
    }
    resolver.resolveAny(config.host, (err, rawAddresses) => {
      // change macOS to linux err code for predicability / compatibility
      if (err && err.code === 'ESERVFAIL') {
        err.code = 'ENOTFOUND'
      }

      const duration = getDurationInMs();
      let result;
      if (timedOut) {
        result = PROBE_RESULT_TIMEOUT;
      } else if (err) {
        result = buildProbeResultForError(config.expect, err);
      } else {
        result = buildProbeResultForResolvedAddresses(config.expect, rawAddresses);
      }
      resolve({
        duration,
        ...result
      });
    });
    const timeout = setTimeout(() => {
      timedOut = true;
      resolver.cancel();
    }, config.timeout || 5000);
  });
};
