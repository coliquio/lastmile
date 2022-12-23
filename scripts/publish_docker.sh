#!/bin/bash
MAJOR=1.2
MINOR=1
STABLE_VERSION="${MAJOR}-stable"
FULL_VERSION="${MAJOR}.${MINOR}"

docker build --build-arg GIT_REF=$(git rev-parse --short HEAD) -t coliquiode/lastmile:$FULL_VERSION .
docker tag coliquiode/lastmile:$FULL_VERSION coliquiode/lastmile:$STABLE_VERSION
docker tag coliquiode/lastmile:$FULL_VERSION coliquiode/lastmile:latest

echo "Building latest $STABLE_VERSION $FULL_VERSION"

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker push coliquiode/lastmile --all-tags