import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import "../../styles/AdminSetup.css"; 

const HOSTELS = ["Hostel 1", "Hostel 2", "Hostel 3", "Hostel 4", "Hostel 5", "Hostel 6", "Hostel 7"];
const API_BASE = `${API_BASE_URL}/api/allocation`;

export default function AdminHostelSetup() {
  const [data, setData] = useState({ hostel: HOSTELS[0], rooms: 40, open: "", close: "" });
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Sessions (RETAINED)
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/configs/all`);
      const list = await res.json();
      setActiveSessions(list);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchSessions(); }, []);

  // 2. Handle Save (RETAINED)
  const handleSave = async () => {
    if (!data.open || !data.close) return alert("⚠️ Please set both times.");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostel: data.hostel,
          roomsPerFloor: data.rooms,
          openTime: data.open,
          closeTime: data.close
        })
      });
      if (res.ok) {
        alert(`✅ Configuration saved!`);
        fetchSessions(); 
      }
    } catch (err) { alert("❌ Network Error"); }
    finally { setLoading(false); }
  };

  // 3. Handle Delete (RETAINED)
  const handleDelete = async (regNo) => {
    if(!window.confirm("Are you sure you want to delete this session?")) return;
    try {
      await fetch(`${API_BASE}/config/${regNo}`, { method: "DELETE" });
      fetchSessions();
    } catch (err) { console.error(err); }
  };

  // 4. Handle Edit (RETAINED)
  const handleEdit = (session) => {
    setData({
      hostel: session.hostel,
      rooms: session.roomsPerFloor,
      open: session.openTime,
      close: session.closeTime
    });
    alert("Fields updated! Change times and click Save to update.");
  };

  return (
    <div className="admin-setup-container">
      {/* 1. Setup Form */}
      <div className="admin-setup-card">
        <div className="setup-header">
          <h2>Hostel Session Control</h2>
          <p>Configure room counts and booking window</p>
        </div>
        <div className="form-group">
          <label>Select Hostel</label>
          <select value={data.hostel} onChange={e => setData({...data, hostel: e.target.value})} className="setup-input">
            {HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Rooms Per Floor</label>
          <input type="number" value={data.rooms} onChange={e => setData({...data, rooms: e.target.value})} className="setup-input" />
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Start Time</label>
            <input type="datetime-local" value={data.open} onChange={e => setData({...data, open: e.target.value})} className="setup-input" />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input type="datetime-local" value={data.close} onChange={e => setData({...data, close: e.target.value})} className="setup-input" />
          </div>
        </div>
        <button className="activate-btn" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save/Activate Session"}
        </button>
      </div>

      {/* 2. Active Sessions Management Table - UPDATED STATUS LOGIC */}
      <div className="admin-setup-card" style={{ marginTop: "20px" }}>
        <h3>Active Sessions</h3>
        <table className="session-table">
          <thead>
            <tr>
              <th>Hostel</th>
              <th>Rooms</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeSessions.map((s, idx) => {
              // Time Comparison Logic
              const now = new Date().getTime();
              const open = new Date(s.openTime).getTime();
              const close = new Date(s.closeTime).getTime();

              let statusLabel = "";
              let statusClass = "";

              if (now < open) {
                statusLabel = "PENDING";
                statusClass = "badge-closed"; // Red/Yellow for future sessions
              } else if (now > close) {
                statusLabel = "EXPIRED";
                statusClass = "badge-closed"; // Red for past sessions
              } else {
                statusLabel = "LIVE";
                statusClass = "badge-open"; // Green for current sessions
              }

              return (
                <tr key={idx}>
                  <td>{s.hostel}</td>
                  <td>{s.roomsPerFloor}</td>
                  <td>
                    <span className={statusClass}>
                      {statusLabel}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(s)} className="edit-mini-btn">Edit</button>
                    <button onClick={() => handleDelete(s.reg_no)} className="delete-mini-btn">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}