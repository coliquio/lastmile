const DEFAULT_PORTS = {
  http: '80',
  https: '443'
};
module.exports = (cfg) => {
  if (typeof cfg.url === 'string') {
    const url = new URL(cfg.url);
    const type = url.protocol.split(':')[0];
    const result = {
      type,
      url: cfg.url,
      host: url.hostname,
      port: url.port || DEFAULT_PORTS[type]
    };
    if (typeof url.path === 'string' && url.path.length > 0) {
      result.path = url.path;
    }
    return result;
  } else {
    return null;
  }
};
