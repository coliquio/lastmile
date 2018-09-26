const measureDurationInMs = require('./measureDurationInMs');
const axios = require('axios');
module.exports = async (config) => {
  const getDurationInMs = measureDurationInMs();
  const options = {
    url: `https://${config.host}:${config.port}${config.path || '/'}`,
    timeout: config.timeout || 10000,
    validateStatus: false
  };
  if (config.httpsAgent) {
    options.httpsAgent = config.httpsAgent;
  }
  return axios.request(options)
    .then(res => {
      return {
        res_status: res.status,
        duration: getDurationInMs(),
        socket_family: res.request.socket.remoteFamily,
        socket_dst_ip: res.request.socket.remoteAddress,
        socket_tls_procotol: res.request.socket.getProtocol()
      };
    })
    .catch(error => {
      if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      // console.log(error.response.data);
      // console.log(error.response.status);
      // console.log(error.response.headers);
      } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      // console.log(error.request);
      } else {
      // Something happened in setting up the request that triggered an Error
      // console.log('Error', error.message);
      }
      return {
        err_code: error.code,
        duration: getDurationInMs()
      };
    });
};
