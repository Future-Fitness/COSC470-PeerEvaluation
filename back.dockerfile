FROM node:20-slim

WORKDIR /app

# Copy configuration files
COPY backend/package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install

# Copy application files
COPY backend/ ./

# Expose port
EXPOSE 5008

# Start server
CMD ["pnpm", "start"]