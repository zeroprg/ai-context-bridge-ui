docker run -d \
  -p 81:80 \
  --restart=always \
  --name ai-context-bridge-ui \
  zeroprg/ai-context-bridge-ui:latest