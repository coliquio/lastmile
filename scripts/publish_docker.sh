#!/bin/bash
docker build -t coliquiode/lastmile .
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker push coliquiode/lastmile