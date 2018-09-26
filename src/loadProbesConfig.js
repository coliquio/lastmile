const fs = require('fs');
module.exports = async (url) => {
  const config = JSON.parse(fs.readFileSync(url, 'utf8'));
  return Promise.resolve(config);
};
