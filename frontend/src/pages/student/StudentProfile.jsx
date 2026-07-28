import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL as BASE_URL } from "../../config";
import "../../styles/StudentProfile.css";

const Icon = ({ path, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`icon ${className}`}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const ICONS = {
  user: "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z",
  contact: "M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z",
  family: "M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z",
  academic: "M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z",
  image: "M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z",
  edit: "M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
};

const DEPARTMENTS = ["Computer Science and Design", "Computer Science", "Information Technology", "Mechanical Engineering", "Civil Engineering", "Electronics and Communication", "Electrical Engineering", "Automobile Engineering", "Food Technology"];
const YEARS = ["I", "II", "III", "IV"];
const SECTIONS = ["A", "B", "C", "D"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const ADMISSION_MODES = ["Regular", "Lateral"];

const API_BASE_URL = `${BASE_URL}/api/student`;
const ALLOCATION_API_URL = `${BASE_URL}/api/allocation`;

export default function StudentProfile() {
  const { user, loading } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [hasData, setHasData] = useState(false);

  const [form, setForm] = useState({
    floor: "", roomNo: "", department: "", rollNo: "", name: "", year: "", section: "",
    mobile: "", whatsapp: "", email: "", bloodGroup: "", fatherName: "", fatherContact: "",
    fatherOccupation: "", motherName: "", motherContact: "", motherOccupation: "",
    dob: "", address: "", district: "", admissionMode: "", feeMode: "",
  });

  const [passportPhoto, setPassportPhoto] = useState(null);
  const [idCardPhoto, setIdCardPhoto] = useState(null);
  const [feesReceipt, setFeesReceipt] = useState(null);
  const [passportPreview, setPassportPreview] = useState("");
  const [idCardPreview, setIdCardPreview] = useState("");
  const [feesPreview, setFeesPreview] = useState("");

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (loading || !user) return;
    setForm(prev => ({ ...prev, email: user.email }));

    const fetchAllData = async () => {
      try {
        const [profileRes, statusRes] = await Promise.all([
          fetch(`${API_BASE_URL}/profile/${user.id}`),
          fetch(`${ALLOCATION_API_URL}/status?email=${user.email}`)
        ]);

        const profileData = await profileRes.json();
        const statusData = await statusRes.json();

        if (profileRes.ok && profileData && Object.keys(profileData).length > 0) {
          setHasData(true);
          setIsEditing(false);
          setForm(prev => ({
            ...prev,
            ...profileData,
            rollNo: profileData.roll_no || "",
            bloodGroup: profileData.blood_group || "",
            admissionMode: profileData.admission_mode || "",
            fatherName: profileData.father_name || "",
            fatherContact: profileData.father_contact || "",
            fatherOccupation: profileData.father_occupation || "",
            motherName: profileData.mother_name || "",
            motherContact: profileData.mother_contact || "",
            motherOccupation: profileData.mother_occupation || "",
            roomNo: profileData.room_no || "",
            feeMode: profileData.fee_mode || "",
            email: user.email,
          }));
          
          if (profileData.passport_photo_url) setPassportPreview(profileData.passport_photo_url);
          if (profileData.id_card_photo_url) setIdCardPreview(profileData.id_card_photo_url);
          if (profileData.fees_receipt_url) setFeesPreview(profileData.fees_receipt_url);
        } else {
          setIsEditing(true);
        }

        if (statusRes.ok && statusData?.allocation?.status === "approved") {
          setForm(prev => ({
            ...prev,
            floor: statusData.allocation.floor,
            roomNo: statusData.allocation.room_number
          }));
        }

      } catch (err) {
        console.error(err.message);
      }
    };
    fetchAllData();
  }, [user, loading]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "feeMode" && value === "Unpaid") {
        setFeesReceipt(null);
        setFeesPreview("");
      }
      return updated;
    });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (setter, setPreview) => (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setter(file);
    const reader = new FileReader();
    reader.onload = () => { setPreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "department", "rollNo", "name", "year", "section",
      "mobile", "whatsapp", "bloodGroup", "fatherName", "fatherContact",
      "motherName", "motherContact", "dob", "address", "district",
      "admissionMode"
    ];
    requiredFields.forEach(f => { if (!form[f]?.toString().trim()) newErrors[f] = "Required"; });
    if (!passportPhoto && !passportPreview) newErrors.passportPhoto = "Passport photo is required";
    if (form.feeMode === "Paid" && !feesReceipt && !feesPreview) {
      newErrors.feesReceipt = "Fees receipt is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      if (passportPhoto) formData.append("passportPhoto", passportPhoto);
      if (idCardPhoto) formData.append("idCardPhoto", idCardPhoto);
      if (feesReceipt) formData.append("feesReceipt", feesReceipt);

      const response = await fetch(`${API_BASE_URL}/update`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Profile update failed. Please try again.");
      }

      setSuccessMessage("✅ Profile updated successfully!");
      setHasData(true);
      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrorMessage("❌ " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading-container">Loading...</div>;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Student Profile</h2>
            <p>{isEditing ? "Complete all required fields." : "Your registered details."}</p>
          </div>
          {hasData && !isEditing && (
            <button type="button" className="edit-btn" onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              <Icon path={ICONS.edit} /> Edit Profile
            </button>
          )}
        </div>

        {successMessage && <div className="alert success">{successMessage}</div>}
        {errorMessage && <div className="alert error">{errorMessage}</div>}

        <form className={`profile-form ${!isEditing ? 'readonly-mode' : ''}`} onSubmit={handleSubmit}>
          
          <div className="form-section-title">
            <Icon path={ICONS.user} className="section-icon" /> Personal Information
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="name" value={form.name} onChange={onChange} disabled={!isEditing} className={errors.name ? 'error' : ''} />
            </div>
            <div className="form-group">
              <label>Roll Number *</label>
              <input type="text" name="rollNo" value={form.rollNo} onChange={onChange} disabled={!isEditing} className={errors.rollNo ? 'error' : ''} />
            </div>
            <div className="form-group">
              <label>Date of Birth *</label>
              <input type="date" name="dob" value={form.dob} onChange={onChange} disabled={!isEditing} className={errors.dob ? 'error' : ''} />
            </div>
            <div className="form-group">
              <label>Blood Group *</label>
              <select name="bloodGroup" value={form.bloodGroup} onChange={onChange} disabled={!isEditing}>
                <option value="">Select Group</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="form-group full-width">
              <label>Email (Locked)</label>
              <input type="email" value={form.email} readOnly disabled style={{ backgroundColor: "#f3f4f6" }} />
            </div>
          </div>

          <div className="form-divider"></div>

          <div className="form-section-title">
            <Icon path={ICONS.academic} className="section-icon" /> Academic Details
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Department *</label>
              <select name="department" value={form.department} onChange={onChange} disabled={!isEditing}>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Year *</label>
              <select name="year" value={form.year} onChange={onChange} disabled={!isEditing}>
                <option value="">Select Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Section *</label>
              <select name="section" value={form.section} onChange={onChange} disabled={!isEditing}>
                <option value="">Select Section</option>
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Admission Mode *</label>
              <select name="admissionMode" value={form.admissionMode} onChange={onChange} disabled={!isEditing}>
                <option value="">Select Mode</option>
                {ADMISSION_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="form-divider"></div>

          <div className="form-section-title">
            <Icon path={ICONS.contact} className="section-icon" /> Contact & Parent Info
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Student Mobile *</label>
              <input type="tel" name="mobile" value={form.mobile} onChange={onChange} disabled={!isEditing} />
            </div>
            <div className="form-group">
              <label>WhatsApp *</label>
              <input type="tel" name="whatsapp" value={form.whatsapp} onChange={onChange} disabled={!isEditing} />
            </div>
            <div className="form-group">
              <label>Father's Name *</label>
              <input type="text" name="fatherName" value={form.fatherName} onChange={onChange} disabled={!isEditing} />
            </div>
            <div className="form-group">
              <label>Father's Contact *</label>
              <input type="tel" name="fatherContact" value={form.fatherContact} onChange={onChange} disabled={!isEditing} />
            </div>
            <div className="form-group">
              <label>Mother's Name *</label>
              <input type="text" name="motherName" value={form.motherName} onChange={onChange} disabled={!isEditing} />
            </div>
            <div className="form-group">
              <label>Mother's Contact *</label>
              <input type="tel" name="motherContact" value={form.motherContact} onChange={onChange} disabled={!isEditing} />
            </div>
          </div>
          <div className="form-group full-width" style={{ marginTop: "1rem" }}>
            <label>Permanent Address *</label>
            <textarea name="address" value={form.address} onChange={onChange} disabled={!isEditing} rows="3"></textarea>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>District *</label>
              <input type="text" name="district" value={form.district} onChange={onChange} disabled={!isEditing} />
            </div>
          </div>

          <div className="form-divider"></div>

          <div className="form-section-title">
            <Icon path={ICONS.family} className="section-icon" /> Fees Payment Status
          </div>
          <div className="form-group">
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Have you paid your hostel fees? *</label>
            <div style={{ display: "flex", gap: "20px", marginTop: "8px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: isEditing ? "pointer" : "not-allowed" }}>
                <input 
                  type="radio" 
                  name="feeMode" 
                  value="Paid" 
                  checked={form.feeMode === "Paid"} 
                  onChange={onChange} 
                  disabled={!isEditing} 
                />
                Paid
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: isEditing ? "pointer" : "not-allowed" }}>
                <input 
                  type="radio" 
                  name="feeMode" 
                  value="Unpaid" 
                  checked={form.feeMode === "Unpaid" || !form.feeMode} 
                  onChange={onChange} 
                  disabled={!isEditing} 
                />
                Unpaid
              </label>
            </div>
          </div>

          <div className="form-divider"></div>

          <div className="form-section-title">
            <Icon path={ICONS.image} className="section-icon" /> Documents Upload
          </div>
          <div className="upload-grid">
            <div className="upload-card">
              <label>Passport Photo *</label>
              <div className={`upload-area ${!isEditing ? 'disabled' : ''}`}>
                {passportPreview ? <img src={passportPreview} alt="P" className="img-preview" /> : <div className="placeholder"><Icon path={ICONS.image} /></div>}
                {isEditing && <input type="file" onChange={handleFileChange(setPassportPhoto, setPassportPreview)} accept="image/*" className="file-input" />}
              </div>
            </div>
            <div className="upload-card">
              <label>ID Card *</label>
              <div className={`upload-area ${!isEditing ? 'disabled' : ''}`}>
                {idCardPreview ? <img src={idCardPreview} alt="I" className="img-preview" /> : <div className="placeholder"><Icon path={ICONS.image} /></div>}
                {isEditing && <input type="file" onChange={handleFileChange(setIdCardPhoto, setIdCardPreview)} accept="image/*,application/pdf" className="file-input" />}
              </div>
            </div>
            <div className="upload-card">
              <label>Fees Receipt *</label>
              <div className={`upload-area ${!isEditing || form.feeMode !== 'Paid' ? 'disabled' : ''}`}>
                {feesPreview ? <img src={feesPreview} alt="F" className="img-preview" /> : <div className="placeholder"><Icon path={ICONS.image} /></div>}
                {isEditing && form.feeMode === 'Paid' && <input type="file" onChange={handleFileChange(setFeesReceipt, setFeesPreview)} accept="image/*,application/pdf" className="file-input" />}
              </div>
              {errors.feesReceipt && <span style={{ color: "red", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>{errors.feesReceipt}</span>}
            </div>
          </div>

          {isEditing && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Profile"}
              </button>
              {hasData && (
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)} style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>
                  Cancel
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}