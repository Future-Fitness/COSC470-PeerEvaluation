# Project Structure Improvement Proposal

## Current Issues

### Backend (34 route files in flat structure)
- All routes in single `src/routes/` directory
- Hard to navigate and find related routes
- No clear domain boundaries
- Mixed concerns (auth, classes, groups, assignments, etc.)

### Frontend (19 components in flat structure)
- All components in single `src/components/` directory
- No separation between UI primitives and domain components
- Hard to identify component purpose
- Not following feature-based architecture

### Services (6 files)
- Flat structure, but manageable size
- Could benefit from domain grouping

## Proposed Structure

### Backend - Domain-Driven Organization

```
backend/src/
├── modules/                    # Domain modules (feature-based)
│   ├── auth/                   # Authentication & Authorization
│   │   ├── routes/
│   │   │   ├── login.ts
│   │   │   ├── request-otp.ts
│   │   │   ├── verify-otp.ts
│   │   │   ├── profile.ts
│   │   │   └── index.ts       # Route aggregator
│   │   ├── services/
│   │   │   └── authService.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   └── types.ts
│   │
│   ├── classes/                # Class management
│   │   ├── routes/
│   │   │   ├── list-classes.ts
│   │   │   ├── create-class.ts
│   │   │   ├── get-class.ts
│   │   │   ├── class-members.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── classService.ts
│   │   └── types.ts
│   │
│   ├── students/               # Student management
│   │   ├── routes/
│   │   │   ├── list-students.ts
│   │   │   ├── add-students.ts
│   │   │   ├── import-students.ts
│   │   │   ├── upload-csv.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── studentService.ts
│   │   └── types.ts
│   │
│   ├── groups/                 # Group management
│   │   ├── routes/
│   │   │   ├── list-groups.ts
│   │   │   ├── create-group.ts
│   │   │   ├── delete-group.ts
│   │   │   ├── save-groups.ts
│   │   │   ├── group-members.ts
│   │   │   ├── student-groups.ts
│   │   │   ├── unassigned-groups.ts
│   │   │   ├── next-group-id.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── groupService.ts
│   │   │   └── groupListService.ts
│   │   └── types.ts
│   │
│   ├── assignments/            # Assignment management
│   │   ├── routes/
│   │   │   ├── list-assignments.ts
│   │   │   ├── create-assignment.ts
│   │   │   ├── initialize-groups.ts
│   │   │   ├── get-submission.ts
│   │   │   ├── upload-submission.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── submissionService.ts
│   │   └── types.ts
│   │
│   ├── rubrics/                # Rubric & Criteria
│   │   ├── routes/
│   │   │   ├── create-rubric.ts
│   │   │   ├── get-rubric.ts
│   │   │   ├── list-criteria.ts
│   │   │   ├── create-criteria.ts
│   │   │   ├── create-criterion.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── rubricService.ts
│   │   └── types.ts
│   │
│   ├── reviews/                # Peer reviews
│   │   ├── routes/
│   │   │   ├── create-review.ts
│   │   │   ├── get-review.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── reviewService.ts
│   │   └── types.ts
│   │
│   └── health/                 # Health checks
│       └── routes/
│           ├── ping.ts
│           └── index.ts
│
├── shared/                     # Shared across modules
│   ├── database/
│   │   ├── models/             # Sequelize models
│   │   ├── repositories/       # Data access
│   │   └── migrations/         # DB migrations (future)
│   ├── services/
│   │   └── emailService.ts
│   ├── middleware/
│   │   └── errorHandler.ts
│   ├── utils/
│   │   └── validators.ts
│   └── types/
│       └── common.ts
│
├── config/                     # Configuration
│   ├── database.ts
│   └── env.ts
│
├── app.ts                      # Fastify app setup
└── index.ts                    # Entry point
```

### Frontend - Feature-Based Organization

```
frontend/src/
├── features/                   # Feature modules
│   ├── auth/                   # Authentication
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── OTPForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── SignupPage.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── types.ts
│   │
│   ├── classes/                # Class management
│   │   ├── components/
│   │   │   ├── ClassCard.tsx
│   │   │   ├── ClassMembersList.tsx
│   │   │   └── CreateClassForm.tsx
│   │   ├── pages/
│   │   │   ├── ClassHome.tsx
│   │   │   ├── ClassMembers.tsx
│   │   │   └── CreateClass.tsx
│   │   └── types.ts
│   │
│   ├── students/               # Student management
│   │   ├── components/
│   │   │   ├── StudentList.tsx
│   │   │   ├── StudentCSVUpload.tsx
│   │   │   └── StudentCard.tsx
│   │   ├── pages/
│   │   │   └── AllStudents.tsx
│   │   └── types.ts
│   │
│   ├── groups/                 # Group management
│   │   ├── components/
│   │   │   ├── GroupCard.tsx
│   │   │   ├── GroupMembers.tsx
│   │   │   └── GroupCreator.tsx
│   │   ├── pages/
│   │   │   └── Group.tsx
│   │   └── types.ts
│   │
│   ├── assignments/            # Assignments
│   │   ├── components/
│   │   │   ├── AssignmentCard.tsx
│   │   │   ├── SubmissionUpload.tsx
│   │   │   └── SubmissionViewer.tsx
│   │   ├── pages/
│   │   │   ├── AssignmentDetail.tsx
│   │   │   └── AssignmentRubric.tsx
│   │   └── types.ts
│   │
│   ├── rubrics/                # Rubrics & Criteria
│   │   ├── components/
│   │   │   ├── RubricCreator.tsx
│   │   │   ├── RubricDisplay.tsx
│   │   │   ├── Criteria.tsx
│   │   │   └── Criterion.tsx
│   │   └── types.ts
│   │
│   └── profile/                # User profile
│       ├── pages/
│       │   └── Profile.tsx
│       └── types.ts
│
├── components/                 # Shared UI components
│   ├── ui/                     # Basic UI primitives
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── Textbox.tsx
│   │   ├── Textarea.tsx
│   │   ├── Loader.tsx
│   │   └── Toast.tsx
│   │
│   └── layout/                 # Layout components
│       ├── Sidebar.tsx
│       ├── TabNavigation.tsx
│       └── AppLayout.tsx
│
├── shared/                     # Shared utilities
│   ├── hooks/                  # Shared custom hooks
│   │   ├── useToast.ts
│   │   └── useModal.ts
│   ├── api/                    # API client
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── classes.ts
│   │   ├── students.ts
│   │   └── ...
│   ├── utils/                  # Helper functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   └── types/                  # Shared types
│       └── common.ts
│
├── context/                    # React contexts
│   └── AuthContext.tsx
│
├── pages/                      # Root pages
│   └── Home.tsx
│
├── App.tsx
├── main.tsx
└── index.css
```

## Benefits of New Structure

### 1. Domain-Driven Design
- Clear boundaries between features
- Easy to locate related files
- Reduces cognitive load
- Better for team collaboration

### 2. Scalability
- Easy to add new features without cluttering
- Can extract modules to microservices later
- Clear dependencies between modules

### 3. Maintainability
- Related files are co-located
- Easier to understand feature scope
- Simpler to test individual modules
- Better code ownership

### 4. Developer Experience
- Faster navigation
- Clear file organization
- Intuitive structure
- Follows industry best practices

## Migration Strategy

### Phase 1: Backend Routes (High Priority)
1. Create module directories
2. Move route files to appropriate modules
3. Create index.ts aggregators
4. Update app.ts to register module routes
5. Update imports across codebase
6. Test all endpoints

### Phase 2: Backend Services & Repositories (Medium Priority)
1. Move services to module directories
2. Move repositories to shared/database
3. Update imports
4. Test all functionality

### Phase 3: Frontend Components (High Priority)
1. Create feature directories
2. Move domain components to features
3. Move UI primitives to components/ui
4. Update imports across pages
5. Test all pages

### Phase 4: Frontend Pages (Medium Priority)
1. Move pages to feature directories
2. Update routing configuration
3. Test all routes

### Phase 5: API Client (Low Priority)
1. Split api.ts into domain files
2. Create feature-specific API clients
3. Update component imports

## File Naming Conventions

### Backend
- **Routes**: `kebab-case.ts` (e.g., `list-students.ts`)
- **Services**: `camelCase.ts` (e.g., `studentService.ts`)
- **Index files**: `index.ts` (route aggregators)

### Frontend
- **Components**: `PascalCase.tsx` (e.g., `StudentCard.tsx`)
- **Pages**: `PascalCase.tsx` (e.g., `AllStudents.tsx`)
- **Hooks**: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- **Utils**: `camelCase.ts` (e.g., `formatters.ts`)

## Route Registration Pattern

Each module will have an `index.ts` that exports route registration:

```typescript
// backend/src/modules/students/routes/index.ts
import { FastifyInstance } from 'fastify';
import { listStudents } from './list-students';
import { addStudents } from './add-students';
import { importStudents } from './import-students';

export const registerStudentRoutes = async (app: FastifyInstance) => {
  app.register(async (studentRoutes) => {
    studentRoutes.get('/students', listStudents);
    studentRoutes.post('/students', addStudents);
    studentRoutes.post('/students/import', importStudents);
  });
};
```

```typescript
// backend/src/app.ts
import { registerAuthRoutes } from './modules/auth/routes';
import { registerStudentRoutes } from './modules/students/routes';
import { registerClassRoutes } from './modules/classes/routes';
// ... other modules

export const createApp = async () => {
  const app = fastify();

  // Register module routes
  await app.register(registerAuthRoutes, { prefix: '/api' });
  await app.register(registerStudentRoutes, { prefix: '/api' });
  await app.register(registerClassRoutes, { prefix: '/api' });

  return app;
};
```

## Component Export Pattern

```typescript
// frontend/src/features/students/components/index.ts
export { StudentList } from './StudentList';
export { StudentCard } from './StudentCard';
export { StudentCSVUpload } from './StudentCSVUpload';
```

```typescript
// Usage in pages
import { StudentList, StudentCard } from '@/features/students/components';
```

## Testing Strategy

After each phase:
1. Run all tests: `pnpm test`
2. Test all affected endpoints/pages manually
3. Verify no broken imports
4. Check TypeScript compilation
5. Test in Docker environment

## Rollback Plan

Each phase should be a separate commit:
```bash
git commit -m "refactor(backend): Reorganize auth module"
git commit -m "refactor(backend): Reorganize student module"
# etc.
```

If issues arise, can revert specific commits.

## Estimated Impact

### Files to Move
- Backend: 34 route files, 6 service files
- Frontend: 19 components, 11 pages
- Total: ~70 files

### Import Updates Required
- Backend: ~100 import statements
- Frontend: ~150 import statements

### Time Estimate
- Phase 1 (Backend Routes): 2-3 hours
- Phase 2 (Backend Services): 1-2 hours
- Phase 3 (Frontend Components): 2-3 hours
- Phase 4 (Frontend Pages): 1-2 hours
- Phase 5 (API Client): 1-2 hours
- Testing & Fixes: 2-3 hours
- **Total: 9-15 hours**

## Additional Improvements

### Path Aliases
Configure TypeScript path aliases for cleaner imports:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/modules/*": ["./src/modules/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/features/*": ["./src/features/*"],
      "@/components/*": ["./src/components/*"]
    }
  }
}
```

### Barrel Exports
Use index.ts files for clean exports:

```typescript
// Before
import { StudentCard } from '../../features/students/components/StudentCard';

// After
import { StudentCard } from '@/features/students/components';
```

## Success Metrics

After migration:
- ✅ All tests pass
- ✅ No TypeScript errors
- ✅ All routes functional
- ✅ All pages render correctly
- ✅ Improved developer satisfaction
- ✅ Faster feature development

## Questions & Decisions

1. **Should we move models to modules or keep shared?**
   - Recommendation: Keep shared (used across modules)

2. **Should repositories be per-module or shared?**
   - Recommendation: Keep shared (database layer abstraction)

3. **Should we create a types package?**
   - Recommendation: Module-specific types in modules, shared types in shared/

4. **How to handle cross-module dependencies?**
   - Recommendation: Use services, avoid direct module imports

## Next Steps

1. Review this proposal with team
2. Get approval for approach
3. Create feature branch: `refactor/improve-structure`
4. Execute Phase 1 (Backend Routes)
5. Test and commit
6. Continue with subsequent phases
7. Update documentation
8. Merge to main

## References

- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
