import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import "../../styles/AdminStyles.css"; 

const Icon = ({ path, className = "icon" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const ICONS = {
  send: "M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z",
  trash: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
};

export default function AdminAnnouncements() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/announcements`);
      if (res.ok) {
        const data = await res.json();
        setList(data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (response.ok) {
        setForm({ title: "", content: "" });
        fetchAnnouncements();
      } else {
        alert("Error posting announcement");
      }
    } catch (err) {
      alert("Error posting announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this?");
    if (!confirm) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        fetchAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h2>📢 Manage Announcements</h2>
          <p className="subtitle">Post updates for the Student Dashboard.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="content-card">
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#111827' }}>Post New Update</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Announcement Title</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Holiday Notice"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Message Details</label>
              <textarea
                className="input-area"
                rows="5"
                placeholder="Write the details here..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              <Icon path={ICONS.send} />
              {loading ? "Posting..." : "Post Announcement"}
            </button>
          </form>
        </div>

        <div className="content-card">
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#111827' }}>History</h3>
          <div className="announcement-list">
            {list.length === 0 && (
              <p className="subtitle" style={{ textAlign: "center", fontStyle: "italic" }}>
                No announcements posted yet.
              </p>
            )}

            {list.map((item) => (
              <div key={item.id} className="announcement-item">
                <div style={{ flex: 1, paddingRight: '1rem' }}>
                  <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
                    {item.title}
                  </div>
                  <p style={{ margin: 0, color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.4' }}>
                    {item.content}
                  </p>
                  <div className="announcement-meta">
                    Posted on {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <button
                  onClick={() => handleDelete(item.id)}
                  className="action-btn delete"
                  title="Delete Announcement"
                >
                  <Icon path={ICONS.trash} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}