docker run -d \
  -v /etc/letsencrypt/live/tothemoon.chat/fullchain.pem:/etc/nginx/ssl/fullchain.pem ^
  -v /etc/letsencrypt/live/tothemoon.chat/privkey.pem:/etc/nginx/ssl/privkey.pem ^
  -p 80:80 -p 443:443 ^
  --restart=always ^
  --name ai-context-bridge-ui ^
  zeroprg/ai-context-bridge-ui