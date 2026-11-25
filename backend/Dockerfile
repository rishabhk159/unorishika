# Production Dockerfile for UNO RISHIKA Real-Time Backend on Google Cloud Run
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy server code
COPY . .

# Set production environment
ENV NODE_ENV=production

# Cloud Run injects PORT (default 8080)
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
