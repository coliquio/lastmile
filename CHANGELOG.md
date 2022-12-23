# 1.2.2

- [ADD] Attach `lastmile_version` as label to prometheus metric

# 1.2.1

- [ADD] Attach `record_type` as label (`A`, `CNAME`, `ANY`, ...) to prometheus metric

# 1.2.0

- [CHANGE] Require to use `record_type` setting (`A`, `CNAME`, `ANY`, ...) for DNS resolution. See https://nodejs.org/docs/latest-v16.x/api/dns.html#dnsresolvehostname-rrtype-callback

# 1.1.2

- [MINOR] Fix adding missing `dns_resolvers` to prometheus. Show in prometheus as label `dns_resolvers="1.1.1.1,4.4.4.4"`.

# 1.1.1

- [CRITICAL] Probe runner (broken since 1.1.0)
- [MINOR] Push invalid probe metrics
- [MINOR] Error logging output
- [CHANGE] Metrics logging now shows message `Collected #n metrics`

# 1.1.0 (broken version)

- Use not-existing port 59999 instead of 60000 to test `ECONNREFUSED`
- [CHANGE] Upgrade from node.js v13 to v16
- [CHANGE] macOS dns error codes is rewritten to match linux error codes (`ESERVFAIL` => `ENOTFOUND`, `ENODATA` => `ECONNREFUSED`)
- [ADD] Support new `dns_resolvers: ["1.1.1.1", "4.4.4.4"]` probe config option to support overwriting host dns servers (note: http supports currently only IPv4 dns resolution).
- [ADD] Support custom `probe_name: "foo"` probe config option. This will show in prometheus as label `probe_name="foo"` 

# 1.0.0

- Initial release
