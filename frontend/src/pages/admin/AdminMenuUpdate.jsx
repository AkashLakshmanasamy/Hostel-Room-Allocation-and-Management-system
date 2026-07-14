import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import "../../styles/AdminStyles.css";

const API_BASE = `${API_BASE_URL}/api/menu`;

export default function AdminMenuUpdate() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [menuData, setMenuData] = useState({
    morning: "", breakfast: "", lunch: "", evening: "", dinner: ""
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Fetch current menu when day changes
  useEffect(() => {
    fetchMenuByDay();
    // eslint-disable-next-line
  }, [selectedDay]);

  const fetchMenuByDay = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch menu list");
      const data = await res.json();
      
      const dayData = data.find(item => item.day === selectedDay);
      if (dayData) {
        setMenuData({
          morning: dayData.morning || "",
          breakfast: dayData.breakfast || "",
          lunch: dayData.lunch || "",
          evening: dayData.evening || "",
          dinner: dayData.dinner || ""
        });
      } else {
        // Reset form if no data exists for that day yet
        setMenuData({ morning: "", breakfast: "", lunch: "", evening: "", dinner: "" });
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/${selectedDay}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        body: JSON.stringify(menuData)
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("✅ Menu updated successfully!");
      } else {
        // Show the specific error from the backend
        setMessage(`❌ Error: ${result.error || "Failed to update"}`);
      }
    } catch (err) {
      console.error("Update error:", err);
      setMessage("❌ Network error: Is the backend server running?");
    } finally {
      setLoading(false);
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>🍽️ Admin Menu Manager</h2>
        <p className="subtitle">Update the weekly food schedule for students.</p>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "250px 1fr", alignItems: "start" }}>
        {/* Day Selection Sidebar */}
        <div className="content-card">
          <h3 style={{ marginBottom: '1rem' }}>Select Day</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {daysOfWeek.map(day => (
              <button 
                key={day} 
                onClick={() => setSelectedDay(day)} 
                className={`day-select-btn ${selectedDay === day ? 'active' : ''}`}
                style={{
                  width: '100%', textAlign: 'left', padding: '12px', borderRadius: '8px', cursor: 'pointer',
                  backgroundColor: selectedDay === day ? '#2c5282' : '#f3f4f6', 
                  color: selectedDay === day ? 'white' : '#4b5563', 
                  border: 'none', fontWeight: 600, transition: '0.2s'
                }}>
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Edit Form */}
        <div className="content-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center', marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0 }}>Editing: <span style={{ color: '#2c5282' }}>{selectedDay}</span></h3>
            {message && <span className="status-msg" style={{ fontWeight: 600 }}>{message}</span>}
          </div>

          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px' }}>☕ Morning (Drinks/Snacks)</label>
              <input 
                type="text" 
                value={menuData.morning} 
                onChange={(e) => setMenuData({...menuData, morning: e.target.value})} 
                className="input-field" 
                placeholder="e.g. Coffee, Milk" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>
            
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px' }}>🍳 Breakfast</label>
              <textarea 
                value={menuData.breakfast} 
                onChange={(e) => setMenuData({...menuData, breakfast: e.target.value})} 
                className="input-area" 
                rows="2" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px' }}>🍱 Lunch</label>
              <textarea 
                value={menuData.lunch} 
                onChange={(e) => setMenuData({...menuData, lunch: e.target.value})} 
                className="input-area" 
                rows="2" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px' }}>🍵 Evening (Drinks/Snacks)</label>
              <input 
                type="text" 
                value={menuData.evening} 
                onChange={(e) => setMenuData({...menuData, evening: e.target.value})} 
                className="input-field" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px' }}>🍽️ Dinner</label>
              <textarea 
                value={menuData.dinner} 
                onChange={(e) => setMenuData({...menuData, dinner: e.target.value})} 
                className="input-area" 
                rows="2" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading} 
              style={{ 
                width: "100%", marginTop: "10px", padding: '12px', 
                backgroundColor: '#2c5282', color: 'white', border: 'none', 
                borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}>
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}