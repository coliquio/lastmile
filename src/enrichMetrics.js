const enrichMetric = (metric, probeConfig) => {
  const enriched = Object.assign({}, metric);
  enriched.probe_type = probeConfig.type;
  if (probeConfig.url) enriched.probe_id = probeConfig.url;
  if (probeConfig.url) enriched.req_url = probeConfig.url;
  if (probeConfig.host) enriched.req_host = probeConfig.host;
  if (probeConfig.port) enriched.req_port = probeConfig.port;
  if (probeConfig.path) enriched.req_path = probeConfig.path;
  if (probeConfig.probe_env) enriched.probe_env = probeConfig.probe_env;
  if (probeConfig.dns_resolvers) enriched.dns_resolvers = probeConfig.dns_resolvers;
  return enriched;
};

module.exports = (metrics, probesConfig) => {
  return metrics.map((metric, idx) => enrichMetric(metric, probesConfig[idx]));
};
