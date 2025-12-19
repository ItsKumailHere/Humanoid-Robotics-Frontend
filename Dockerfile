# Use an official Node runtime as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Docusaurus application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "serve", "--", "-p", "3000"]