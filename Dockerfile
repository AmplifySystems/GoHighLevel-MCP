# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install full dependency graph for the TypeScript build, then prune dev deps.
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Keep the runtime image lean after dist/ has been produced.
RUN npm prune --omit=dev

# Expose the port
EXPOSE 8000

# Set environment to production
ENV NODE_ENV=production

# Start the HTTP server
CMD ["npm", "start"]
