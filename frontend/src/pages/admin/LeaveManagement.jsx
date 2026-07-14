import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase"; 
import { API_BASE_URL } from "../../config";
import "../../styles/LeaveManagement.css";

const API_URL = `${API_BASE_URL}/api/leave`;

const Icon = ({ path, className = "icon" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const ICONS = {
  refresh: "M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z",
  check: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
  x: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
  upload: "M3 17a1 1 0 011-1h12a1 1 0 011 1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z",
  pen: "M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z",
};

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminSignature, setAdminSignature] = useState(null);
  const [signatureUploading, setSignatureUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("adminSignatureUrl");
    if (saved) setAdminSignature(saved);
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setLeaves(data || []);
      setMessage("");
    } catch (error) {
      setMessage("Failed to fetch leaves from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSignatureUploading(true);
    try {
      const fileName = `admin_${Date.now()}`;
      const { error } = await supabase.storage.from("leave-signatures").upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from("leave-signatures").getPublicUrl(fileName);
      setAdminSignature(data.publicUrl);
      localStorage.setItem("adminSignatureUrl", data.publicUrl);
      setMessage("✅ Signature uploaded!");
    } catch (error) {
      setMessage("Signature upload failed.");
    } finally {
      setSignatureUploading(false);
    }
  };

  const updateLeave = async (id, status) => {
    if (status === "approved" && !adminSignature) {
      setMessage("⚠️ Upload signature first.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status,
          admin_signature_url: status === "approved" ? adminSignature : null
        })
      });

      if (!response.ok) throw new Error("Update failed");

      setMessage(`✅ Application ${status}!`);
      fetchLeaves();
      setShowModal(false);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const filteredLeaves = filter === "all" 
    ? leaves 
    : leaves.filter(l => l.status?.toLowerCase() === filter.toLowerCase());

  const stats = {
    pending: leaves.filter(l => l.status?.toLowerCase() === "pending").length,
    approved: leaves.filter(l => l.status?.toLowerCase() === "approved").length,
    rejected: leaves.filter(l => l.status?.toLowerCase() === "rejected").length
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h2>✈️ Permission Requests</h2>
          <p className="subtitle">Manage hostel stay and outing permissions.</p>
        </div>
        <button onClick={fetchLeaves} className="btn-secondary">
          <Icon path={ICONS.refresh} /> Refresh
        </button>
      </div>

      {message && <div className="status-banner-msg">{message}</div>}

      <div className="dashboard-grid">
        <div className="stats-group">
          <div className="stat-card pending">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card approved">
            <div className="stat-value">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-value">{stats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>

        <div className="content-card signature-card">
          <div className="card-header-small"><Icon path={ICONS.pen} /> Admin Signature</div>
          <div className="sig-upload-row">
            <div className="sig-preview-box">
              {adminSignature ? <img src={adminSignature} alt="Sig" /> : "No Sig"}
            </div>
            <label className="btn-primary upload-btn">
              <input type="file" accept="image/*" onChange={handleSignatureUpload} hidden />
              <Icon path={ICONS.upload} /> {signatureUploading ? "..." : "Upload"}
            </label>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="content-card table-card">
        <table className="admin-table">
          <thead>
            <tr><th>Student</th><th>Date</th><th>Reason</th><th>Status</th><th align="right">Actions</th></tr>
          </thead>
          <tbody>
            {filteredLeaves.map((l) => (
              <tr key={l.id}>
                <td><strong>{l.name}</strong><br/>{l.roll_number}</td>
                <td>{l.date_of_stay}<br/>{l.time}</td>
                <td><div className="cell-truncate">{l.reason}</div></td>
                <td><span className={`status-badge ${l.status?.toLowerCase()}`}>{l.status}</span></td>
                <td align="right">
                  <button className="btn-secondary btn-sm" onClick={() => { setSelectedLeave(l); setShowModal(true); }}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedLeave && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Details</h3>
              <button onClick={() => setShowModal(false)} className="close-btn"><Icon path={ICONS.x} /></button>
            </div>
            <div className="modal-body-grid">
              <div className="detail-section">
                <h4>Information</h4>
                <p>Name: {selectedLeave.name}</p>
                <p>Roll: {selectedLeave.roll_number}</p>
                <p>Reason: {selectedLeave.reason}</p>
              </div>
              <div className="detail-section">
                <h4>Student Signature</h4>
                {selectedLeave.student_signature_url ? <img src={selectedLeave.student_signature_url} className="sig-img" /> : "None"}
              </div>
            </div>
            <div className="modal-footer">
              {selectedLeave.status?.toLowerCase() === 'pending' && (
                <>
                  <button className="btn-danger" onClick={() => updateLeave(selectedLeave.id, "rejected")}>Reject</button>
                  <button className="btn-primary" onClick={() => updateLeave(selectedLeave.id, "approved")} disabled={!adminSignature}>Approve & Sign</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}