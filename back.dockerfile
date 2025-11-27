FROM node:20-slim

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace configs to the root
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Create the backend directory and copy its package definition
# This mimics the monorepo structure for pnpm
RUN mkdir -p backend
COPY backend/package.json ./backend/

# Install dependencies for only the backend workspace
# pnpm will correctly find the backend/package.json
RUN pnpm install --filter backend

# Copy the rest of the backend source code
COPY backend/ ./backend/

# Set the final working directory
WORKDIR /app/backend

EXPOSE 5008

# The CMD can now be simpler as we are in the correct directory
CMD ["pnpm", "start"]