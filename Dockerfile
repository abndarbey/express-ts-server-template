# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY .env ./

# Set environment variables
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3000

# Set non-root user for security
USER node

# Start the application
CMD ["node", "dist/cmd/index.js"]