const config = require('./src/config')();
const run = require('./src/run');
const evaluateMetrics = require('./src/evaluateMetrics');

process.on('exit', function() {
  console.log('Stopping worker');
});

process.on('SIGINT', function() {
  console.log('SIGINT, Stopping worker');
  process.exit(1);
});

async function main() {
  const firstRun = run(config);
  if (config.probeOneShot) {
    const metrics = await firstRun;
    const {status, exitCode} = evaluateMetrics(metrics);
    console.log(`Probes finished with status = ${status} (${exitCode})`);
    process.exit(exitCode);
  } else {
    setInterval(() => {
      run(config);
    }, config.probeInterval);
  }
}
main();
