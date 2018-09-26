const promClient = require('prom-client');

const labelNames = [
  'protocol',
  'socket_tls_protocol',
  'socket_family',
  'socket_src_ip',
  'socket_dst_ip',
  'socket_dst_port',
  'req_path',
  'req_method',
  'res_status',
  'err_code',
  'type',
  'port',
  'host',
  'instance'
];
const gauge = new promClient.Gauge({
  name: 'lastmile_http_request_time_milliseconds',
  help: 'duration of the request from lastmile',
  labelNames
});

module.exports = (config, metrics) => {
  const gatewayOptions = { timeout: 5000 };
  if (config.auth) {
    gatewayOptions.auth = config.auth;
  }
  const gateway = new promClient.Pushgateway(config.url, gatewayOptions);

  metrics.forEach(metric => {
    const labels = {
      instance: config.instance
    };
    labelNames.forEach((labelName) => {
      if (metric[labelName]) labels[labelName] = metric[labelName];
    });
    gauge.set(labels, metric.duration); 
  });

  return new Promise((resolve, reject) => {
    gateway.pushAdd({
      jobName: 'lastmile',
      groupings: {
        environment: config.environment
      }
    }, (err, resp, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(resp, body);
      }
    });

  });
};