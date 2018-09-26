const { performance } = require('perf_hooks');
const measureDurationInMs = () => {
  const startTime = performance.now();
  return () => {
    return Math.round(performance.now() - startTime);
  };
};
module.exports = measureDurationInMs;