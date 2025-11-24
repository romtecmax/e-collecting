# Use an official Node.js image as the base
FROM --platform=linux/amd64 node:20

# Set the working directory
WORKDIR /server

# Copy package.json and package-lock.json (if available)
COPY /server/package*.json ./


# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY ./server .

# Expose the port Vite uses (default is 5173)
EXPOSE 5173

# Start the Vite app in development mode
CMD ["npm", "run", "dev", "--", "--host"]
