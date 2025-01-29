# Step 1: Set up the base image with Node.js
FROM node:18-alpine AS base

# Set the working directory
WORKDIR /app

# Step 2: Install dependencies
# Copy the package.json and package-lock.json first to leverage caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Step 3: Copy the application files
COPY . .

# Step 4: Build the Next.js app
RUN npm run build

# Step 5: Expose the necessary port
EXPOSE 3000

# Step 6: Start the Next.js app
CMD ["npm", "run", "start"]
