import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
import { API_BASE_URL } from "../../config";
import "../../styles/StudentDashboard.css"; 

const Icon = ({ path, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`icon ${className}`}
  >
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const ICONS = {
  bed: "M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2v2a1 1 0 11-2 0v-2H6v2a1 1 0 11-2 0v-2a2 2 0 01-2-2v-2a2 2 0 100-4V6z",
  food: "M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM3.707 3.293a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM2 10a8 8 0 1016 0 8 8 0 00-16 0zm10 0q0 .588-.08 1.156l.08.01a3.003 3.003 0 012.822 2.001A6.007 6.007 0 0010 4a6.007 6.007 0 00-2.822 9.167 3.003 3.003 0 012.822-2.001L10 10z", 
  alert: "M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z",
  arrow: "M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586-4.293-4.293a1 1 0 010-1.414z"
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (user) {
        try {
          const profileRes = await fetch(`${API_BASE_URL}/api/student/profile/${user.id}`);
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData?.name) setStudentName(profileData.name);
          }
        } catch (e) {
          console.error(e);
        }
      }
      try {
        const noticesRes = await fetch(`${API_BASE_URL}/api/announcements`);
        if (noticesRes.ok) {
          const notices = await noticesRes.json();
          setAnnouncements(notices.slice(0, 5));
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  const displayName = studentName || user?.email?.split("@")[0] || "Student";

  return (
    <div className="dashboard-container">
      <header className="home-header">
        <div className="header-content">
          <div className="hostel-badge">Kongu Hostel Portal</div>
          <h1>Welcome back, <span className="highlight">{displayName}</span>!</h1>
          <p>Managed by Kongu Systems. Everything looks good today.</p>
        </div>
      </header>

      <div className="status-grid">
        <div className="status-card highlight-card" onClick={() => navigate("/student/room-allocation")}>
          <div className="card-icon-bg"><Icon path={ICONS.bed} /></div>
          <div className="card-info">
            <h3>Room Allocation</h3>
            <p>Kongu Bed Booking</p>
            <span className="action-link">Book Now <Icon path={ICONS.arrow} /></span>
          </div>
        </div>

        <div className="status-card" onClick={() => navigate("/student/schedule")}>
          <div className="card-icon-bg secondary"><Icon path={ICONS.food} /></div>
          <div className="card-info">
            <h3>Mess Menu</h3>
            <p>Today's Food Plan</p>
            <span className="action-link">View Menu <Icon path={ICONS.arrow} /></span>
          </div>
        </div>

        <div className="status-card" onClick={() => navigate("/student/rules")}>
          <div className="card-icon-bg warning"><Icon path={ICONS.alert} /></div>
          <div className="card-info">
            <h3>Kongu Rules</h3>
            <p>Guidelines & Notices</p>
            <span className="action-link">Read Rules <Icon path={ICONS.arrow} /></span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
            <h2>📢 Kongu Announcements</h2>
            <button className="view-all-btn">View All</button>
        </div>

        <div className="notice-list">
          {loading ? (
             <div className="skeleton-loader">Fetching updates...</div>
          ) : announcements.length === 0 ? (
             <div className="empty-notices">No new updates from Kongu management.</div>
          ) : (
            announcements.map((notice) => (
              <div key={notice.id} className="notice-card-modern">
                <div className="notice-side-info">
                  <span className="notice-day">{new Date(notice.created_at).getDate()}</span>
                  <span className="notice-month">
                    {new Date(notice.created_at).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                  </span>
                </div>

                <div className="notice-main-content">
                  <div className="notice-header-row">
                    <span className="notice-badge">Kongu Update</span>
                    <span className="notice-timestamp">{formatDate(notice.created_at)}</span>
                  </div>
                  <strong>{notice.title}</strong>
                  <p>{notice.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}