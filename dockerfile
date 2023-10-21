# Use a specific Node.js version for consistent behavior
FROM node:18

# Set working directory in Docker
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
# This way, npm install only runs if these files change
COPY ./app/package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of the application code
COPY ./app .

# Specify port
EXPOSE 3000

# Start the app
CMD [ "npm", "start" ]
