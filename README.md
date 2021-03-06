# Lastmile

![https://travis-ci.com/coliquio/lastmile.svg?branch=master](https://travis-ci.com/coliquio/lastmile.svg?branch=master)

Monitors edge location connectivity and reports back to central prometheus.

![docs/concept.png](docs/concept.png)

## Install as Cron service

This installs to root crontab.

    curl https://raw.githubusercontent.com/coliquio/lastmile/master/cron-service/installer.sh | \
      PUSHGATEWAY_URL=<path-to-prometheus> \
      PUSHGATEWAY_AUTH=<user>:<pass> \
      PROBES_CONFIG_URL=https://raw.githubusercontent.com/coliquio/lastmile/master/example/probes.json \
      ENVIRONMENT=local \
      INSTANCE=lastmile \
      INSTANCE_ADDRESS=`ip -o -4 address show  | awk 'NR==2 { gsub(/\/.*/, "", $4); printf $4 }'` \
      bash

## Run Test Environment

    docker-compose up

## Run local `example/probes.json` without prometheus

    npm run example

## Probe Configuration

### HTTP

```json
{ "url": "http://example.com" }
```

### HTTPS

```json
{ "url": "https://example.com" }
```

### DNS

```json
{ "type": "dns", "host": "www.example.com" }
```

## CI Environment

![https://travis-ci.com/coliquio/lastmile.svg?branch=master](https://travis-ci.com/coliquio/lastmile.svg?branch=master)

See [https://travis-ci.com/coliquio/lastmile](https://travis-ci.com/coliquio/lastmile)

## License

See [LICENSE](LICENSE).

## Disclaimer

This is a project for the community, from developers for developers. This is NOT an official coliquio product. I.e. Maintenance and support are provided by the individual developers but not officially by coliquio.
