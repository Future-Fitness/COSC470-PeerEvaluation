# Project Structure

## Overview

COSC470 Peer Evaluation is a full-stack web application built as a monorepo using pnpm workspaces. The project consists of a React frontend and a Node.js/Fastify backend with MariaDB database.

## Directory Structure

```
COSC470-PeerEvaluation/
│
├── .github/workflows/        # CI/CD GitHub Actions workflows
│   ├── build.yml            # Build validation
│   ├── pr-checks.yml        # Pull request checks
│   └── tests.yml            # Automated testing
│
├── docs/                    # Project documentation
│   ├── DEVELOPMENT_TASKS.md # Development roadmap
│   └── PROJECT_STRUCTURE.md # This file
│
├── backend/                 # Backend API (Node.js/Fastify)
│   ├── src/
│   │   ├── controllers/    # HTTP request handlers
│   │   ├── middleware/     # Authentication & authorization
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/         # API endpoint definitions (34 routes)
│   │   ├── sequelize/      # Database models (13 models)
│   │   ├── services/       # Business logic layer
│   │   ├── util/           # Helper functions
│   │   ├── app.ts          # Fastify application setup
│   │   └── index.ts        # Application entry point
│   │
│   ├── tests/              # Test suite
│   │   ├── integration/    # Integration tests
│   │   └── *.test.ts       # Unit tests
│   │
│   ├── .env.example        # Environment configuration template
│   ├── package.json        # Dependencies & scripts
│   ├── tsconfig.json       # TypeScript configuration
│   ├── jest.config.js      # Jest test configuration
│   ├── nodemon.json        # Development server config
│   ├── eslint.config.mjs   # ESLint rules
│   ├── ARCHITECTURE.md     # Backend architecture details
│   └── STUDENT_MANAGEMENT.md # Student management documentation
│
├── frontend/               # Frontend application (React/Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components (19 files)
│   │   ├── context/       # React Context providers
│   │   ├── pages/         # Page-level components (11 files)
│   │   ├── util/          # Helper utilities & API client
│   │   ├── App.tsx        # Main application component
│   │   ├── main.tsx       # Application entry point
│   │   ├── index.css      # Global styles
│   │   ├── types.d.ts     # TypeScript type definitions
│   │   └── vite-env.d.ts  # Vite environment types
│   │
│   ├── public/            # Static assets
│   │   ├── icons/         # SVG icons
│   │   └── oc_logo.png    # Application logo
│   │
│   ├── .env.example       # Frontend environment template
│   ├── package.json       # Dependencies & scripts
│   ├── tsconfig.json      # TypeScript base config
│   ├── tsconfig.app.json  # App-specific TS config
│   ├── tsconfig.node.json # Node-specific TS config
│   ├── vite.config.ts     # Vite bundler configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   ├── postcss.config.js  # PostCSS configuration
│   ├── eslint.config.js   # ESLint rules
│   ├── index.html         # HTML template
│   └── README.md          # Frontend-specific docs
│
├── Configuration Files
│   ├── .dockerignore      # Docker ignore patterns
│   ├── .env.example       # Root environment template
│   ├── .gitignore         # Git ignore patterns
│   ├── docker-compose.yml # Docker orchestration
│   ├── back.dockerfile    # Backend container image
│   ├── front.dockerfile   # Frontend container image
│   └── pnpm-workspace.yaml # pnpm monorepo configuration
│
├── Scripts
│   ├── setup-local-dev.sh # Automated local setup
│   ├── start.sh           # Start all services
│   └── start-db-only.sh   # Start database only
│
├── Database
│   └── schema.sql         # Database schema & seed data
│
└── Documentation
    ├── README.md          # Main project documentation
    ├── LOCAL_DEVELOPMENT.md # Local development guide
    ├── LICENSE            # MIT License
    └── CONTRIBUTING.md    # Contribution guidelines

```

## Technology Stack

### Backend
- **Runtime**: Node.js v20+
- **Framework**: Fastify 5.x
- **Database**: MariaDB 11
- **ORM**: Sequelize 6.x
- **Authentication**: Custom JWT-based auth
- **File Upload**: Cloudinary
- **Email**: Nodemailer (optional)
- **Testing**: Jest
- **Language**: TypeScript

### Frontend
- **Framework**: React 18.x
- **Build Tool**: Vite 6.x
- **Styling**: Tailwind CSS 3.x
- **Routing**: React Router 7.x
- **HTTP Client**: Axios
- **Language**: TypeScript

### DevOps
- **Containerization**: Docker & Docker Compose
- **Package Manager**: pnpm (monorepo)
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint

## Architecture Patterns

### Backend Architecture

The backend follows a **layered architecture** pattern:

1. **Routes Layer** (`src/routes/`)
   - Defines HTTP endpoints
   - Validates request parameters
   - Maps HTTP requests to controllers
   - 34 route files for modularity

2. **Controller Layer** (`src/controllers/`)
   - Handles HTTP-specific logic
   - Processes requests and responses
   - Delegates business logic to services

3. **Service Layer** (`src/services/`)
   - Contains business logic
   - Orchestrates operations
   - Independent of HTTP concerns

4. **Repository Layer** (`src/repositories/`)
   - Abstracts data access
   - Interacts with database models
   - Provides clean data interface

5. **Model Layer** (`src/sequelize/`)
   - Defines database schema
   - Sequelize ORM models
   - 13 models for database tables

### Frontend Architecture

The frontend follows a **component-based architecture**:

1. **Pages** (`src/pages/`)
   - Route-level components
   - Compose smaller components
   - Handle page-specific state

2. **Components** (`src/components/`)
   - Reusable UI elements
   - Self-contained logic
   - Props-based configuration

3. **Context** (`src/context/`)
   - Global state management
   - Authentication state
   - Theme/settings

4. **Utils** (`src/util/`)
   - API client (`api.ts`)
   - Helper functions
   - Shared utilities

## Database Schema

The database consists of 13 tables:

- **Users & Authentication**
  - `users` - User accounts
  - `students` - Student profiles
  - `teachers` - Teacher profiles

- **Classes & Groups**
  - `classes` - Course classes
  - `groups` - Student groups within classes
  - `group_members` - Group membership

- **Evaluations**
  - `evaluations` - Peer evaluation instances
  - `evaluation_responses` - Individual responses
  - `evaluation_criteria` - Evaluation metrics

- **Additional**
  - Related tables for managing relationships

See `schema.sql` for complete schema definition.

## API Structure

The backend exposes 34 RESTful API endpoints:

### Authentication
- POST `/api/login` - User authentication
- POST `/api/logout` - User logout

### Classes
- GET `/api/classes` - List all classes
- POST `/api/classes` - Create new class
- GET `/api/classes/:id` - Get class details
- PUT `/api/classes/:id` - Update class
- DELETE `/api/classes/:id` - Delete class

### Groups
- GET `/api/groups` - List groups
- POST `/api/groups` - Create group
- GET `/api/groups/:id/members` - List group members

### Students
- GET `/api/students` - List students
- POST `/api/students` - Create student
- PUT `/api/students/:id` - Update student
- DELETE `/api/students/:id` - Delete student

### Evaluations
- GET `/api/evaluations` - List evaluations
- POST `/api/evaluations` - Create evaluation
- POST `/api/evaluations/:id/responses` - Submit response
- GET `/api/evaluations/:id/results` - View results

See `backend/ARCHITECTURE.md` for complete API documentation.

## Development Workflow

### Starting the Application

```bash
# Clone repository
git clone <repository-url>
cd COSC470-PeerEvaluation

# Install dependencies (use pnpm)
pnpm install

# Set up environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start with Docker (recommended)
./start.sh

# Or start manually
pnpm run dev          # Both frontend & backend
pnpm run dev:backend  # Backend only
pnpm run dev:frontend # Frontend only
```

### Testing

```bash
# Backend tests
cd backend
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage

# Integration tests
./run-integration-tests.sh
```

### Building for Production

```bash
# Build all
pnpm run build

# Build individually
cd backend && pnpm run build
cd frontend && pnpm run build
```

## Code Organization Principles

### Backend
- **Single Responsibility**: Each route file handles one resource
- **Separation of Concerns**: Clear layer boundaries
- **Dependency Injection**: Services injected into controllers
- **Type Safety**: TypeScript throughout

### Frontend
- **Component Reusability**: Small, focused components
- **Props over State**: Minimize internal state
- **Context for Global State**: Authentication, theme
- **Co-location**: Related files together

## File Naming Conventions

- **TypeScript**: `camelCase.ts` for files, `PascalCase` for classes/components
- **Components**: `PascalCase.tsx` (e.g., `StudentList.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `api.ts`, `dateUtils.ts`)
- **Tests**: `*.test.ts` or `*.spec.ts`
- **Configuration**: `lowercase.config.ts` (e.g., `vite.config.ts`)

## Environment Variables

### Backend (.env)
```env
MYSQL_HOST=mariadb
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASS=root
MYSQL_DB=cosc471
PORT=5008
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend (.env)
```env
VITE_TEST_CREDENTIALS='[...]'  # Test account credentials
VITE_API_URL=http://localhost:5008  # Optional
```

## Git Workflow

1. **Feature Branches**: Create from `main`
   ```bash
   git checkout -b feat/feature-name
   ```

2. **Commit Messages**: Follow conventional commits
   ```
   feat: Add student group creation
   fix: Resolve authentication timeout
   docs: Update API documentation
   ```

3. **Pull Requests**: Required for merging to `main`
   - All tests must pass
   - Code review required
   - CI/CD checks must pass

## Dependencies Management

Use **pnpm** as the package manager for all workspaces:

```bash
# Install dependencies
pnpm install

# Add dependency to backend
pnpm --filter backend add <package>

# Add dependency to frontend
pnpm --filter frontend add <package>

# Update dependencies
pnpm update
```

## Testing Strategy

### Backend Testing
- **Unit Tests**: Test individual functions and services
- **Integration Tests**: Test API endpoints end-to-end
- **Coverage Goal**: >80% code coverage

### Frontend Testing
- **Component Tests**: Test UI components (planned)
- **Integration Tests**: Test user flows (planned)
- **E2E Tests**: Full application tests (planned)

## Performance Considerations

- **Database**: Indexes on frequently queried columns
- **Frontend**: Code splitting with React.lazy
- **API**: Response caching where appropriate
- **Assets**: CDN delivery (Cloudinary)

## Security Measures

- **Authentication**: JWT-based sessions
- **Authorization**: Role-based access control
- **Validation**: Input validation on all endpoints
- **SQL Injection**: Protected via Sequelize ORM
- **XSS**: React's built-in protection
- **Secrets**: Environment variables, not committed

## Monitoring & Logging

- **Development**: Console logging (to be replaced)
- **Production**: Structured logging (planned)
- **Error Tracking**: Sentry integration (planned)

## Next Steps

See `docs/DEVELOPMENT_TASKS.md` for planned features and improvements.

## Contributing

See `CONTRIBUTING.md` for contribution guidelines.

## License

MIT License - see `LICENSE` file for details.
