import React, { useState } from "react";
import { API_BASE_URL } from "../../config";
import "../../styles/Feedback.css"; // ✅ Your CSS file

// --- Icons ---
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
  send: "M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z",
  check: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
};

export default function Feedback() {
  const [formData, setFormData] = useState({
    name: "",
    roll_no: "",
    department: "",
    room_no: "",
    feedback_type: "feedback",
    message: "",
    urgency: "medium",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Failed to submit feedback");

      setSubmitted(true);
      setFormData({
        name: "",
        roll_no: "",
        department: "",
        room_no: "",
        feedback_type: "feedback",
        message: "",
        urgency: "medium",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => setSubmitted(false);

  if (submitted) {
    return (
      <div className="feedback-page">
        <div className="feedback-card success-card">
          <div className="success-icon-wrapper">
            <Icon path={ICONS.check} />
          </div>
          <h2>Feedback Submitted!</h2>
          <p>Thank you for your valuable feedback. We will review it and take appropriate action.</p>
          <button className="submit-btn" onClick={resetForm}>
            Submit Another Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <div className="feedback-card">
        <div className="feedback-header">
          <h2>Student Feedback Form</h2>
          <p>Your feedback helps us improve our services and facilities.</p>
        </div>

        <form className="feedback-form" onSubmit={handleSubmit}>
          {/* Personal Details */}
          <div className="form-section-label">Personal Details</div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your full name" />
            </div>
            <div className="form-group">
              <label htmlFor="roll_no">Roll Number</label>
              <input type="text" id="roll_no" name="roll_no" value={formData.roll_no} onChange={handleChange} required placeholder="e.g., 21CSR001" />
            </div>
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input type="text" id="department" name="department" value={formData.department} onChange={handleChange} required placeholder="e.g., CSE" />
            </div>
            <div className="form-group">
              <label htmlFor="room_no">Room Number (Optional)</label>
              <input type="text" id="room_no" name="room_no" value={formData.room_no} onChange={handleChange} placeholder="e.g., 101" />
            </div>
          </div>

          <hr className="form-divider" />

          {/* Feedback Details */}
          <div className="form-section-label">Feedback Details</div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="feedback_type">Feedback Type</label>
              <select id="feedback_type" name="feedback_type" value={formData.feedback_type} onChange={handleChange} required>
                <option value="feedback">General Feedback</option>
                <option value="complaint">Complaint</option>
                <option value="suggestion">Suggestion</option>
                <option value="appreciation">Appreciation</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="urgency">Urgency Level</label>
              <select id="urgency" name="urgency" value={formData.urgency} onChange={handleChange} required>
                <option value="low">Low - Routine matter</option>
                <option value="medium">Medium - Normal priority</option>
                <option value="high">High - Needs attention</option>
                <option value="critical">Critical - Immediate action</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows="5" placeholder="Please describe your feedback, complaint, or suggestion in detail..." required />
          </div>

          <div className="form-note">
            <p><strong>Note:</strong> Your feedback will be reviewed by the appropriate department. For medical emergencies, please contact the warden immediately.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <> <span className="spinner"></span> Submitting... </> : <> Submit Feedback <Icon path={ICONS.send} /> </>}
          </button>
        </form>
      </div>
    </div>
  );
}
