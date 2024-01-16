#!/bin/bash

# Check if there are exactly two arguments provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 ip_address password"
    exit 1
fi

# Assign arguments to variables
ip_address=$1
password=$2

# Production build directory
prod_build_dir="./prod_build"

# Create the production build directory if it doesn't exist
mkdir -p $prod_build_dir

# Install dependencies
npm install

# Build the React app and place it in the production build directory
NODE_ENV="production" npm run build --output-path $prod_build_dir

node replaceJsReferences.js $prod_build_dir

# Directory where the React app build is located
build_dir="$prod_build_dir/*"

# Destination directory on the server
dest_dir="/var/www/html"

# The user on the remote server
remote_user="zeroprg"

# Copy the build folder to the server's Nginx directory
# The script assumes sshpass is installed for non-interactive password usage
sshpass -p "$password" scp -r $build_dir $remote_user@$ip_address:$dest_dir

# Check if the scp command was successful
if [ $? -eq 0 ]; then
    echo "React app successfully copied to $ip_address"
else
    echo "Failed to copy the React app to $ip_address"
    exit 1
fi

# Restart Nginx on the remote server to apply changes
echo "$password" | sshpass -p "$password" ssh $remote_user@$ip_address "sudo -S systemctl restart nginx"

# Check if the ssh command was successful
if [ $? -eq 0 ]; then
    echo "Nginx restarted successfully on $ip_address"
else
    echo "Failed to restart Nginx on $ip_address"
    exit 1
fi
