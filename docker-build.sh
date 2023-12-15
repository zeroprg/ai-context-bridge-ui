#!/bin/bash

# Build the docker image
docker build --build-arg REACT_APP_ENV=production -t ai-context-bridge-ui .

