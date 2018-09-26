# Lastmile

Monitors edge location connectivity and reports back to central prometheus.

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

## License

See [LICENSE](LICENSE).

## Disclaimer

This is a project for the community, from developers for developers. This is NOT an official coliquio product. I.e. Maintenance and support are provided by the individual developers but not officially by coliquio.
