import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";

import Profile from "./pages/Profile";
import CreateClass from "./pages/CreateClass";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ClassHome from "./pages/ClassHome";
import ClassMembers from "./pages/ClassMembers";
import AllStudents from "./pages/AllStudents";
import AssignmentRubric from "./pages/AssignmentRubric"; // Renamed import
import AssignmentDetail from "./pages/AssignmentDetail"; // New import
import Group from "./pages/Group";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

function AppContent() {
  const location = useLocation();
  const { isSidebarCollapsed } = useTheme();
  const showSidebar = location.pathname !== '/' && location.pathname !== '/signup';

  return (
    <div className="flex flex-row min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {showSidebar && <Sidebar />}
      <div
        className={`flex flex-col flex-1 w-full overflow-y-auto transition-all duration-300 ${
          showSidebar ? (isSidebarCollapsed ? 'ml-16' : 'ml-60') : ''
        }`}
      >
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/classes/create" element={<CreateClass />} />
            <Route path="/students" element={<AllStudents />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/classes/:id/home" element={<ClassHome />} />
            <Route path="/classes/:id/members" element={<ClassMembers />} />
            <Route path="/assignments/:id" element={<AssignmentDetail />} /> {/* Updated route */}
            <Route path="/assignments/:id/rubric" element={<AssignmentRubric />} /> {/* New route */}
            <Route path="/assignments/:id/group" element={<Group />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Toast />
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
