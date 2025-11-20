 🎯 Goal: Build One Complete Working Feature (Assignment Submission Flow)

  This will demonstrate the entire stack working together: Authentication → Class Management → Assignment Creation → File Upload →
  View Submissions.

  ---
  📋 Phase 0: Prerequisites & Setup (Do This First)

  Setup Checklist:

  - Cloudinary account created & credentials in .env
  - Backend running on port 5008
  - Frontend running on port 5009
  - Can login with test credentials: test@test.com / 1234
  - Database has test data (ran node reset-db.js)

  ---
  🚀 Phase 1: Teacher Dashboard - View Classes

  What to Build: Teacher logs in and sees their classes on the home page.

  Backend Status:

  ✅ Already working
  - GET /classes - Returns all classes
  - Authentication working

  Frontend Tasks:

  Prompt for Gemini:
  Context: I have a React + TypeScript frontend with Tailwind CSS. The Home.tsx page needs to fetch and display classes for logged-in
  teachers.

  Current State:
  - Login works and stores token in localStorage
  - Home.tsx exists at frontend/src/pages/Home.tsx
  - API utility exists at frontend/src/util/api.ts with BASE_URL and getToken()

  Task:
  1. Update api.ts to add a getClasses() function that:
     - Calls GET /classes with Bearer token
     - Returns array of classes with {id, name, teacherID}

  2. Update Home.tsx to:
     - Call getClasses() on component mount
     - Show loading state while fetching
     - Display classes in a grid using ClassCard component
     - Handle errors gracefully
     - Only show "Create Class" button if user is a teacher

  Design: Use existing ClassCard component, dark mode support, loading spinner with Lucide icons.

  Files to modify:
  - frontend/src/util/api.ts
  - frontend/src/pages/Home.tsx

  ---
  🚀 Phase 2: Create New Class (Teacher Only)

  What to Build: Button to create a new class with a form modal.

  Backend Status:

  ✅ Already working
  - POST /create_class - Creates class with {name, teacherID}

  Frontend Tasks:

  Prompt for Gemini:
  Context: Teacher needs to create new classes from the Home page.

  Current State:
  - Home.tsx displays classes
  - Have Button and Textbox components with dark mode
  - User role (isTeacher) is stored in localStorage after login

  Task:
  1. Add createClass() function to api.ts:
     - POST /create_class with {name, teacherID}
     - teacherID comes from current user's session/profile

  2. Add to Home.tsx:
     - "Create Class" button (only show if isTeacher)
     - Modal/dialog with form (class name input)
     - On submit: call createClass(), refresh class list
     - Show success/error toast or message

  3. Create a reusable Modal component if needed:
     - Backdrop with dark overlay
     - Centered card with close button
     - Dark mode support
     - Escape key to close

  Design: Use Tailwind modal pattern, Lucide icons (Plus for add button, X for close).

  ---
  🚀 Phase 3: View Assignments for a Class

  What to Build: Click on a class card → Navigate to assignments page.

  Backend Status:

  ✅ Already working
  - GET /assignments/:courseId - Returns assignments for a class

  Frontend Tasks:

  Prompt for Gemini:
  Context: When clicking a class, show its assignments on a new page.

  Current State:
  - ClassHome.tsx exists but may need updates
  - Routing configured with React Router
  - ClassCard should link to /class/:id

  Task:
  1. Update ClassCard to:
     - Wrap in Link to /class/{classId}
     - Make entire card clickable

  2. Create/update getAssignments(courseId) in api.ts:
     - GET /assignments/:courseId
     - Returns array of {id, courseID, name, rubric}

  3. Update ClassHome.tsx:
     - Get courseId from URL params
     - Fetch and display assignments on mount
     - Show "No assignments yet" if empty
     - Display assignment cards in grid
     - Each card shows: name, due date (if added later), submission status

  4. Create AssignmentCard component:
     - Similar to ClassCard design
     - Shows assignment name
     - Click to view assignment details
     - Dark mode support

  Design: Consistent with ClassCard, use Lucide FileText icon for assignments.

  ---
  🚀 Phase 4: Create Assignment (Teacher)

  What to Build: Teacher can create assignments within a class.

  Backend Status:

  ✅ Already working
  - POST /create_assignment - Creates assignment with {courseID, name, rubric}

  Frontend Tasks:

  Prompt for Gemini:
  Context: Teacher needs to create assignments for their class.

  Current State:
  - ClassHome.tsx displays assignments
  - Have Modal, Button, Textbox components

  Task:
  1. Add createAssignment(assignment) to api.ts:
     - POST /create_assignment with {courseID, name, rubric}

  2. Update ClassHome.tsx:
     - Add "Create Assignment" button (teacher only)
     - Modal with form:
       * Assignment name (required)
       * Rubric/description (optional textarea)
     - On submit: create assignment, refresh list
     - Show success feedback

  Design: Same modal pattern as create class, larger textarea for rubric field.

  ---
  🚀 Phase 5: Upload Submission (Student) - KEY FEATURE

  What to Build: Students can upload files to assignments.

  Backend Status:

  ✅ Just implemented!
  - POST /upload_submission - Uploads to Cloudinary
  - Requires multipart/form-data with file + assignmentID

  Frontend Tasks:

  Prompt for Gemini:
  Context: Students need to submit files for assignments. Backend uses Cloudinary storage.

  Current State:
  - Assignment detail page exists or needs creation
  - File upload needs to send multipart/form-data
  - Backend expects: file (binary) + assignmentID (form field)

  Task:
  1. Create AssignmentDetail page (/assignment/:id):
     - Show assignment name, description
     - Show submission section

  2. Add uploadSubmission() to api.ts:
     - Create FormData object
     - Append file: formData.append('file', fileObject)
     - Append assignmentID: formData.append('assignmentID', id)
     - POST /upload_submission with FormData
     - Don't set Content-Type header (browser sets it automatically)
     - Include Authorization header with token

  3. Create SubmissionUpload component:
     - File input (drag & drop optional, basic file input minimum)
     - Show selected file name and size
     - Upload button
     - Progress indicator during upload
     - Success message with file URL after upload
     - Show existing submission if already uploaded
     - "Replace submission" button if exists

  4. Add getMySubmission(assignmentID) to api.ts:
     - GET /my_submission/:assignmentID
     - Handle 404 (no submission yet)

  Design:
  - Use Lucide Upload icon
  - Show file size in MB
  - Green checkmark when uploaded
  - Link to view uploaded file (opens Cloudinary URL)

  Important: Use FormData, not JSON for file upload!

  Example code structure:
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  formData.append('assignmentID', assignmentId);

  fetch(url, {
    method: 'POST',
    headers: { 'Authorization': Bearer ${token} },
    body: formData
  })


  ---
  🚀 Phase 6: View Submissions (Teacher)

  What to Build: Teacher can see all student submissions for an assignment.

  Backend Status:

  ✅ Already working
  - GET /submissions/:assignmentID - Returns all submissions with student info

  Frontend Tasks:

  Prompt for Gemini:
  Context: Teachers need to see all submissions for an assignment.

  Current State:
  - Assignment detail page exists from Phase 5
  - Different view needed for teacher vs student

  Task:
  1. Add getSubmissions(assignmentID) to api.ts:
     - GET /submissions/:assignmentID
     - Returns array with submission + student details

  2. Update AssignmentDetail page:
     - Check if user is teacher (from localStorage)
     - If teacher: show submissions table
     - If student: show upload section

  3. Create SubmissionsTable component:
     - Table with columns: Student Name, Email, Submission Date, File
     - Link to view/download file from Cloudinary
     - Show "No submissions" if empty
     - Add download button (link to Cloudinary URL)

  Design:
  - Use table with hover states
  - Lucide Download icon for file links
  - Dark mode support
  - Show file type icon based on extension

  Files to create/modify:
  - frontend/src/components/SubmissionsTable.tsx
  - frontend/src/pages/AssignmentDetail.tsx
  - frontend/src/util/api.ts

  ---
  📊 Testing Checklist

  After completing all phases, test this flow:

  As Teacher:

  - Login as test2@test.com / 1234 (teacher account)
  - See existing classes on dashboard
  - Create a new class "Test Class"
  - Click into the class
  - Create a new assignment "Test Assignment"
  - View assignment details
  - See submissions table (empty at first)

  As Student:

  - Login as test@test.com / 1234 (student account)
  - See available classes
  - Click into a class
  - Click on assignment
  - Upload a test PDF file
  - See success message with file URL
  - Verify file opens in browser (Cloudinary URL)
  - Try re-uploading (should replace)

  As Teacher Again:

  - Go back to assignment
  - See student's submission in table
  - Click file link to view/download

  ---
  🎨 Design Consistency Notes

  Tell Gemini to maintain:
  - Dark mode support on all components (dark: classes)
  - Lucide React icons throughout
  - Tailwind utility classes (no custom CSS)
  - Loading states with spinner
  - Error handling with red alerts
  - Success feedback with green messages
  - Consistent spacing (p-4, gap-4, mb-6, etc.)
  - Card design (rounded-xl, shadow-lg, border)
  - Button styles matching existing Button component
  - Responsive design (grid cols, flex wrap)

  ---
  💡 Pro Tips for Gemini Prompts

  Always include in your prompts:
  1. "Use existing components where possible"
  2. "Maintain dark mode support with dark: classes"
  3. "Add loading states and error handling"
  4. "Use Lucide React icons (already installed)"
  5. "Follow existing code patterns in the project"
  6. "Don't create new CSS files, use Tailwind only"
  7. "Add TypeScript types for all API responses"

  For debugging:
  - "Add console.log statements for debugging"
  - "Check Network tab for API responses"
  - "Verify Authorization header is included"
  - "Test with browser DevTools open"

  ---
  🎯 Success Criteria

  You know Phase 1-6 is complete when:
  ✅ Teacher can create class and assignments
  ✅ Student can upload files (stored in Cloudinary)
  ✅ Teacher can view all submissions with links
  ✅ Files open in browser from Cloudinary CDN
  ✅ All pages have dark mode
  ✅ No console errors
  ✅ Authentication works throughout

  ---
  🚀 Next Phases (After Basic Flow Works)

  Phase 7: Student groups management
  Phase 8: Rubric creation and management
  Phase 9: Peer review assignment
  Phase 10: Peer review submission
  Phase 11: View peer review results
  Phase 12: Grade aggregation and analytics

  ---
  Start with Phase 1 and work sequentially. Each phase builds on the previous one. Test thoroughly before moving to the next phase!

● How is Claude doing this session? (optional)
  1: Bad    2: Fine   3: Good   0: Dismiss