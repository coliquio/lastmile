const fs = require('fs/promises');
const axios = require('axios');
const parseProbeConfig = require('./parseProbeConfig');

const loadConfigFromFile = async (path) => {
  return JSON.parse(await fs.readFile(path, 'utf8'));
};

const loadConfigFromHttp = (url) => {
  return axios.get(url).then(res => {
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
  return configJson.map(cfg => parseProbeConfig(cfg));
};

const enrichConfig = (probesConfigs, defaultConfig) => {
  return probesConfigs.map(cfg => {
    if (cfg.type === 'http' || cfg.type === 'https') {
      if (defaultConfig.userAgent) cfg.userAgent = defaultConfig.userAgent;
    }
    return cfg;
  });
};

module.exports = async (url, defaultConfig) => {
  const config = await loadConfig(url);
  const parsedConfig = parseConfig(config);
  const enrichedConfig = enrichConfig(parsedConfig, defaultConfig);
  return Promise.resolve(enrichedConfig);
};
