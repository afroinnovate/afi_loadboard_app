# Use an official Node runtime as a parent image
FROM node:latest

# Set working directory in docker
WORKDIR /app

# Only copy the package.json file to work directory
COPY package*.json /app/

# Install all dependencies
RUN npm install

# Copy all files from local machine to work directory
COPY ./app /app/

# Build the app
RUN npm run build

# Specify port
EXPOSE 3000

# Start the app
CMD [ "npm", "start" ]
