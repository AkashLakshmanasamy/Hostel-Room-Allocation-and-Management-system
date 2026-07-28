import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import "../../styles/StudentRecords.css"; 

const Icon = ({ path, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`icon ${className}`}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const ICONS = {
  search: "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z",
  eye: "M10 12a2 2 0 100-4 2 2 0 000 4z M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10z",
  trash: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z",
  close: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
  download: "M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
};

export default function StudentRecords() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null); 

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/student`);
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data || []);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete");
      setStudents(students.filter(s => s.id !== id));
      if (selectedStudent?.id === id) setSelectedStudent(null);
    } catch (err) {
      alert("Error deleting record.");
    }
  };

  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roll_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="records-page">
      <div className="records-header">
        <div>
          <h2>Student Records</h2>
          <p className="subtitle">{students.length} Registered Students</p>
        </div>
        <div className="search-box">
          <Icon path={ICONS.search} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search Name, Roll No..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll No / Dept</th>
              <th>Room Info</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center">Loading data...</td></tr>
            ) : filteredStudents.length === 0 ? (
              <tr><td colSpan="6" className="text-center">No records found.</td></tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="student-cell">
                    <img src={student.passport_photo_url || "https://via.placeholder.com/40"} alt="" className="avatar" />
                    <span className="fw-bold">{student.name}</span>
                  </td>
                  <td>
                    <div className="text-dark">{student.roll_no}</div>
                    <div className="text-muted text-small">{student.department} ({student.year})</div>
                  </td>
                  <td>
                    <div className="text-dark">Room {student.room_no}</div>
                    <div className="text-muted text-small">{student.floor} Floor</div>
                  </td>
                  <td>
                    <div>{student.mobile}</div>
                    <div className="text-muted text-small">{student.email}</div>
                  </td>
                  <td>
                    <span className={`badge ${student.fee_mode ? 'success' : 'pending'}`}>
                      {student.fee_mode ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn-icon view" onClick={() => setSelectedStudent(student)} title="View Details">
                        <Icon path={ICONS.eye} />
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDelete(student.id)} title="Delete">
                        <Icon path={ICONS.trash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Profile</h3>
              <button className="close-btn" onClick={() => setSelectedStudent(null)}>
                <Icon path={ICONS.close} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="modal-top">
                <div className="modal-img-wrapper">
                  <img src={selectedStudent.passport_photo_url} alt="Student" />
                </div>
                <div className="modal-main-info">
                  <h2>{selectedStudent.name}</h2>
                  <p className="meta">{selectedStudent.roll_no} | {selectedStudent.department} | {selectedStudent.year} Year</p>
                  <div className="tag-row">
                    <span className="tag">{selectedStudent.blood_group}</span>
                    <span className="tag">{selectedStudent.admission_mode}</span>
                    <span className="tag">Section {selectedStudent.section}</span>
                  </div>
                </div>
              </div>

              <div className="divider"></div>

              <div className="info-grid-container">
                <div className="info-column">
                  <h4>Personal & Hostel</h4>
                  <InfoRow label="DOB" value={selectedStudent.dob} />
                  <InfoRow label="Email" value={selectedStudent.email} />
                  <InfoRow label="Mobile" value={selectedStudent.mobile} />
                  <InfoRow label="WhatsApp" value={selectedStudent.whatsapp} />
                  <InfoRow label="Room" value={`${selectedStudent.room_no} (${selectedStudent.floor})`} />
                  <InfoRow label="Fee Mode" value={selectedStudent.fee_mode} />
                </div>

                <div className="info-column">
                  <h4>Parent & Address</h4>
                  <InfoRow label="Father" value={selectedStudent.father_name} />
                  <InfoRow label="Father No" value={selectedStudent.father_contact} />
                  <InfoRow label="Mother" value={selectedStudent.mother_name} />
                  <InfoRow label="Mother No" value={selectedStudent.mother_contact} />
                  <InfoRow label="Address" value={selectedStudent.address} />
                  <InfoRow label="District" value={selectedStudent.district} />
                </div>
              </div>

              <div className="divider"></div>

              <h4>Uploaded Documents</h4>
              <div className="docs-row">
                <DocCard label="Passport Photo" url={selectedStudent.passport_photo_url} />
                <DocCard label="ID Card Proof" url={selectedStudent.id_card_photo_url} />
                <DocCard label="Fees Receipt" url={selectedStudent.fees_receipt_url} />
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const InfoRow = ({ label, value }) => (
  <div className="info-row">
    <span className="label">{label}:</span> <span className="value">{value || "-"}</span>
  </div>
);

const DocCard = ({ label, url }) => (
  <div className="doc-card">
    <span>{label}</span>
    {url ? (
      <a href={url} target="_blank" rel="noreferrer" className="doc-link">
        View Document <Icon path={ICONS.download} className="small-icon" />
      </a>
    ) : <span className="no-doc">Not Uploaded</span>}
  </div>
);