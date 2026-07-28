import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Navbar.css"; 

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        <div className="navbar-brand" onClick={() => navigate("/student")}>
          <div className="brand-text">
            <h1>Kongu Hostels</h1>
            <span>Student Portal</span>
          </div>
        </div>

        <div className={`navbar-toggle ${isMenuOpen ? "open" : ""}`} onClick={toggleMenu}>
          <span className="bar top"></span>
          <span className="bar middle"></span>
          <span className="bar bottom"></span>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          <ul className="nav-links">
            <li><NavLink to="/student" end onClick={closeMenu}>Dashboard</NavLink></li>
            <li><NavLink to="/student/profile" onClick={closeMenu}>Profile</NavLink></li>
            <li><NavLink to="/student/room-allocation" onClick={closeMenu}>Rooms</NavLink></li>
            <li><NavLink to="/student/leave-application" onClick={closeMenu}>Leave</NavLink></li>
            <li><NavLink to="/student/feedback" onClick={closeMenu}>Feedback</NavLink></li>
            <li><NavLink to="/student/schedule" onClick={closeMenu}>Food</NavLink></li>
            <li><NavLink to="/student/rules" onClick={closeMenu}>Rules </NavLink></li>
          </ul>
          <div className="nav-user-actions">
            <span className="user-email">{user?.email}</span>
            <button onClick={handleLogout} className="logout-btn">
              <span>Logout</span>
              <LogoutIcon />
            </button>
          </div>
        </div>

      </div>
    </nav>
  );
}