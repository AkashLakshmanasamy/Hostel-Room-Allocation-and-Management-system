import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/login"; 
import Signup from "../pages/auth/Signup";
import { useAuth } from "../context/AuthContext";
import StudentLayout from "../pages/student/StudentLayout"; 
import AdminDashboard from "../pages/admin/AdminDashboard"; 
import StudentDashboard from "../pages/student/StudentDashboard";
import RoomAllocation from "../pages/student/RoomAllocation";
import LeaveApplication from "../pages/student/LeaveApplication";
import Feedback from "../pages/student/Feedback";
import StudentProfile from "../pages/student/StudentProfile";
import Schedule from "../pages/student/Schedule"; 
import Rules from "../pages/student/Rules";
import RoomRequests from "../pages/admin/RoomRequests"; 
import VacantRooms from "../pages/admin/VacantRooms";
import AdminMenuUpdate from "../pages/admin/AdminMenuUpdate"; 
import AdminRulesUpdate from "../pages/admin/AdminRulesUpdate"; 
import AdminAnnouncements from "../pages/admin/AdminAnnouncements";
import LeaveManagement from "../pages/admin/LeaveManagement";
import FeedbackManagement from "../pages/admin/FeedbackManagement";
import StudentRecords from "../pages/admin/StudentRecords";
import AdminHostelSetup from "../pages/admin/AdminHostelSetup"; 

function HomeRedirect() {
  const { role, loading, isAuthenticated } = useAuth();
  if (loading) return <div className="loading-screen">Verifying Session...</div>;
  if (isAuthenticated) {
    if (role === "admin") return <Navigate to="/admin" />;
    return <Navigate to="/student" />;
  }
  return <Navigate to="/login" />;
}

function ProtectedRoute({ role, children }) {
  const { isAuthenticated, role: userRole, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && role !== userRole) return <Navigate to="/login" />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/student" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="room-allocation" element={<RoomAllocation />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="leave-application" element={<LeaveApplication />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="rules" element={<Rules />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}>
        <Route index element={<RoomRequests />} /> 
        <Route path="students" element={<StudentRecords />} />
        <Route path="feedback" element={<FeedbackManagement />} />
        <Route path="leave" element={<LeaveManagement />} />
        <Route path="vacant" element={<VacantRooms />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="update-menu" element={<AdminMenuUpdate />} />
        <Route path="update-rules" element={<AdminRulesUpdate />} />
        <Route path="setup" element={<AdminHostelSetup />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}