const DEFAULT_PORTS = {
  http: '80',
  https: '443'
};
const DEFAULT_EXPECTS = {
  http: {
    status_code: '2[0-9][0-9]'
  },
  https: {
    status_code: '2[0-9][0-9]'
  }
};
module.exports = (cfg) => {
  let result = {};
  if (cfg.probe_env) {
    result.probe_env = cfg.probe_env;
  }
  if (cfg.dns_resolvers) {
    result.dns_resolvers = cfg.dns_resolvers;
  }
  if (typeof cfg.url === 'string') {
    const url = new URL(cfg.url);
    const type = url.protocol.split(':')[0];
    Object.assign(result, {
      type,
      url: cfg.url,
      host: url.hostname,
      port: url.port || DEFAULT_PORTS[type],
      expect: cfg.expect || DEFAULT_EXPECTS[type]
    });
    if (cfg.tls) {
      result.tls = cfg.tls;
    }
    if (cfg.auth) {
      result.auth = cfg.auth;
    }
    if (typeof url.pathname === 'string' && url.pathname.length > 0) {
      result.path = url.pathname;
    }
  } else if (cfg.type === 'dns') {
    Object.assign(result, {
      expect: {}
    }, cfg);
  } else {
    result = null;
  }
  return result;
};
