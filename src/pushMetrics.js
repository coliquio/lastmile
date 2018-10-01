const promClient = require('prom-client');

const instanceLabelNames = [
  'instance',
  'instance_address'
];

const probeLabelNames = [
  'protocol',
  'req_url',
  'req_host',
  'req_port',
  'req_path',
  'req_method',
  'res_addresses',
  'probe_type',
  'probe_id',
  'probe_failed_expectations',
  'instance',
  'instance_address',
  'socket_tls_protocol',
  'socket_src_family',
  'socket_src_address',
  'socket_dst_family',
  'socket_dst_address',
  'res_status',
  'err_code',
];
const probeDuration = new promClient.Gauge({
  name: 'lastmile_probe_duration_milliseconds',
  help: 'duration of the request from lastmile',
  labelNames: probeLabelNames.concat(['probe_status'])
});
const probeStatus = new promClient.Gauge({
  name: 'lastmile_probe_status',
  help: 'probe status (0=ok, 1=error)',
  labelNames: probeLabelNames
});
const lastSeen = new promClient.Counter({
  name: 'lastmile_last_seen',
  help: 'timestamp',
  labelNames: instanceLabelNames
});

module.exports = (config, metrics) => {
  return new Promise((resolve, reject) => {
    const instanceLabels = {
      instance: config.instance
    };
    if (config.instance_address) instanceLabels.instance_address = config.instance_address;
    lastSeen.inc(instanceLabels, config.timestamp)
    metrics.forEach(metric => {
      const labels = Object.assign({}, instanceLabels)
      probeLabelNames.forEach((labelName) => {
        if (typeof metric[labelName] !== 'undefined') labels[labelName] = String(metric[labelName]);
      });
      probeDuration.set(Object.assign({
        probe_status: metric.probe_status
      }, labels), metric.duration);
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