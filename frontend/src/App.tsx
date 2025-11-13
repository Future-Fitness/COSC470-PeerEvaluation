import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Sidebar from "./components/Sidebar";

import "./App.css";
import Profile from "./pages/Profile";
import CreateClass from "./pages/CreateClass";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ClassHome from "./pages/ClassHome";
import ClassMembers from "./pages/ClassMembers";
import Assignment from "./pages/Assignment";
import Group from "./pages/Group";
import ProtectedRoute from "./components/ProtectedRoute";

function AppContent() {
  const location = useLocation();
  const showSidebar = location.pathname !== '/' && location.pathname !== '/signup';

  return (
    <div className="App">
      {showSidebar && <Sidebar />}
      <div className="inner">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/classes/create" element={<CreateClass />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/classes/:id/home" element={<ClassHome />} />
            <Route path="/classes/:id/members" element={<ClassMembers />} />
            <Route path="/assignments/:id" element={<Assignment />} />
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
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
