const config = require('./src/config')();
const run = require('./src/run');
const evaluateMetrics = require('./src/evaluateMetrics');
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

process.on('exit', function() {
  console.log('Stopping worker');
});

process.on('SIGINT', function() {
  console.log('SIGINT, Stopping worker');
  process.exit(1);
});

config.__version = packageJson.version

async function main() {
  console.log(`✅ Running lastmile v${packageJson.version}`)
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
