#!/bin/bash

# Build args from .env file
args=''
while read -r line || [[ -n "$line" ]]; 
do
  args="$args --build-arg $line"
done < .env

# Build the Docker image with the arguments
docker build $args -t ai-context-bridge-ui .
