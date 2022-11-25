# 1.1.0

- Use not-existing port 59999 instead of 60000 to test `ECONNREFUSED`
- [CHANGE] Upgrade from node.js v13 to v16
- [CHANGE] macOS dns error code `ESERVFAIL` is rewritten to match linux error code `ENOTFOUND`
- [ADD] Support new `dns_resolvers: ["1.1.1.1", "4.4.4.4"]` probe config option to support overwriting host dns servers (note: http supports currently only IPv4 dns resolution). This will show in prometheus as label `dns_resolvers="1.1.1.1,4.4.4.4"`.
- [ADD] Support custom `probe_name: "foo"` probe config option. This will show in prometheus as label `probe_name="foo"` 

# 1.0.0

- Initial release
