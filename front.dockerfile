FROM node:20-slim

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/package-lock.json* ./

# Clear npm cache and install dependencies
RUN npm cache clean --force && \
    npm install

# Copy source files (excluding node_modules)
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/index.html ./
COPY frontend/vite.config.ts ./
COPY frontend/tsconfig*.json ./
COPY frontend/tailwind.config.js ./
COPY frontend/postcss.config.js ./

# Expose port
EXPOSE 5009

# Start development server
CMD ["npm", "run", "dev"]