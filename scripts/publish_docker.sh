#!/bin/bash
docker build --build-arg GIT_REF=$(git rev-parse --short HEAD) -t coliquiode/lastmile .
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker push coliquiode/lastmile
