# COSC470 Peer Evaluation Platform

A collaborative peer review platform for educational settings, allowing teachers to create classes, assignments, and rubrics while students can participate in peer evaluations.

## Table of Contents

- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Architecture Overview](#architecture-overview)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Frontend Structure](#frontend-structure)
- [Testing](#testing)

## Requirements

* [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
* [Node.js](https://nodejs.org/) v20+
* [pnpm](https://pnpm.io/) package manager

## Getting Started

### Quick Start (Recommended)

**One command to start everything:**

```bash
# Clone this repository
git clone <repository-url>
cd COSC470-PeerEvaluation

# Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit backend/.env with your credentials (see below)

# Start everything with Docker
./start.sh
```

This will:
1. Stop any existing containers
2. Build fresh images
3. Start database (auto-seeds with test data)
4. Start backend and frontend
5. Show you the URLs to access

**Access the application:**
- Frontend: http://localhost:5009
- Backend API: http://localhost:5008

### Configuration

**Important:** Set up your environment variables before running.

```bash
# Copy the example environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your actual credentials:
# - MySQL database credentials (uses Docker MariaDB by default)
# - Cloudinary API credentials (for file storage)
# - Backend server port (default: 5008)

# Frontend .env contains test account credentials for development
```

**Required credentials:**
- **Cloudinary**: Sign up at [cloudinary.com](https://cloudinary.com) for file storage (free tier available)
- **Database**: Uses Docker MariaDB (no external setup needed)

See `backend/.env.example` and `frontend/.env.example` for all required variables.

### Manual Docker Commands

If you prefer manual control:

```bash
# Start all services
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build backend
```

### Database Management

The database automatically seeds with test data on first run. To reset:

```bash
# Stop and remove all data
docker-compose down -v

# Start fresh (will re-seed)
docker-compose up --build
```

**Test Accounts:**
- Student: Username `test` / Password `1234` (or use email `test@test.com` for OTP login)
- Teacher: Username `test2` / Password `1234` (or use email `test2@test.com` for OTP login)

## Documentation

Comprehensive documentation is available in the following files:

- **[PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)** - Complete project structure, architecture patterns, and file organization
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines, coding standards, and development workflow
- **[LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md)** - Detailed local development setup and troubleshooting
- **[DEVELOPMENT_TASKS.md](docs/DEVELOPMENT_TASKS.md)** - Development roadmap and planned features
- **[backend/ARCHITECTURE.md](backend/ARCHITECTURE.md)** - Backend architecture and API details
- **[backend/STUDENT_MANAGEMENT.md](backend/STUDENT_MANAGEMENT.md)** - Student management documentation

### Package Manager

This project uses **pnpm** as the package manager for the monorepo workspace:

```bash
# Install pnpm globally
npm install -g pnpm

# Install dependencies
pnpm install

# Run commands for specific workspace
pnpm --filter backend <command>
pnpm --filter frontend <command>
```

**Note:** We've standardized on pnpm to ensure consistent dependency resolution across the monorepo. `package-lock.json` files have been removed in favor of `pnpm-lock.yaml`.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│    Backend      │────▶│    MySQL DB     │
│   (React/Vite)  │     │   (Fastify)     │     │   (Sequelize)   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
     Port 5009              Port 5008
```

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite build tool
- Tailwind CSS with dark mode
- React Router v7
- Lucide React icons

**Backend:**
- Fastify framework
- Sequelize ORM
- MySQL database
- SHA-512 password hashing

## Authentication Flow

### Login Methods

The platform supports two authentication methods:

1. **Password Login** (Traditional)
   - Uses username + password with Basic Authentication
   - Token stored in localStorage
   - 20-minute inactivity timeout, 3-day absolute timeout

2. **OTP Login** (Passwordless)
   - Email-based one-time password
   - 6-digit code sent via email
   - Expires in 10 minutes
   - Single-use only

### Password Login Process

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Client  │     │ Server  │     │   DB    │     │ Session │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ Basic Auth    │               │               │
     │ GET /login    │               │               │
     │──────────────▶│               │               │
     │               │ Query User    │               │
     │               │──────────────▶│               │
     │               │               │               │
     │               │ User Data     │               │
     │               │◀──────────────│               │
     │               │               │               │
     │               │ Store Session │               │
     │               │──────────────────────────────▶│
     │               │               │               │
     │ { token,      │               │               │
     │   isTeacher } │               │               │
     │◀──────────────│               │               │
     │               │               │               │
```

### Token Storage & Usage

1. **Login Request:**
   ```javascript
   // Frontend sends Basic Auth
   Authorization: Basic <base64(username:password)>
   ```

2. **Token Generation:**
   - Server validates credentials
   - Generates unique SHA-512_256 token using:
     - Username + Timestamp + High-res time
     - Random value + Counter + CPU usage

3. **Session Storage (Server):**
   ```javascript
   session[token] = {
     inactivityExpire: Date.now() + 20 * 60 * 1000,  // 20 min
     fullExpire: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days
     username: string,
     id: number  // User ID
   }
   ```

4. **Client Storage:**
   ```javascript
   // localStorage
   user: {
     token: "sha512_256_hash",
     isTeacher: boolean
   }
   ```

5. **Authenticated Requests:**
   ```javascript
   Authorization: Bearer <token>
   ```

### Session Management

- **Inactivity Timeout:** 20 minutes (refreshed on each valid request)
- **Absolute Timeout:** 3 days maximum
- **Expiration Handling:** 401 response redirects to login

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/login` | Login with Basic Auth | No |
| POST | `/request_otp` | Request OTP code via email | No |
| POST | `/verify_otp` | Verify OTP and login | No |
| GET | `/ping` | Health check | No |
| GET | `/user_id` | Get current user ID | Yes |
| GET | `/profile` | Get current user profile | Yes |
| GET | `/profile/:id` | Get user profile by ID | Yes |

### Classes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/classes` | List all classes | Yes |
| POST | `/create_class` | Create new class | Yes |
| GET | `/get_className/:id` | Get class name | Yes |
| POST | `/classes/members` | List class members | Yes |

### Assignments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/assignments/:courseId` | List assignments | Yes |
| POST | `/create_assignment` | Create assignment | Yes |

### Groups
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create_group` | Create group | Yes |
| POST | `/delete_group` | Delete group | Yes |
| POST | `/save_groups` | Assign user to group | Yes |
| GET | `/list_all_groups/:assignmentId` | List groups | Yes |
| GET | `/list_group_members/:assignmentId/:groupId` | List members | Yes |
| GET | `/list_ua_groups/:assignmentId` | List unassigned | Yes |

### Rubrics & Reviews
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create_rubric` | Create rubric | Yes |
| GET | `/rubric` | Get rubric | Yes |
| POST | `/create_criteria` | Create criteria | Yes |
| GET | `/criteria` | List criteria | Yes |
| POST | `/create_review` | Create review | Yes |
| GET | `/review` | Get review | Yes |

### Data Import
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/student_import` | Bulk import students CSV (legacy) | Yes |
| POST | `/upload_students_csv` | Upload CSV with multipart form data | Yes |

**CSV Format for Student Upload:**
```csv
email,name,id
john@example.com,John Doe,12345
jane@example.com,Jane Smith,
```
- **email** (required): Student email address
- **name** (optional): Student name (uses email prefix if not provided)
- **id** (optional): Student ID (generates random 5-digit ID if not provided)
- **Passwords**: Auto-generated 10-character secure passwords
- Creates accounts for new students
- Sends welcome emails with auto-generated credentials
- Enrolls students in specified course

## Database Schema

### Entity Relationship

```
User ──────┬────── User_Course ────── Course
           │                            │
           │                        Assignment
           │                       /    │    \
           │                   Rubric Group  Submission
           │                     │      │
           │              Criteria  Group_Member
           │             Description
           │                 │
           └──── Review ──── Criterion
```

### Models

**User**
- id, name, email, is_teacher, hash_pass

**Course**
- id, teacherID, name

**Assignment**
- id, courseID, name, rubric

**User_Course** (Enrollment)
- courseID, userID

**CourseGroup**
- id, name, assignmentID

**Group_Member**
- groupID, userID, assignmentID
- groupID = -1 indicates unassigned

**Rubric**
- id, assignmentID, canComment

**Criteria_Description**
- id, rubricID, question, scoreMax, hasScore

**Review**
- id, assignmentID, reviewerID, revieweeID

**Criterion**
- id, reviewID, criterionRowID, grade, comments

**OTP** (One-Time Password)
- id, email, otp_code, created_at, expires_at, is_used
- Stores email-based login codes
- Auto-expires after 10 minutes
- Single-use only (is_used flag)

## Frontend Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── Sidebar.tsx      # Navigation with dark mode toggle
│   ├── Button.tsx       # Primary button component
│   ├── Textbox.tsx      # Input component
│   ├── ClassCard.tsx    # Course card display
│   └── ...
├── pages/               # Route pages
│   ├── LoginPage.tsx    # Authentication
│   ├── Home.tsx         # Dashboard
│   ├── Profile.tsx      # User profile
│   ├── ClassHome.tsx    # Class details
│   └── ...
├── context/             # React contexts
│   └── ThemeContext.tsx # Dark mode & sidebar state
├── util/                # Utilities
│   ├── api.ts           # API client functions
│   └── login.ts         # Auth helpers
└── App.tsx              # Main app with routing
```

### Theme System

Dark mode is implemented using:
- Tailwind CSS `dark:` classes
- `ThemeContext` for state management
- localStorage persistence
- Toggle in sidebar

### Protected Routes

All routes except `/` and `/signup` require authentication via `ProtectedRoute` component.

## Testing

### Backend Tests

```bash
cd backend

# Unit tests
pnpm run test:unit

# Integration tests
pnpm run test:integration

# All tests
pnpm run test

# With coverage
pnpm run test:unit:coverage
```

### CI/CD

GitHub Actions workflows:
- **PR Checks:** Lint, type check, build, test
- **Build:** On every push to any branch
- **PR Report:** Generates statistics report with:
  - Lines changed
  - Files by type
  - Commit list

## Environment Variables

### Backend
```env
MYSQL_USER=root
MYSQL_PASS=password
MYSQL_DB=peer_eval
MYSQL_HOST=localhost
MYSQL_PORT=3306
```

### Development
```env
DANGEROUS_DISABLE_ALL_AUTH=true  # Testing only
```

## Important Notes

- Database auto-seeds on first Docker run via `schema.sql`
- Frontend and backend hot-reload automatically in Docker
- Use `./start.sh` for easiest setup
- Use `docker-compose down -v` to reset database

## Quick Commands

```bash
# Start everything
./start.sh

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Reset database
docker-compose down -v && docker-compose up --build
```

## Test Accounts

### 🔐 Two Login Methods Available:

#### **Method 1: Password Login**
Use the **🔑 Password** tab with username + password:

| Username | Password | Email | Role |
|----------|----------|-------|------|
| test | 1234 | test@test.com | Student |
| test2 | 1234 | test2@test.com | Teacher ⭐ |
| alice | password | alice@example.com | Student |
| professor | password | prof@example.com | Teacher ⭐ |

#### **Method 2: OTP Login (Email Code)**
Use the **📧 Email Code** tab with any email above:

1. Click **📧 Email Code** tab
2. Enter email (e.g., `test@test.com`)
3. Click **Send Login Code**
4. Check your email for 6-digit code
5. Enter code and verify

**Note:** OTP codes expire in 10 minutes and can only be used once.

### 🎯 Quick Test:
```bash
# Open browser
open http://localhost:5009

# Try Password Login
Username: test
Password: 1234

# Or Try OTP Login
Email: test@test.com
(Check email for code)
```

## License

This project is for educational purposes as part of COSC 470/471.
