# 1.1.0

- Use not-existing port 59999 instead of 60000 to test `ECONNREFUSED`
- [CHANGE] Upgrade from node.js v13 to v16
- [CHANGE] DNS probes return err_code = `ESERVFAIL` instead of `ENOTFOUND`
- [ADD] Support new `DNS_RESOLVERS=1.1.1.1,4.4.4.4` environment variable to support overwriting host dns servers (note: http supports currently only IPv4 dns resolution)

# 1.0.0

- Initial release
