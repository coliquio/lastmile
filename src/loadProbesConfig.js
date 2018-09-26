const fs = require('fs');
const axios = require('axios');
const parseProbeConfig = require('./parseProbeConfig');

const loadConfigFromFile = (path) => {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
};

const loadConfigFromHttp = (url) => {
  return axios.get(url)
    .then(res => {
      return res.data;
    });
};

const loadConfig = async (url) => {
  let configJson;
  if (url.match('file://')) {
    configJson = loadConfigFromFile(url.replace('file://',''));
  } else {
    configJson = await loadConfigFromHttp(url);
  }
  return configJson;
};

const parseConfig = (configJson) => {
  return configJson.map(cfg => {
    return parseProbeConfig(cfg);
  });
};

module.exports = async (url) => {
  const config = await loadConfig(url);
  return Promise.resolve(parseConfig(config));
};
