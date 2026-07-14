import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import "../../styles/Rules.css";

export default function Rules() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/rules`)
      .then(res => res.json())
      .then(res => {
        setData({
          general_rules: res.general_rules || [],
          mess_timings: res.mess_timings || {},
          gate_timings: res.gate_timings || {},
          consequences: res.consequences || []
        });
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-container">Gathering hostel information...</div>;

  return (
    <div className="rules-page">
      <div className="rules-card">
        {/* Professional Header */}
        <header className="rules-header">
          <h2>Hostel Regulations</h2>
          <p>Official guidelines for residents • 2025-26</p>
        </header>

        <div className="rules-body">
          {/* Section: General Conduct */}
          <section className="rules-section">
            <h3 className="section-title">General Conduct</h3>
            <div className="rules-list">
              {data.general_rules.map((r, i) => (
                <div key={i} className="rule-item">
                  <div className="rule-number">{i + 1}</div>
                  <p className="rule-text">{r}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Timings */}
          <div className="grid-2-col">
            <section className="rules-section">
              <h3 className="section-title">Mess Timings</h3>
              <div className="timing-table">
                {Object.entries(data.mess_timings).map(([k, v]) => (
                  <div key={k} className="timing-row">
                    <span className="capitalize">{k}</span>
                    <span className="time-badge">{v || "N/A"}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rules-section">
              <h3 className="section-title">Gate Timings</h3>
              <div className="timing-table">
                <div className="timing-row">
                  <span>Opening</span>
                  <span className="time-badge">{data.gate_timings.opening || "N/A"}</span>
                </div>
                <div className="timing-row">
                  <span>Curfew</span>
                  <span className="time-badge">{data.gate_timings.curfew_regular || "N/A"}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Section: Disciplinary Policy */}
          <section className="rules-section no-border">
            <h3 className="section-title">Disciplinary Policy</h3>
            <div className="consequences-grid">
              {data.consequences.map((c, i) => (
                <div key={i} className="consequence-item level-2">
                  <h4>{c.violation}</h4>
                  <p><strong>Action:</strong> {c.action}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}