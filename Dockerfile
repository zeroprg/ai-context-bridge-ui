# Stage 1: Build the React application
FROM node:18.16.0 as build

# Set working directory in the container
WORKDIR /app

# Define build argument for environment
ARG REACT_APP_ENV

# Set NODE_ENV environment variable
ENV NODE_ENV=$REACT_APP_ENV

# Copy package.json and package-lock.json (or yarn.lock) files
COPY ./package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application's code
COPY ./ ./

# Build the application
RUN npm run build

# Stage 2: Serve the application from Nginx
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY --from=build /app/build /usr/share/nginx/html


# Copy your custom Nginx configuration file SSL confihuration to nginx or use volume in run command
COPY ./ssl_nginx.conf /etc/nginx/conf.d/default.conf
# Copy SSL certificates
#Certificate is saved at: 
#COPY /etc/letsencrypt/live/tothemoon.chat/fullchain.pem /etc/nginx/ssl/fullchain.pem
#Key is saved at:         
#COPY /etc/letsencrypt/live/tothemoon.chat/privkey.pem /etc/nginx/ssl/privkey.pem


# Expose port 80 , 443 for SSL
EXPOSE 80 443

# Start Nginx and keep it running
CMD ["nginx", "-g", "daemon off;"]
