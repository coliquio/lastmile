const promClient = require('prom-client');

const labelNames = [
  'protocol',
  'socket_tls_protocol',
  'socket_src_family',
  'socket_src_address',
  'socket_dst_family',
  'socket_dst_address',
  'req_url',
  'req_host',
  'req_port',
  'req_path',
  'req_method',
  'res_status',
  'err_code',
  'probe_type',
  'instance',
  'instance_address',
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
    if (config.instance_address) labels.instance_address = config.instance_address;
    labelNames.forEach((labelName) => {
      if (metric[labelName]) labels[labelName] = metric[labelName];
    });
    gauge.set(labels, metric.duration); 
  });

  return new Promise((resolve, reject) => {
    gateway.delete({
      jobName: 'lastmile',
      groupings: {
        environment: config.environment,
        instance: config.instance
      }
    }, function() {
      gateway.pushAdd({
        jobName: 'lastmile',
        groupings: {
          environment: config.environment,
          instance: config.instance
        }
      }, (err, res, body) => {
        if (err) {
          reject(err);
        } else if (res.statusCode >= 400) {
          reject(new Error(`Could not publish metrics ${res.statusCode} ${res.statusMessage}`));
        } else {
          resolve(res, body);
        }
      });
    });
  });
};