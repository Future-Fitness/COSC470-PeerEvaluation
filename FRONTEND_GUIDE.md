# Frontend Functionality & User Flow Guide

## 📊 Current Status Overview

### ✅ What EXISTS (Frontend Pages)
```
✅ LoginPage.tsx          - User authentication
✅ SignupPage.tsx         - New user registration
✅ Home.tsx               - Dashboard (needs API integration)
✅ Profile.tsx            - User profile with gummy bear avatar
✅ CreateClass.tsx        - Create new class form
✅ ClassHome.tsx          - Class details & assignments
✅ ClassMembers.tsx       - View class members
✅ Assignment.tsx         - Assignment details
✅ Group.tsx              - Group management
```

### ✅ What EXISTS (Components)
```
✅ Sidebar               - Collapsible navigation
✅ ClassCard             - Display class info
✅ AssignmentCard        - Display assignment info
✅ Button                - Styled button component
✅ Textbox               - Input component
✅ TabNavigation         - Tab switcher
✅ ProtectedRoute        - Auth guard
✅ ThemeContext          - Dark mode support
```

### ✅ What EXISTS (Backend APIs)
```
Authentication:
✅ POST /login                          - Login with credentials
✅ GET  /profile                        - Get current user profile
✅ GET  /profile/:id                    - Get user by ID

Classes:
✅ GET  /classes                        - List all classes
✅ POST /create_class                   - Create new class
✅ GET  /class_members/:id              - Get class members
✅ GET  /get_className/:id              - Get class name

Assignments:
✅ GET  /assignments/:courseId          - List assignments for class
✅ POST /create_assignment              - Create new assignment

Groups:
✅ POST /create_group                   - Create group
✅ GET  /list_all_groups/:assignmentID  - List groups for assignment
✅ GET  /list_group_members/:groupID    - Get group members
✅ DELETE /delete_group                 - Delete group

Submissions (NEW - Cloudinary):
✅ POST /upload_submission              - Upload file to Cloudinary
✅ GET  /submission/:id                 - Get submission by ID
✅ GET  /submissions/:assignmentID      - Get all submissions
✅ GET  /my_submission/:assignmentID    - Get my submission

Rubrics & Reviews:
✅ POST /create_rubric                  - Create grading rubric
✅ GET  /get_rubric/:assignmentID       - Get rubric
✅ POST /create_criterion               - Add criterion
✅ POST /create_review                  - Create peer review
✅ GET  /get_review/:assignmentID/:userID - Get review
```

---

## 🎯 User Flow Diagrams

### 👨‍🏫 TEACHER FLOW

```
Login (LoginPage)
    ↓
Dashboard (Home)
    - View all my classes
    - Create new class button
    ↓
[Click on Class Card]
    ↓
Class Home (ClassHome)
    - View assignments
    - View members (tab)
    - Create assignment button
    ↓
[Click on Assignment]
    ↓
Assignment Detail (Assignment)
    - View assignment info
    - See all student submissions
    - Download submitted files
    - Create rubric
    - Create groups
    - Assign peer reviews
    ↓
[View Submissions Table]
    - Student names
    - Submission status
    - Download links (Cloudinary)
```

### 👨‍🎓 STUDENT FLOW

```
Login (LoginPage)
    ↓
Dashboard (Home)
    - View enrolled classes
    ↓
[Click on Class Card]
    ↓
Class Home (ClassHome)
    - View assignments
    - See due dates
    ↓
[Click on Assignment]
    ↓
Assignment Detail (Assignment)
    - View assignment description
    - Upload submission (file)
    - View my submission status
    - Complete peer reviews (if assigned)
    ↓
[Upload File]
    - Select file (PDF, DOC, etc.)
    - Upload to Cloudinary
    - See confirmation + link
    ↓
[Peer Review] (if assigned)
    - View rubric criteria
    - Rate peer's work
    - Submit review
```

---

## 🚀 Implementation Phases (What to Build)

### **PHASE 1**: Teacher Views Classes ⏳ NOT STARTED

**Page:** Home.tsx
**API:** GET /classes

**What to Add:**
```typescript
// api.ts
export const getClasses = async () => {
  const resp = await fetch(`${BASE_URL}/classes`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return await resp.json();
}

// Home.tsx
- useEffect to fetch classes on mount
- Display ClassCard components in grid
- Loading spinner while fetching
- Error message if fails
```

**User sees:**
- Grid of class cards
- Class name on each card
- Click to enter class

---

### **PHASE 2**: Create Class (Teacher) ⏳ NOT STARTED

**Page:** Home.tsx (modal)
**API:** POST /create_class

**What to Add:**
```typescript
// api.ts
export const createClass = async (name: string) => {
  const resp = await fetch(`${BASE_URL}/create_class`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, teacherID: getUserId() })
  });
  return await resp.json();
}

// Home.tsx
- "Create Class" button (only if isTeacher)
- Modal with name input
- Submit → create class → refresh list
```

**User sees:**
- Button to create new class
- Modal form pops up
- Success message
- New class appears in grid

---

### **PHASE 3**: View Assignments ⏳ NOT STARTED

**Page:** ClassHome.tsx
**API:** GET /assignments/:courseId
**Component:** AssignmentCard (create)

**What to Add:**
```typescript
// api.ts
export const getAssignments = async (courseId: string) => {
  const resp = await fetch(`${BASE_URL}/assignments/${courseId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return await resp.json();
}

// ClassHome.tsx
- Fetch assignments for current class
- Display AssignmentCard grid
- "No assignments" empty state
- Tab navigation (Assignments / Members)
```

**User sees:**
- List of assignments for the class
- Assignment name on each card
- Click to view details

---

### **PHASE 4**: Create Assignment (Teacher) ⏳ NOT STARTED

**Page:** ClassHome.tsx (modal)
**API:** POST /create_assignment

**What to Add:**
```typescript
// api.ts
export const createAssignment = async (data: {
  courseID: number;
  name: string;
  rubric?: string;
}) => {
  const resp = await fetch(`${BASE_URL}/create_assignment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return await resp.json();
}

// ClassHome.tsx
- "Create Assignment" button (teacher only)
- Modal with form (name, description)
- Submit → create → refresh list
```

**User sees:**
- Button to create assignment
- Form modal
- New assignment in list

---

### **PHASE 5**: Upload Submission (Student) ⏳ NOT STARTED

**Page:** Assignment.tsx
**API:** POST /upload_submission
**Component:** SubmissionUpload (create)

**What to Add:**
```typescript
// api.ts
export const uploadSubmission = async (
  file: File,
  assignmentID: string
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('assignmentID', assignmentID);

  const resp = await fetch(`${BASE_URL}/upload_submission`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData // NO Content-Type header!
  });
  return await resp.json();
}

export const getMySubmission = async (assignmentID: string) => {
  const resp = await fetch(
    `${BASE_URL}/my_submission/${assignmentID}`,
    { headers: { 'Authorization': `Bearer ${getToken()}` }}
  );
  if (resp.status === 404) return null;
  return await resp.json();
}

// Assignment.tsx
- Check if submission exists on mount
- Show file upload section if student
- File input + upload button
- Show file name and size
- Progress indicator
- Success message with link
- View/replace existing submission
```

**User sees:**
- File upload area
- Browse/select file
- Upload progress
- Success checkmark
- Link to view uploaded file
- "Replace submission" if already uploaded

---

### **PHASE 6**: View Submissions (Teacher) ⏳ NOT STARTED

**Page:** Assignment.tsx
**API:** GET /submissions/:assignmentID
**Component:** SubmissionsTable (create)

**What to Add:**
```typescript
// api.ts
export const getSubmissions = async (assignmentID: string) => {
  const resp = await fetch(
    `${BASE_URL}/submissions/${assignmentID}`,
    { headers: { 'Authorization': `Bearer ${getToken()}` }}
  );
  return await resp.json();
}

// Assignment.tsx
- Check if user is teacher
- Fetch all submissions
- Display in table format
- Columns: Student, Email, Status, File
- Download link for each submission
```

**User sees:**
- Table of all submissions
- Student names
- Submission status
- Download buttons (opens Cloudinary URL)
- "No submissions yet" if empty

---

## 📁 File Structure (What Goes Where)

```
frontend/src/
├── pages/
│   ├── Home.tsx                    ✏️ MODIFY (Phases 1-2)
│   ├── ClassHome.tsx               ✏️ MODIFY (Phases 3-4)
│   ├── Assignment.tsx              ✏️ MODIFY (Phases 5-6)
│   ├── LoginPage.tsx               ✅ DONE
│   ├── Profile.tsx                 ✅ DONE
│   └── ...
│
├── components/
│   ├── ClassCard.tsx               ✏️ MODIFY (add Link)
│   ├── AssignmentCard.tsx          ➕ CREATE (Phase 3)
│   ├── SubmissionUpload.tsx        ➕ CREATE (Phase 5)
│   ├── SubmissionsTable.tsx        ➕ CREATE (Phase 6)
│   ├── Modal.tsx                   ➕ CREATE (Phase 2)
│   └── ...
│
├── util/
│   └── api.ts                      ✏️ MODIFY (all phases)
│
└── context/
    └── ThemeContext.tsx            ✅ DONE
```

---

## 🎨 UI/UX Guidelines

### Design Patterns to Follow:

**Cards:**
```tsx
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow cursor-pointer">
  {/* Content */}
</div>
```

**Buttons:**
```tsx
<Button
  onClick={handleClick}
  className="bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
>
  Action
</Button>
```

**Loading State:**
```tsx
{loading && (
  <div className="flex items-center gap-2">
    <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
    <span>Loading...</span>
  </div>
)}
```

**Error State:**
```tsx
{error && (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
    <p className="text-red-600 dark:text-red-400">{error}</p>
  </div>
)}
```

**Empty State:**
```tsx
<div className="text-center py-12">
  <FileX className="w-16 h-16 mx-auto text-gray-400 mb-4" />
  <p className="text-gray-600 dark:text-gray-400">No items found</p>
</div>
```

---

## 🔄 Data Flow Example

### Example: Student Uploads Assignment

1. **User Action:** Student clicks "Upload File" in Assignment.tsx
2. **Frontend:**
   ```typescript
   const file = fileInput.files[0];
   const formData = new FormData();
   formData.append('file', file);
   formData.append('assignmentID', assignmentId);
   ```
3. **API Call:** POST /upload_submission
4. **Backend:**
   - Validates token
   - Uploads to Cloudinary
   - Saves URL to database
5. **Response:**
   ```json
   {
     "message": "File uploaded successfully",
     "submission": {
       "id": 5,
       "path": "https://res.cloudinary.com/...",
       "studentID": 3,
       "assignmentID": 1
     }
   }
   ```
6. **Frontend Updates:**
   - Shows success message
   - Displays file link
   - Hides upload button
   - Shows "Replace submission" button

---

## ✅ Testing Checklist

### After Each Phase:

**Phase 1:**
- [ ] Teacher sees list of classes
- [ ] Loading spinner shows during fetch
- [ ] Error handled if API fails
- [ ] Dark mode works

**Phase 2:**
- [ ] "Create Class" button appears
- [ ] Modal opens and closes
- [ ] Class created successfully
- [ ] New class appears in list

**Phase 3:**
- [ ] Click class → navigates to assignments
- [ ] Assignments displayed in grid
- [ ] Empty state if no assignments
- [ ] Dark mode works

**Phase 4:**
- [ ] "Create Assignment" button shows
- [ ] Form validates required fields
- [ ] Assignment created successfully
- [ ] New assignment in list

**Phase 5:**
- [ ] File input works
- [ ] Shows file name and size
- [ ] Upload progress indicator
- [ ] Success message appears
- [ ] Link opens Cloudinary URL
- [ ] Can replace submission

**Phase 6:**
- [ ] Teacher sees submissions table
- [ ] All submissions listed
- [ ] Download links work
- [ ] Empty state if no submissions

---

## 🚨 Common Issues & Solutions

### Issue: "Authorization header missing"
**Solution:** Check that getToken() returns a valid token from localStorage

### Issue: "File upload fails"
**Solution:**
- Don't set Content-Type header
- Use FormData correctly
- Check file size (<100MB)

### Issue: "CORS error"
**Solution:** Backend already allows all origins (*)

### Issue: "Dark mode not working"
**Solution:** Ensure using `dark:` classes and ThemeContext wraps App

---

## 🎯 Priority Order

**Do first (Core functionality):**
1. Phase 1: View classes
2. Phase 3: View assignments
3. Phase 5: Upload submissions

**Do second (Creation features):**
4. Phase 2: Create class
5. Phase 4: Create assignment

**Do third (Teacher features):**
6. Phase 6: View submissions

**Do later (Advanced features):**
7. Phase 7: Groups
8. Phase 8: Rubrics
9. Phase 9-11: Peer reviews

---

## 📝 Summary

**Total Pages:** 10 existing
**Pages to Modify:** 3 (Home, ClassHome, Assignment)
**Components to Create:** 4 (AssignmentCard, Modal, SubmissionUpload, SubmissionsTable)
**API Functions to Add:** 8 functions in api.ts

**Estimated Work:**
- Phase 1: 1-2 hours
- Phase 2: 1-2 hours
- Phase 3: 1-2 hours
- Phase 4: 1 hour
- Phase 5: 2-3 hours (file upload complex)
- Phase 6: 1-2 hours

**Total:** ~10-12 hours for complete assignment submission flow

---

Start with Phase 1 and work sequentially! 🚀
