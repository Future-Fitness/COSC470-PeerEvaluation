# Local Development Setup

This guide explains how to run the backend and frontend locally while using Docker for the database.

## Quick Start

1. **Run the setup script:**
   ```bash
   ./setup-local-dev.sh
   ```

2. **Start the backend (Terminal 1):**
   ```bash
   cd backend
   pnpm dev
   ```

3. **Start the frontend (Terminal 2):**
   ```bash
   cd frontend  
   pnpm dev
   ```

## Manual Setup

If you prefer to set up manually:

### 1. Start Database Only
```bash
./start-db-only.sh
```

### 2. Setup Backend
```bash
cd backend
cp .env.local .env
pnpm install
pnpm dev
```

### 3. Setup Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

## Services

- **Database**: `localhost:3306` (MariaDB in Docker)
- **Backend**: `localhost:5008` (Local Node.js)
- **Frontend**: `localhost:5173` (Local Vite dev server)

## Environment Files

- `backend/.env` - Current environment (copied from .env.local for local dev)
- `backend/.env.local` - Local development settings (connects to localhost DB)
- `backend/example.env` - Template with Docker settings

## Key Differences for Local Development

| Component | Docker Setup | Local Setup |
|-----------|-------------|-------------|
| Database | `mariadb:3306` (internal) | `localhost:3306` (exposed) |
| Backend | Docker container | Local `pnpm dev` with hot reload |
| Frontend | Docker container | Local Vite dev server with HMR |

## Useful Commands

```bash
# Stop Docker database
docker-compose down

# View database logs  
docker logs cosc470-peerevaluation-mariadb-1

# Backend tests
cd backend && pnpm test

# Backend linting
cd backend && pnpm lint

# Frontend build
cd frontend && pnpm build
```

## Troubleshooting

**Database connection issues:**
- Ensure MariaDB container is running: `docker ps`
- Check if port 3306 is available: `lsof -i :3306`

**Backend not starting:**
- Verify `.env` file exists in backend folder
- Check if port 5008 is available: `lsof -i :5008`

**Frontend not connecting to backend:**
- Ensure backend is running on `localhost:5008`
- Check browser console for CORS issues

## Benefits of Local Development

✅ **Fast Hot Reload**: Backend and frontend restart automatically on changes  
✅ **Better Debugging**: Direct access to Node.js debugger and dev tools  
✅ **Faster Iteration**: No Docker build time between changes  
✅ **IDE Integration**: Full IntelliSense and debugging support  
✅ **Persistent Database**: Database stays running between sessions