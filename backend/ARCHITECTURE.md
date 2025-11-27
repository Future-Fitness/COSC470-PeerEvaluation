# Backend Architecture - MVC Pattern

This backend follows the **Model-View-Controller (MVC)** architecture pattern with a service layer for better separation of concerns.

## Directory Structure

```
backend/src/
├── controllers/        # Request/Response handlers
│   └── submissionController.ts
├── services/          # Business logic layer
│   └── submissionService.ts
├── routes/            # Route definitions (thin layer)
│   ├── upload_submission.ts
│   └── get_submission.ts
├── sequelize/         # Models (Database layer)
│   ├── User.ts
│   ├── Submission.ts
│   └── ...
├── util/              # Utility functions
│   ├── cloudinary.ts
│   ├── fileUpload.ts
│   └── database.ts
└── middleware/        # Middleware functions
    └── auth.ts
```

## Architecture Layers

### 1. **Routes** (`routes/`)
- **Purpose**: Define API endpoints and delegate to controllers
- **Responsibility**: Routing only, no business logic
- **Example**: `upload_submission.ts`

```typescript
export default function (app: FastifyInstance) {
  app.post('/upload_submission', async (req, resp) => {
    const getSession = (token: string) => app.session[token];
    await uploadSubmissionController(req, resp, getSession);
  });
}
```

### 2. **Controllers** (`controllers/`)
- **Purpose**: Handle HTTP requests and responses
- **Responsibility**: 
  - Request validation
  - Authentication/Authorization
  - Calling service layer
  - Formatting responses
- **Example**: `submissionController.ts`

```typescript
export async function uploadSubmissionController(req, resp, getSession) {
  // 1. Parse multipart data
  // 2. Validate input
  // 3. Check authentication
  // 4. Call service layer
  // 5. Return formatted response
}
```

### 3. **Services** (`services/`)
- **Purpose**: Business logic and data orchestration
- **Responsibility**:
  - Coordinate between models and utilities
  - Implement business rules
  - Transaction management
- **Example**: `submissionService.ts`

```typescript
export async function createOrUpdateSubmission(
  fileStream: NodeJS.ReadableStream,
  studentID: number,
  assignmentID: number
) {
  // 1. Upload file to cloud storage
  // 2. Create or update database record
  // 3. Return structured data
}
```

### 4. **Models** (`sequelize/`)
- **Purpose**: Database schema and ORM models
- **Responsibility**: Data structure and database operations
- **Example**: `Submission.ts`

### 5. **Utilities** (`util/`)
- **Purpose**: Reusable helper functions
- **Responsibility**: Generic operations (file upload, cloudinary, etc.)
- **Example**: `fileUpload.ts`

```typescript
export async function uploadToCloudinary(
  fileStream: NodeJS.ReadableStream,
  folder: string,
  publicId: string
): Promise<UploadResult> {
  // Handle Cloudinary upload logic
}
```

## File Upload Flow

```
Client Request
    ↓
Route (upload_submission.ts)
    ↓
Controller (submissionController.ts)
    ├── Validate request
    ├── Check authentication
    └── Call service
         ↓
Service (submissionService.ts)
    ├── Upload file (via util/fileUpload)
    └── Save to database (via model)
         ↓
Response to Client
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Easy to unit test services and controllers independently
3. **Maintainability**: Changes in one layer don't affect others
4. **Reusability**: Services and utilities can be reused across routes
5. **Scalability**: Easy to add new features following the same pattern

## File Upload Implementation

### Cloudinary Integration

The file upload uses Cloudinary for cloud storage:

- **Configuration**: `util/cloudinary.ts`
- **Upload Logic**: `util/fileUpload.ts`
- **Features**:
  - Automatic file type detection
  - Organized folder structure (`submissions/{assignmentID}/`)
  - Unique file naming
  - Secure URL generation
  - File deletion support

### Endpoints

#### Upload Submission
- **POST** `/upload_submission`
- **Body**: `multipart/form-data`
  - `file`: The file to upload
  - `assignmentID`: The assignment ID
- **Response**:
```json
{
  "message": "File uploaded successfully",
  "submission": {
    "id": 1,
    "path": "https://cloudinary.com/...",
    "studentID": 123,
    "assignmentID": 456
  },
  "cloudinary": {
    "url": "https://...",
    "publicId": "submissions/456/student_123_...",
    "format": "pdf",
    "resourceType": "raw"
  }
}
```

#### Get My Submission
- **GET** `/my_submission/:assignmentID`
- **Auth**: Bearer token required
- **Response**: Submission object

#### Get All Submissions
- **GET** `/submissions/:assignmentID`
- **Response**: Array of submissions with student details

## Environment Variables

Required for file upload:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Adding New Features

To add a new feature, follow this pattern:

1. **Create Service** (`services/yourFeatureService.ts`)
   - Implement business logic
   - Use models and utilities

2. **Create Controller** (`controllers/yourFeatureController.ts`)
   - Handle request/response
   - Call service functions

3. **Create Route** (`routes/yourFeature.ts`)
   - Define endpoints
   - Delegate to controller

4. **Register Route** (`app.ts` or `index.ts`)
   - Import and register the route

## Testing

Each layer can be tested independently:

- **Services**: Test business logic with mocked models
- **Controllers**: Test request handling with mocked services
- **Routes**: Integration tests with full stack

Example test structure:
```
tests/
├── unit/
│   ├── services/
│   └── controllers/
└── integration/
    └── routes/
```
