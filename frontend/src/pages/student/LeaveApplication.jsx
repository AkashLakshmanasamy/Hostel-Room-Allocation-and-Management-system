import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; 
import { API_BASE_URL as BASE_URL } from "../../config";
import "../../styles/LeaveApplication.css";

const Icon = ({ path, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`icon ${className}`}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const ICONS = {
  user: "M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z",
  calendar: "M5.25 2.25a.75.75 0 00-1.5 0v1.5h-1.5a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25h13.5a2.25 2.25 0 002.25-2.25v-10.5a2.25 2.25 0 00-2.25-2.25h-1.5v-1.5a.75.75 0 00-1.5 0v1.5h-6v-1.5z",
  phone: "M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z",
  upload: "M9.97 4.97a.75.75 0 011.06 0l3 3a.75.75 0 01-1.06 1.06l-1.72-1.72v7.94a.75.75 0 01-1.5 0v-7.94L8.97 9.03a.75.75 0 01-1.06-1.06l3-3zM3.75 12.75A.75.75 0 013 12V8.75a.75.75 0 011.5 0V12a.75.75 0 01-.75.75z",
  send: "M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z",
  check: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
  history: "M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z",
  print: "M7.25 10.25a.75.75 0 00-1.5 0v6.5a.75.75 0 00.75.75h7a.75.75 0 00.75-.75v-6.5a.75.75 0 00-1.5 0v5h-5.5v-5zM6 6.75A.75.75 0 016.75 6h6.5a.75.75 0 01.75.75v3.5a.75.75 0 01-.75.75h-6.5A.75.75 0 016 10.25v-3.5z"
};

const API_BASE_URL = `${BASE_URL}/api/leave`;

export default function LeaveApplication() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("new");
  
  const [formData, setFormData] = useState({
    name: "", rollNumber: "", branch: "", year: "", semester: "",
    hostelName: "", roomNumber: "", date: "", time: "", reason: "",
    studentMobile: "", parentMobile: "", informedAdvisor: "no",
    advisorName: "", advisorMobile: "", studentSignature: null,
  });

  const [isProfileVerified, setIsProfileVerified] = useState(null); 
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [viewTicket, setViewTicket] = useState(null);
  const studentSignatureRef = useRef(null);

  useEffect(() => {
    if (authLoading || !user) return;
    
    const fetchProfileAndVerify = async () => {
      try {
        const [profileRes, statusRes] = await Promise.all([
          fetch(`${BASE_URL}/api/student/profile/${user.id}`),
          fetch(`${BASE_URL}/api/allocation/status?email=${user.email}`)
        ]);
        
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData && profileData.name && profileData.roll_no) {
            setIsProfileVerified(true);
            const statusData = await statusRes.json();
            
            setFormData(prev => ({
              ...prev,
              name: profileData.name || "",
              rollNumber: profileData.roll_no || "",
              branch: profileData.department || "",
              year: profileData.year ? `${profileData.year} Year` : "",
              studentMobile: profileData.mobile || "",
              parentMobile: profileData.father_contact || profileData.mother_contact || "",
              hostelName: statusData?.allocation?.hostel || "",
              roomNumber: statusData?.allocation?.room_number || "",
            }));
          } else {
            setIsProfileVerified(false);
          }
        } else {
          setIsProfileVerified(false);
        }
      } catch (err) {
        setIsProfileVerified(false);
      }
    };
    fetchProfileAndVerify();
  }, [user, authLoading]);

  useEffect(() => {
    if (activeTab === 'history' && user?.email) {
      fetchHistory();
    }
  }, [activeTab, user]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email) return alert("Please log in.");
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'studentSignature') data.append(key, formData[key]);
      });
      
      if (formData.studentSignature) {
        data.append("studentSignature", formData.studentSignature);
      }
      data.append("email", user.email);
      data.append("userId", user.id);

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Submission failed");

      setSubmitted(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}?email=${user.email}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Fetch failed");
      const historyArray = Array.isArray(result) ? result : (result.history || []);
      setHistoryData(historyArray);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setActiveTab("new");
  };

  if (authLoading || isProfileVerified === null) {
    return <div className="leave-page"><div className="leave-card">Loading...</div></div>;
  }

  if (isProfileVerified === false) {
    return (
      <div className="leave-page">
        <div className="leave-card" style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>📋</div>
          <h2 style={{ color: '#ef4444', marginBottom: '10px' }}>Profile Verification Required</h2>
          <p style={{ color: '#6b7280', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 25px' }}>
            Please complete your student profile details first to submit leave applications.
          </p>
          <a href="/student/profile" className="submit-btn" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '12px 30px' }}>
            Complete Profile
          </a>
        </div>
      </div>
    );
  }

  if (viewTicket) {
    return (
      <div className="ticket-modal-backdrop">
        <div className="ticket-modal">
          <div className="ticket-header">
            <h3>HOSTEL PERMISSION PASS</h3>
            <button className="close-ticket-btn" onClick={() => setViewTicket(null)}>&times;</button>
          </div>
          <div className="ticket-content printable-area">
            <div className="ticket-row header-row">
              <div><strong>ID:</strong> #{viewTicket.id.toString().slice(-6)}</div>
              <div className={`ticket-status ${viewTicket.status?.toLowerCase()}`}>
                {viewTicket.status?.toUpperCase()} {viewTicket.status?.toLowerCase() === 'approved' ? '✅' : '⏳'}
              </div>
            </div>
            <div className="ticket-divider"></div>
            <div className="ticket-grid">
              <div><strong>Student Name:</strong> {viewTicket.name}</div>
              <div><strong>Roll Number:</strong> {viewTicket.roll_number}</div>
              <div><strong>Branch/Year:</strong> {viewTicket.branch} - {viewTicket.year} ({viewTicket.semester} Sem)</div>
            </div>
            <div className="ticket-divider"></div>
            <div className="ticket-grid">
              <div><strong>Hostel:</strong> {viewTicket.hostel_name} (Room {viewTicket.room_number})</div>
              <div><strong>Permitted Date:</strong> {viewTicket.date_of_stay}</div>
              <div><strong>Time:</strong> {viewTicket.time}</div>
            </div>
            <div className="ticket-field full"><label>Reason</label><p>{viewTicket.reason}</p></div>
            
            <div className="ticket-signatures">
              <div className="sig-block">
                <label>Student Signature</label>
                {viewTicket.student_signature_url ? (
                  <img src={viewTicket.student_signature_url} alt="Student Sig" className="sig-img-small" />
                ) : <div className="no-sig">N/A</div>}
              </div>
              <div className="sig-block">
                <label>Admin Approval</label>
                {viewTicket.status?.toLowerCase() === 'approved' ? (
                  viewTicket.admin_signature_url ? (
                    <img src={viewTicket.admin_signature_url} alt="Admin Sig" className="sig-img-small" />
                  ) : <div className="approved-sig">Digitally Verified</div>
                ) : <div className="pending-sig">Awaiting Review</div>}
              </div>
            </div>
            
            <div className="ticket-footer">
              <small>Generated: {new Date(viewTicket.created_at).toLocaleString()}</small>
            </div>
          </div>
          <div className="ticket-actions">
            <button className="print-btn" onClick={() => window.print()}>
              <Icon path={ICONS.print} /> Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leave-page">
      <div className="leave-card">
        <div className="tabs-header">
          <button className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>
            <Icon path={ICONS.send} /> New Request
          </button>
          <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <Icon path={ICONS.history} /> My History
          </button>
        </div>

        {activeTab === 'new' && (
          submitted ? (
            <div className="success-state">
              <div className="success-icon-wrapper"><Icon path={ICONS.check} /></div>
              <h2>Application Submitted!</h2>
              <p>Your request has been logged. You can track the approval status in history.</p>
              <div className="btn-group">
                <button className="submit-btn outline" onClick={() => setActiveTab('history')}>Track Status</button>
                <button className="submit-btn" onClick={resetForm}>New Request</button>
              </div>
            </div>
          ) : (
            <form className="leave-form" onSubmit={handleSubmit}>
              <div className="form-note-top">Apply for hostel stay permissions.</div>
              
              <div className="form-section-title"><Icon path={ICONS.user} className="section-icon" /> Student Details</div>
              <div className="form-grid">
                <div className="form-group full-width">
                   <label>Linked Email</label>
                   <input type="email" value={user?.email || ""} disabled className="disabled-input" />
                </div>
                <div className="form-group"><label>Name</label><input type="text" name="name" value={formData.name} readOnly disabled className="disabled-input" /></div>
                <div className="form-group"><label>Roll Number</label><input type="text" name="rollNumber" value={formData.rollNumber} readOnly disabled className="disabled-input" /></div>
                <div className="form-group"><label>Branch</label><input type="text" name="branch" value={formData.branch} readOnly disabled className="disabled-input" /></div>
                <div className="form-group"><label>Year</label><input type="text" name="year" value={formData.year} readOnly disabled className="disabled-input" /></div>
                <div className="form-group">
                  <label>Semester *</label>
                  <select name="semester" value={formData.semester} onChange={handleChange} required>
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Hostel Name</label>
                  <input type="text" name="hostelName" value={formData.hostelName || "Not Allocated"} readOnly disabled className="disabled-input" />
                </div>
                <div className="form-group"><label>Room Number</label><input type="text" name="roomNumber" value={formData.roomNumber || "Not Allocated"} readOnly disabled className="disabled-input" /></div>
              </div>

              <div className="form-divider"></div>
              <div className="form-section-title"><Icon path={ICONS.calendar} className="section-icon" /> Leave Information</div>
              <div className="form-grid">
                <div className="form-group"><label>Date of Stay *</label><input type="date" name="date" value={formData.date} onChange={handleChange} required /></div>
                <div className="form-group"><label>Time *</label><input type="time" name="time" value={formData.time} onChange={handleChange} required /></div>
              </div>
              <div className="form-group full-width"><label>Reason *</label><textarea name="reason" value={formData.reason} onChange={handleChange} rows="2" required></textarea></div>

              <div className="form-divider"></div>
              <div className="form-section-title"><Icon path={ICONS.phone} className="section-icon" /> Contact</div>
              <div className="form-grid">
                <div className="form-group"><label>Student Mobile</label><input type="tel" name="studentMobile" value={formData.studentMobile} readOnly disabled className="disabled-input" /></div>
                <div className="form-group"><label>Parent Mobile</label><input type="tel" name="parentMobile" value={formData.parentMobile} readOnly disabled className="disabled-input" /></div>
              </div>

              <div className="form-divider"></div>
              <div className="form-group full-width">
                <label>Student Signature (Image) *</label>
                <label className="file-upload-label">
                  <input type="file" name="studentSignature" onChange={handleChange} accept="image/*" required ref={studentSignatureRef} className="hidden-file-input" />
                  <span className="file-upload-button"><Icon path={ICONS.upload} /> Choose File</span>
                  <span className="file-name-display">{formData.studentSignature ? formData.studentSignature.name : "No file chosen"}</span>
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>{loading ? "Submitting..." : "Submit Application"}</button>
            </form>
          )
        )}

        {activeTab === 'history' && (
          <div className="history-container">
            {historyLoading ? (
               <div className="loading-spinner">Fetching history...</div>
            ) : historyData.length === 0 ? (
               <div className="empty-history"><p>No records found for {user?.email}.</p></div>
            ) : (
              <div className="history-list">
                {historyData.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="h-left">
                       <div className="h-date">{item.date_of_stay}</div>
                       <div className="h-reason">{item.reason}</div>
                    </div>
                    <div className="h-right">
                       <span className={`status-badge ${item.status?.toLowerCase()}`}>{item.status}</span>
                       <button className="view-ticket-btn" onClick={() => setViewTicket(item)}>View</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}