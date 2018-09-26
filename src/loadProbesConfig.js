const fs = require('fs');
const parseProbeConfig = require('./parseProbeConfig');
module.exports = async (url) => {
  const config = JSON.parse(fs.readFileSync(url, 'utf8')).map(cfg => {
    return parseProbeConfig(cfg)
  })
  return Promise.resolve(config);
};
