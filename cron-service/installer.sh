#!/bin/bash

sudo curl https://raw.githubusercontent.com/coliquio/lastmile/master/cron-server/lastmile-reload.sh > /usr/local/bin/lastmile-reload
sudo chmod +x /usr/local/bin/lastmile-reload
sudo crontab -u root - <<- EOM
  */5 * * * * bash /usr/local/bin/lastmile
EOM
