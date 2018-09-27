const promClient = require('prom-client');

const labelNames = [
  'protocol',
  'req_url',
  'req_host',
  'req_port',
  'req_path',
  'req_method',
  'probe_type',
  'instance',
  'instance_address',
];
const detailedLabelNames = [
  'socket_tls_protocol',
  'socket_src_family',
  'socket_src_address',
  'socket_dst_family',
  'socket_dst_address',
  'res_status',
  'err_code',
  'probe_type',
  'probe_status'
];
const responseTime = new promClient.Gauge({
  name: 'lastmile_http_request_time_milliseconds',
  help: 'duration of the request from lastmile',
  labelNames: labelNames.concat(detailedLabelNames)
});
const probeStatus = new promClient.Gauge({
  name: 'lastmile_probe_status',
  help: 'probe status (0=ok, 1=error)',
  labelNames
});

module.exports = (config, metrics) => {
  return new Promise((resolve, reject) => {
    metrics.forEach(metric => {
      const labels = {
        instance: config.instance
      };
      if (config.instance_address) labels.instance_address = config.instance_address;
      labelNames.forEach((labelName) => {
        if (typeof metric[labelName] !== 'undefined') labels[labelName] = String(metric[labelName]);
      });
      const detailedLabels = Object.assign({}, labels);
      detailedLabelNames.forEach((labelName) => {
        if (typeof metric[labelName] !== 'undefined') detailedLabels[labelName] = String(metric[labelName]);
      });
      responseTime.set(detailedLabels, metric.duration); 
      probeStatus.set(labels, metric.probe_status); 
    });

    const gatewayOptions = { timeout: 5000 };
    if (config.auth) {
      gatewayOptions.auth = config.auth;
    }
    const gateway = new promClient.Pushgateway(config.url, gatewayOptions);
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
        promClient.register.resetMetrics(); // otherwise old metrics labels get sent also
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