#!/bin/bash
docker  build --push --build-arg REACT_APP_ENV=production -t zeroprg/ai-context-bridge-ui .