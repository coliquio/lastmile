module.exports = (probeConfig, response) => {
  const failedExpectations = [];
  if (`${response.statusCode}`.match(probeConfig.expect.statusCode) === null) {
    failedExpectations.push('RES_STATUS')
  }
  return {
    ok: failedExpectations.length === 0,
    failedExpectations
  };
}
