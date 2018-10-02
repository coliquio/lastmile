const exitCodes = {
  OK: 0,
  PROBE_FAILED_EXPECTATION: 1,
  PROBE_ERR: 2,
  ERR: 3
};

module.exports = (metrics) => {
  let status = 'OK';
  if (metrics) {
    if (metrics.find(m => m.probe_status > 1)) {
      status = 'PROBE_ERR';
    } else if (metrics.find(m => m.probe_status > 0)) {
      status = 'PROBE_FAILED_EXPECTATION';
    }
  } else {
    status = 'ERR';
  }
  const exitCode = exitCodes[status];
  return {status, exitCode};
};
