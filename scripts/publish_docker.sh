#!/bin/bash
VERSION=1.2.1
docker build --build-arg GIT_REF=$(git rev-parse --short HEAD) -t coliquiode/lastmile:$VERSION .
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker tag coliquiode/lastmile:$VERSION coliquiode/lastmile:latest
docker push coliquiode/lastmile # all tags