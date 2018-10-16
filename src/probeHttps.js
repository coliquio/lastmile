const probeHttpx = require('./probeHttpx');
const https = require('https');
module.exports = probeHttpx(https);
