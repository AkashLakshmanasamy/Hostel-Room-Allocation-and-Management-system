import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import "../../styles/AdminStyles.css";

export default function AdminRulesUpdate() {
  const [rules, setRules] = useState({
    general_rules: [],
    mess_timings: { breakfast: "", lunch: "", snacks: "", dinner: "" },
    gate_timings: { opening: "", curfew_regular: "" },
    consequences: []
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => { fetchRules(); }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rules`);
      const data = await res.json();
      if (data) {
        setRules({
          ...data,
          general_rules: data.general_rules || [],
          consequences: data.consequences || []
        });
      }
    } catch (err) { console.error("Load failed", err); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setMessage("⏳ Saving changes...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rules)
      });
      if (res.ok) setMessage("✅ Success: Rules updated.");
      else setMessage("❌ Error: Could not save.");
    } catch (err) { setMessage("❌ Connection failed."); }
    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) return <div className="admin-loader">Loading Management Portal...</div>;

  return (
    <div className="admin-wrapper">
      <header className="admin-header-main">
        <div>
          <h1>Rules Management</h1>
          <p>Update hostel guidelines and operational timings</p>
        </div>
        <button className="save-action-btn" onClick={handleSave}>
          Save All Changes
        </button>
      </header>

      {message && (
        <div className={`status-toast ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <main className="admin-grid-layout">
        {/* Card: General Rules */}
        <section className="admin-card-pro">
          <div className="card-header">
            <h3>General Guidelines</h3>
            <span>Press Enter for new rule</span>
          </div>
          <textarea 
            className="pro-textarea"
            placeholder="Type rules here..."
            value={rules.general_rules?.join("\n") || ""} 
            onChange={e => setRules({...rules, general_rules: e.target.value.split("\n")})}
          />
        </section>

        {/* Card: Timings */}
        <section className="admin-card-pro">
          <div className="card-header">
            <h3>Operational Hours</h3>
          </div>
          <div className="pro-input-group">
            {Object.keys(rules.mess_timings).map(key => (
              <div key={key} className="pro-field">
                <label>{key}</label>
                <input 
                  type="text"
                  value={rules.mess_timings[key] || ""} 
                  onChange={e => setRules({...rules, mess_timings: {...rules.mess_timings, [key]: e.target.value}})} 
                />
              </div>
            ))}
          </div>
        </section>

        {/* Card: Consequences */}
        <section className="admin-card-pro full-span">
          <div className="card-header">
            <h3>Disciplinary Actions</h3>
            <button className="add-row-btn" onClick={() => setRules({...rules, consequences: [...rules.consequences, {violation: "", action: ""}]})}>
              + Add New Row
            </button>
          </div>
          <div className="consequence-table">
            <div className="table-head">
              <div>Violation Type</div>
              <div>Corrective Action</div>
              <div></div>
            </div>
            {rules.consequences?.map((c, i) => (
              <div key={i} className="table-row">
                <input placeholder="Ex: Late Entry" value={c.violation || ""} onChange={e => {
                  const updated = [...rules.consequences];
                  updated[i].violation = e.target.value;
                  setRules({...rules, consequences: updated});
                }} />
                <input placeholder="Ex: Parent Notification" value={c.action || ""} onChange={e => {
                  const updated = [...rules.consequences];
                  updated[i].action = e.target.value;
                  setRules({...rules, consequences: updated});
                }} />
                <button className="row-del-btn" onClick={() => setRules({...rules, consequences: rules.consequences.filter((_, idx) => idx !== i)})}>&times;</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}