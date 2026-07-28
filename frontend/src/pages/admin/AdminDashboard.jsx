import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom"; 
import { useAuth } from "../../context/AuthContext";
import "../../styles/AdminDashboard.css"; 

const Icon = ({ path }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
    <path d={path} />
  </svg>
);

const ICONS = {
  roomRequests: "M4 4h5v5H4V4zm7 0h5v5h-5V4zM4 11h5v5H4v-5zm7 0h5v5h-5v-5z",
  studentProfiles: "M15 8a3 3 0 10-6 0 3 3 0 006 0zM3 16a6 6 0 1112 0H3z",
  feedback: "M2 5a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H7l-4 3v-3H4a2 2 0 01-2-2V5z",
  leaveApplications: "M6 2h8v2H6V2zm0 4h8v12H6V6z",
  vacantRooms: "M10 2a8 8 0 100 16 8 8 0 000-16z",
  setup: "M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth(); 

  const handleLogout = () => {
    logout(); 
    navigate("/login", { replace: true });
  };

  const SidebarLink = ({ to, icon, label }) => (
    <NavLink 
      to={to} 
      end={to === "/admin"} 
      className={({ isActive }) => `admin-sidebar-link ${isActive ? "active" : ""}`}
    >
      <Icon path={icon} />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Kongu Hostels</h2>
        </div>

        <nav className="admin-sidebar-nav">
          <SidebarLink to="/admin" icon={ICONS.roomRequests} label="Room Requests" />
          <SidebarLink to="/admin/setup" icon={ICONS.setup} label="Session Setup" />
          <SidebarLink to="/admin/students" icon={ICONS.studentProfiles} label="Student Profiles" />
          <SidebarLink to="/admin/feedback" icon={ICONS.feedback} label="Feedback" />
          <SidebarLink to="/admin/leave" icon={ICONS.leaveApplications} label="Leave Applications" />
          <SidebarLink to="/admin/vacant" icon={ICONS.vacantRooms} label="Vacant Rooms" />
          <SidebarLink to="/admin/announcements" icon={ICONS.vacantRooms} label="Announcements" />
          <SidebarLink to="/admin/update-menu" icon={ICONS.vacantRooms} label="Food Menu" />
          <SidebarLink to="/admin/update-rules" icon={ICONS.vacantRooms} label="Hostel Rules" />
        </nav>
        
        <div style={{ marginTop: "auto", padding: "1rem" }}>
             <button onClick={handleLogout} className="admin-sidebar-link" style={{color: '#ff6b6b', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer'}}>
                <Icon path="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" />
                <span style={{marginLeft: '10px'}}>Logout</span>
             </button>
        </div>
      </aside>

      <div className="admin-content-wrapper">
        <header className="admin-content-header">
          <h1>Admin Dashboard</h1>
        </header>

        <main className="admin-tab-content">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}