#!/bin/bash

# ensure bash
if ! [ -n "$BASH_VERSION" ];then
    echo "this is not bash, calling self with bash....";
    SCRIPT=$(readlink -f "$0")
    /bin/bash $SCRIPT
    exit;
fi

IMAGE="coliquiode/lastmile"

# get current local running digest
LOCAL_DIGEST=`docker inspect "$IMAGE" | grep Id | sed "s/\"//g" | sed "s/,//g" |  tr -s ' ' | cut -d ' ' -f3`

# get latest from remote
docker pull $IMAGE

# get digests
LATEST_DIGEST=`docker inspect "$IMAGE" | grep Id | sed "s/\"//g" | sed "s/,//g" |  tr -s ' ' | cut -d ' ' -f3`

echo "LATEST_DIGEST=$LATEST_DIGEST LOCAL_DIGEST=$LOCAL_DIGEST"

if [ "$LATEST_DIGEST" == "$LOCAL_DIGEST" ]; then
    echo "[OK] Already running latest docker image. Don't restart." | logger -t lastmile-reload
else
    echo "[UPDATE] Got newer docker image. Restarting container!" | logger -t lastmile-reload
    docker stop lastmile
    docker rm -f lastmile
fi

RUNNING=`docker ps -q -f name=lastmile`
if [ -z "$RUNNING" ]; then
    echo "[OK] Starting" | logger -t lastmile-reload
    docker run -d \
        --name lastmile \
        $IMAGE
fi
