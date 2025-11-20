# Student Management API Guide

## Overview

Two approaches to add students to classes:
1. **CSV Import** (Legacy) - Upload CSV file with student data
2. **Select & Add** (New & Better) - Browse students and select to add

---

## 🆕 New Approach: Select & Add Students

### Flow:
1. Teacher views class members page
2. Clicks "Add Students" button
3. Sees list of available students (not yet in class)
4. Selects students with checkboxes
5. Clicks "Add Selected" button
6. Students are enrolled in class

---

## API Endpoints

### 1. Get All Students
**GET** `/students`

Returns all students in the system (not teachers).

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  {
    "id": 3,
    "name": "Alice Smith",
    "email": "alice@example.com"
  }
]
```

---

### 2. Get Available Students for Class
**GET** `/students/available/:courseId`

Returns students NOT yet enrolled in this class.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 5,
    "name": "Bob Wilson",
    "email": "bob@example.com"
  },
  {
    "id": 7,
    "name": "Sarah Johnson",
    "email": "sarah@example.com"
  }
]
```

---

### 3. Get Enrolled Students
**GET** `/students/enrolled/:courseId`

Returns students already enrolled in this class.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
]
```

---

### 4. Add Students to Class
**POST** `/add_students_to_class`

Add multiple students to a class at once.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "courseId": 1,
  "studentIds": [5, 7, 9]
}
```

**Response:**
```json
{
  "message": "Successfully added 3 student(s) to course",
  "addedCount": 3,
  "alreadyEnrolledCount": 0,
  "addedStudents": [5, 7, 9],
  "alreadyEnrolled": []
}
```

**Notes:**
- Automatically skips students already enrolled
- Returns separate counts for added vs already enrolled
- Validates all student IDs exist and are not teachers

---

### 5. Remove Students from Class
**POST** `/remove_students_from_class`

Remove multiple students from a class.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "courseId": 1,
  "studentIds": [5, 7]
}
```

**Response:**
```json
{
  "message": "Successfully removed 2 student(s) from course",
  "removedCount": 2
}
```

---

## 🗂️ Legacy: CSV Import (Still Available)

**POST** `/student_import`

**Body:**
```json
{
  "courseID": 1,
  "students": "id,name,email,password\n1,John,john@test.com,pass123\n2,Jane,jane@test.com,pass456"
}
```

**CSV Format:**
```csv
id,name,email,password
1,John Doe,john@example.com,mypassword
2,Jane Smith,jane@example.com,herpassword
```

**Notes:**
- Password is optional (defaults to env variable DEFAULT_STUDENT_PASSWORD)
- Creates user accounts if they don't exist
- Adds them to the course

---

## Frontend Implementation Guide

### ClassMembers Page UI

```
┌─────────────────────────────────────────────┐
│  Class Members                              │
├─────────────────────────────────────────────┤
│                                             │
│  Enrolled Students (5)    [+ Add Students] │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ☑ John Doe (john@example.com)      │   │
│  │ ☑ Alice Smith (alice@example.com)  │   │
│  │ ☑ Bob Wilson (bob@example.com)     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Remove Selected]                          │
└─────────────────────────────────────────────┘
```

### Add Students Modal

```
┌─────────────────────────────────────────────┐
│  Add Students to Class              [X]     │
├─────────────────────────────────────────────┤
│                                             │
│  Available Students:                        │
│                                             │
│  □ Sarah Johnson (sarah@example.com)        │
│  □ Mike Brown (mike@example.com)            │
│  □ Lisa Davis (lisa@example.com)            │
│  □ Tom Wilson (tom@example.com)             │
│                                             │
│  [Cancel]  [Add Selected (2)]               │
└─────────────────────────────────────────────┘
```

---

## Frontend Code Examples

### Fetch Available Students

```typescript
// api.ts
export const getAvailableStudents = async (courseId: string) => {
  const resp = await fetch(
    `${BASE_URL}/students/available/${courseId}`,
    {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    }
  );
  return await resp.json();
}

export const getEnrolledStudents = async (courseId: string) => {
  const resp = await fetch(
    `${BASE_URL}/students/enrolled/${courseId}`,
    {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    }
  );
  return await resp.json();
}
```

### Add Students

```typescript
// api.ts
export const addStudentsToClass = async (
  courseId: number,
  studentIds: number[]
) => {
  const resp = await fetch(`${BASE_URL}/add_students_to_class`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ courseId, studentIds })
  });
  return await resp.json();
}
```

### ClassMembers Component Example

```typescript
// ClassMembers.tsx
const [enrolledStudents, setEnrolledStudents] = useState([]);
const [availableStudents, setAvailableStudents] = useState([]);
const [selectedIds, setSelectedIds] = useState<number[]>([]);
const [showModal, setShowModal] = useState(false);

// Fetch enrolled students
useEffect(() => {
  const fetchData = async () => {
    const enrolled = await getEnrolledStudents(courseId);
    setEnrolledStudents(enrolled);
  };
  fetchData();
}, [courseId]);

// Open add students modal
const handleAddStudents = async () => {
  const available = await getAvailableStudents(courseId);
  setAvailableStudents(available);
  setShowModal(true);
};

// Add selected students
const handleAddSelected = async () => {
  await addStudentsToClass(courseId, selectedIds);
  setShowModal(false);
  // Refresh enrolled list
  const enrolled = await getEnrolledStudents(courseId);
  setEnrolledStudents(enrolled);
};
```

---

## Comparison: CSV vs Select

### CSV Import
✅ Bulk import many students
✅ Create new accounts automatically
❌ Requires CSV file preparation
❌ Less user-friendly
❌ Can't see who's being added

### Select & Add (Recommended)
✅ Visual selection interface
✅ See available students
✅ Select specific students
✅ No file upload needed
✅ Better UX
✅ Can remove students easily
❌ Doesn't create new accounts (must exist in system)

---

## Recommended Implementation Order

**Phase 1: View Members**
1. Show enrolled students list
2. GET /students/enrolled/:courseId

**Phase 2: Add Students**
1. "Add Students" button
2. Modal with available students
3. Checkbox selection
4. POST /add_students_to_class

**Phase 3: Remove Students**
1. Select enrolled students
2. "Remove Selected" button
3. POST /remove_students_from_class

**Phase 4 (Optional): CSV Import**
1. "Import from CSV" button
2. File upload
3. POST /student_import

---

## Testing with cURL

```bash
# Get all students
curl http://localhost:5008/students \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get available students for class 1
curl http://localhost:5008/students/available/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Add students to class
curl -X POST http://localhost:5008/add_students_to_class \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseId": 1, "studentIds": [3, 5, 7]}'

# Remove students from class
curl -X POST http://localhost:5008/remove_students_from_class \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseId": 1, "studentIds": [5]}'
```

---

## Summary

**New Endpoints Added:**
- ✅ GET /students - List all students
- ✅ GET /students/available/:courseId - Students not in class
- ✅ GET /students/enrolled/:courseId - Students in class
- ✅ POST /add_students_to_class - Add students
- ✅ POST /remove_students_from_class - Remove students

**Use Cases:**
- Teacher wants to add students to class ➡️ Use Select & Add approach
- Bulk import from registrar data ➡️ Use CSV import
- View class roster ➡️ Use GET enrolled students

Much better than CSV-only approach! 🎉
