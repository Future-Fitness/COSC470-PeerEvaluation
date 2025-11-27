FROM node:20-slim

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace configs to the root
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Create the frontend directory and copy its package definition
# This mimics the monorepo structure for pnpm
RUN mkdir -p frontend
COPY frontend/package.json ./frontend/

# Install dependencies for only the frontend workspace
RUN pnpm install --filter frontend

# Copy the rest of the frontend source code
# This includes vite.config.js, tailwind.config.js, etc.
COPY frontend/ ./frontend/

# Set the final working directory
WORKDIR /app/frontend

EXPOSE 5009

# Run the development server
CMD ["pnpm", "run", "dev"]