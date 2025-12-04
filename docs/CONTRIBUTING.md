# Contributing to COSC470 Peer Evaluation

Thank you for your interest in contributing to the COSC470 Peer Evaluation project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

## Code of Conduct

This is an educational project. Please be respectful and constructive in all interactions.

### Our Standards

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the project
- Show empathy towards other contributors
- Accept constructive criticism gracefully

## Getting Started

### Prerequisites

- Node.js 20+ ([Download](https://nodejs.org/))
- pnpm (`npm install -g pnpm`)
- Docker & Docker Compose ([Download](https://www.docker.com/))
- Git

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/COSC470-PeerEvaluation.git
   cd COSC470-PeerEvaluation
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/COSC470-PeerEvaluation.git
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Set up environment**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

5. **Start development environment**
   ```bash
   ./start.sh
   # Or manually: pnpm run dev
   ```

See `LOCAL_DEVELOPMENT.md` for detailed setup instructions.

## Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feat/your-feature-name
```

### Branch Naming Convention

- `feat/` - New features (e.g., `feat/add-group-chat`)
- `fix/` - Bug fixes (e.g., `fix/login-timeout`)
- `docs/` - Documentation changes (e.g., `docs/update-api-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/simplify-auth`)
- `test/` - Adding tests (e.g., `test/add-group-tests`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

### 3. Test Your Changes

```bash
# Backend tests
cd backend
pnpm test
pnpm run test:integration

# Frontend (when tests are available)
cd frontend
pnpm test

# Run all tests
pnpm test
```

### 4. Commit Your Changes

See [Commit Guidelines](#commit-guidelines) below.

### 5. Push and Create Pull Request

```bash
git push origin feat/your-feature-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### General Principles

- **DRY (Don't Repeat Yourself)**: Avoid code duplication
- **KISS (Keep It Simple)**: Prefer simple solutions
- **YAGNI (You Aren't Gonna Need It)**: Don't add unnecessary features
- **Separation of Concerns**: Each module should have a single responsibility

### TypeScript

- Use TypeScript for all new code
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Prefer `const` over `let`, avoid `var`

```typescript
// Good
interface User {
  id: number;
  username: string;
  role: 'Student' | 'Teacher';
}

const createUser = (data: Omit<User, 'id'>): User => {
  // Implementation
};

// Bad
const createUser = (data: any) => {
  // Implementation
};
```

### Backend Code Style

#### File Organization

```typescript
// 1. Imports (grouped: external, internal, types)
import { FastifyRequest, FastifyReply } from 'fastify';
import { studentService } from '../services/studentService';
import { CreateStudentRequest } from '../types';

// 2. Type definitions
interface RouteParams {
  id: string;
}

// 3. Route handlers
export const getStudent = async (
  request: FastifyRequest<{ Params: RouteParams }>,
  reply: FastifyReply
) => {
  // Implementation
};
```

#### Naming Conventions

- **Files**: `camelCase.ts` (e.g., `studentService.ts`)
- **Classes**: `PascalCase` (e.g., `StudentRepository`)
- **Functions**: `camelCase` (e.g., `createStudent`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_PAGE_SIZE`)
- **Interfaces**: `PascalCase` with descriptive names (e.g., `CreateStudentRequest`)

#### Service Layer Pattern

```typescript
// services/studentService.ts
export const studentService = {
  async createStudent(data: CreateStudentData): Promise<Student> {
    // Validation
    // Business logic
    // Call repository
  },

  async getStudent(id: number): Promise<Student | null> {
    // Implementation
  }
};
```

### Frontend Code Style

#### Component Structure

```typescript
// components/StudentCard.tsx
import React from 'react';
import { Student } from '../types';

interface StudentCardProps {
  student: Student;
  onEdit?: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onEdit
}) => {
  return (
    <div className="card">
      {/* JSX */}
    </div>
  );
};
```

#### Naming Conventions

- **Components**: `PascalCase.tsx` (e.g., `StudentList.tsx`)
- **Hooks**: `use` prefix (e.g., `useAuth.ts`)
- **Utils**: `camelCase.ts` (e.g., `formatDate.ts`)
- **Props**: Component name + `Props` (e.g., `StudentCardProps`)

#### React Best Practices

- Use functional components with hooks
- Avoid prop drilling (use Context for global state)
- Memoize expensive computations with `useMemo`
- Use `useCallback` for callback props
- Extract complex logic into custom hooks

### CSS/Styling

- Use Tailwind utility classes
- Follow mobile-first approach
- Keep custom CSS minimal
- Use semantic class names when needed

```tsx
// Good: Tailwind utilities
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Submit
</button>

// Acceptable: Custom classes for complex components
<div className="student-card">
  {/* Content */}
</div>
```

## Commit Guidelines

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependencies

### Examples

```bash
# Simple commit
git commit -m "feat: Add student group creation"

# With scope
git commit -m "fix(auth): Resolve session timeout issue"

# With body and footer
git commit -m "feat(evaluations): Add peer evaluation submission

- Add evaluation form component
- Implement submission API endpoint
- Add validation for required criteria

Closes #42"
```

### Commit Best Practices

- **Atomic Commits**: Each commit should be a single logical change
- **Descriptive**: Explain *why* not just *what*
- **Present Tense**: Use "Add feature" not "Added feature"
- **Imperative Mood**: Use "Fix bug" not "Fixes bug"
- **Reference Issues**: Include issue numbers when applicable

```bash
# Good
git commit -m "fix: Prevent duplicate group creation"

# Bad
git commit -m "fixed some stuff"
```

## Pull Request Process

### Before Submitting

- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] No console.log statements (use proper logging)
- [ ] No commented-out code
- [ ] Environment variables use `.env.example`

### PR Title

Use the same format as commit messages:

```
feat: Add real-time notification system
fix: Resolve evaluation submission error
docs: Update API documentation
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (please describe)

## Changes Made
- List key changes
- One per line

## Testing
Describe how you tested these changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
Relates to #456
```

### Review Process

1. **Automated Checks**: CI/CD must pass
   - Build successful
   - All tests pass
   - No linting errors

2. **Code Review**: At least one approval required
   - Reviewers check code quality
   - Verify tests are adequate
   - Ensure documentation is updated

3. **Merge**: Maintainer merges after approval

### Addressing Feedback

```bash
# Make requested changes
git add .
git commit -m "fix: Address review feedback"
git push origin feat/your-feature-name
```

## Testing Requirements

### Backend Testing

All new backend features must include tests:

```typescript
// tests/studentService.test.ts
describe('StudentService', () => {
  describe('createStudent', () => {
    it('should create a new student', async () => {
      const data = { username: 'test', email: 'test@example.com' };
      const result = await studentService.createStudent(data);

      expect(result).toHaveProperty('id');
      expect(result.username).toBe('test');
    });

    it('should throw error for duplicate username', async () => {
      const data = { username: 'existing', email: 'test@example.com' };

      await expect(studentService.createStudent(data))
        .rejects
        .toThrow('Username already exists');
    });
  });
});
```

### Test Coverage

- **Minimum**: 70% code coverage
- **Target**: 80%+ code coverage
- **Critical Paths**: 100% coverage for authentication, authorization

### Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# Integration tests
cd backend && ./run-integration-tests.sh
```

## Documentation

### Code Documentation

```typescript
/**
 * Creates a new student account
 * @param data - Student creation data
 * @returns Created student object
 * @throws Error if username already exists
 */
export const createStudent = async (
  data: CreateStudentData
): Promise<Student> => {
  // Implementation
};
```

### README Updates

Update relevant README files when:
- Adding new features
- Changing setup process
- Modifying API endpoints
- Adding dependencies

### API Documentation

Document new endpoints in `backend/ARCHITECTURE.md`:

```markdown
### POST /api/students

Create a new student account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "username": "student123",
  "email": "student@example.com"
}
```

**Errors:**
- `400 Bad Request` - Invalid data
- `409 Conflict` - Username already exists
```

## Project-Specific Guidelines

### Database Changes

1. **Schema Changes**: Update `schema.sql`
2. **Models**: Update Sequelize models
3. **Migration**: Document migration steps
4. **Seed Data**: Update if necessary

### Environment Variables

1. Add to appropriate `.env.example` file
2. Document in README
3. Provide sensible defaults when possible
4. Never commit actual `.env` files

### Adding Dependencies

```bash
# Backend
pnpm --filter backend add <package>

# Frontend
pnpm --filter frontend add <package>

# Dev dependency
pnpm --filter backend add -D <package>
```

Always justify new dependencies in PR description.

### Docker Changes

If modifying Docker configuration:
1. Test locally with `docker-compose up --build`
2. Document changes in PR
3. Update relevant documentation

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Create an Issue with detailed reproduction steps
- **Features**: Open an Issue to discuss before implementing

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You!

Your contributions make this project better. We appreciate your time and effort!
