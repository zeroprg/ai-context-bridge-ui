#!/bin/bash

# Build the docker image
docker --push -t --build-arg REACT_APP_ENV=production zeroprg/ai-context-bridge-ui .

