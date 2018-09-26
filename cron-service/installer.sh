#!/bin/bash

curl -o /usr/local/bin/lastmile-reload https://raw.githubusercontent.com/coliquio/lastmile/master/cron-service/lastmile-reload.sh
chmod +x /usr/local/bin/lastmile-reload
crontab -u root - <<- EOM
*/5 * * * * bash /usr/local/bin/lastmile-reload
EOM
cat << EOF > ~/.lastmile.env
PUSHGATEWAY_URL=$PUSHGATEWAY_URL
PUSHGATEWAY_AUTH=$PUSHGATEWAY_AUTH
PROBES_CONFIG_URL=$PROBES_CONFIG_URL
INSTANCE=$INSTANCE
ENVIRONMENT=$ENVIRONMENT
EOF
