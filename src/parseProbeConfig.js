const DEFAULT_PORTS = {
  http: '80',
  https: '443'
};
const DEFAULT_EXPECTS = {
  http: {
    statusCode: '2[0-9][0-9]'
  },
  https: {
    statusCode: '2[0-9][0-9]'
  }
};
module.exports = (cfg) => {
  if (typeof cfg.url === 'string') {
    const url = new URL(cfg.url);
    const type = url.protocol.split(':')[0];
    const result = {
      type,
      url: cfg.url,
      host: url.hostname,
      port: url.port || DEFAULT_PORTS[type],
      expect: cfg.expect || DEFAULT_EXPECTS[type]
    };
    if (cfg.tls) {
      result.tls = cfg.tls;
    }
    if (typeof url.path === 'string' && url.path.length > 0) {
      result.path = url.path;
    }
    return result;
  } else if (cfg.type === 'dns') {
    return Object.assign({
      expect: {}
    }, cfg);
  } else {
    return null;
  }
};
