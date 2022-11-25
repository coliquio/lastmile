#!/bin/bash
VERSION=1.1.0
docker build --build-arg GIT_REF=$(git rev-parse --short HEAD) -t coliquiode/lastmile:$VERSION .
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker push coliquiode/lastmile:$VERSION
