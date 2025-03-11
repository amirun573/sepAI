# Use the official Node.js image as a base
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set the environment variable to production
ENV NODE_ENV=production

# Build the Next.js application
RUN npm run build-next  # Assuming you have a "build-next" script for Next.js in your package.json

# Expose port 3000 for the API
EXPOSE 3000

# Start Next.js API server on port 3000
CMD ["npm", "run", "start-next"]
