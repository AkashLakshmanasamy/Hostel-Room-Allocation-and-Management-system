import React, { useEffect, useMemo, useState, useCallback } from "react";
import HostelSelector from "../../components/HostelSelector";
import FloorSelector from "../../components/FloorSelector";
import RoomGrid from "../../components/RoomGrid";
import { API_BASE_URL } from "../../config";
import "../../styles/RoomAllocation.css";
import { useAuth } from "../../context/AuthContext";

const HOSTELS = ["Hostel 1", "Hostel 2", "Hostel 3", "Hostel 4", "Hostel 5", "Hostel 6", "Hostel 7"];
const FLOORS = ["Ground", "First", "Second", "Third"];
const API_BASE = `${API_BASE_URL}/api/allocation`;

export default function StudentRoomAllocation() {
  const { user, loading } = useAuth();

  // --- States ---
  const [form, setForm] = useState({
    email: "",
    name: "",
    regNo: "",
    department: "",
    feesStatus: "Paid",
    hostel: HOSTELS[0],
    floor: FLOORS[0]
  });

  const [receipt, setReceipt] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingAllocation, setExistingAllocation] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [occupiedBeds, setOccupiedBeds] = useState([]);
  const [config, setConfig] = useState(null);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  
  // 🔥 Eligibility State
  const [isEligible, setIsEligible] = useState(null); 

  const safeFetch = async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        return { data, ok: res.ok, status: res.status };
      }
      throw new Error("Backend error or route not found");
    } catch (err) { throw err; }
  };

  // 1. FETCH CONFIG
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsSessionOpen(false); 
        const { data } = await safeFetch(`${API_BASE}/config/${encodeURIComponent(form.hostel)}`);
        
        if (!data || Object.keys(data).length === 0) {
          setConfig(null);
          setIsSessionOpen(false); 
          return;
        }

        setConfig(data);
        const currentTime = new Date().getTime();
        const openTime = new Date(data.openTime).getTime();
        const closeTime = new Date(data.closeTime).getTime();
        const isOpen = currentTime >= openTime && currentTime <= closeTime;
        setIsSessionOpen(isOpen);

      } catch (e) { 
        console.error("Config Fetch Error:", e);
        setIsSessionOpen(false); 
      }
    };
    fetchConfig();
  }, [form.hostel]);

  // 2. Room Generation
  const rooms = useMemo(() => {
    const count = parseInt(config?.roomsPerFloor) || 40;
    const start = form.floor === "Ground" ? 1 : form.floor === "First" ? 101 : form.floor === "Second" ? 201 : 301;
    return Array.from({ length: count }, (_, i) => form.floor === "Ground" ? String(i + 1).padStart(3, "0") : String(start + i));
  }, [form.floor, config]);

  // 3. Fetch Occupied
  const fetchOccupied = useCallback(async () => {
    try {
      const { data } = await safeFetch(`${API_BASE}/occupied?hostel=${encodeURIComponent(form.hostel)}&floor=${form.floor}`);
      setOccupiedBeds(data || []);
    } catch (err) { console.error(err); }
  }, [form.hostel, form.floor]);

  useEffect(() => { fetchOccupied(); }, [fetchOccupied]);

  // 4. STATUS CHECK & ELIGIBILITY LOGIC
  useEffect(() => {
    if (!loading && user?.email) {
      const getProfileAndStatus = async () => {
        setLoadingStatus(true);
        try {
          const [profileRes, statusRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/student/profile/${user.id}`),
            safeFetch(`${API_BASE}/status?email=${user.email}`)
          ]);

          // Handle Profile Data & Check Eligibility
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            
            // Check if fee_mode exists in profile
            if (profileData && profileData.fee_mode) {
              setIsEligible(true);
              setForm(prev => ({
                ...prev,
                name: profileData.name || prev.name,
                regNo: profileData.roll_no || prev.regNo,
                department: profileData.department || prev.department,
                email: user.email,
                floor: profileData.floor || prev.floor
              }));
            } else {
              setIsEligible(false);
            }
          }

          // Handle Existing Allocation
          const { data: statusData } = statusRes;
          if (statusData && statusData.allocation && 
              statusData.allocation.status !== "rejected" && 
              statusData.allocation.status !== "system") {
            setExistingAllocation(statusData.allocation);
          } else {
            setExistingAllocation(null);
          }

        } catch (err) { 
          console.error("Fetch Error:", err.message);
          setIsEligible(false);
          setForm(prev => ({ ...prev, email: user.email }));
        }
        setLoadingStatus(false);
      };
      getProfileAndStatus();
    }
  }, [user, loading]);

  const getBedStatus = useCallback((roomNo) => {
    const status = [false, false, false]; 
    occupiedBeds.filter(a => String(a.room_number) === String(roomNo)).forEach(a => {
      if (a.bed_number >= 1 && a.bed_number <= 3) status[a.bed_number - 1] = true;
    });
    return status;
  }, [occupiedBeds]);

  // 5. SUBMIT LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!receipt || !selected) return alert("Select a bed and upload receipt.");

    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    formData.append("receipt", receipt);
    formData.append("roomNumber", selected.roomNo);
    formData.append("bedNumber", selected.bedIndex + 1);

    try {
      const res = await fetch(API_BASE, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      
      alert("Application submitted successfully!");
      setExistingAllocation({ 
        ...form, 
        room_number: selected.roomNo, 
        bed_number: selected.bedIndex + 1, 
        status: "pending" 
      });
    } catch (err) { alert(err.message); }
    finally { setIsSubmitting(false); }
  };

  // --- UI Rendering ---

  if (loadingStatus || loading) return <div className="allocation-page">Loading...</div>;

  // Render Status if already allocated
  if (existingAllocation) {
    return (
      <div className="allocation-page">
        <div className="allocation-card">
          <div className="allocation-header"><h2>Status: {existingAllocation.status?.toUpperCase()}</h2></div>
          <div className="status-body">
            <div className="allocation-details">
              <div className="detail-row"><span>Room</span><span>{existingAllocation.room_number}</span></div>
              <div className="detail-row"><span>Bed</span><span>{existingAllocation.bed_number}</span></div>
              <div className="detail-row"><span>Hostel</span><span>{existingAllocation.hostel}</span></div>
              <div className="detail-row"><span>Floor</span><span>{existingAllocation.floor}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 Render Eligibility Error if Fees not updated in profile
  if (isEligible === false) {
    return (
      <div className="allocation-page">
        <div className="allocation-card" style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ color: '#ef4444', marginBottom: '10px' }}>Fees Payment Status Required</h2>
          <p style={{ color: '#6b7280', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 25px' }}>
            To proceed with room allocation, please update your <b>Fee Payment Mode</b> in the Profile section. You will be able to access this form once your profile is complete.
          </p>
          <a href="/student/profile" className="submit-btn" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '12px 30px' }}>
            Go to Profile
          </a>
        </div>
      </div>
    );
  }

  // Render Allocation Form
  return (
    <div className="allocation-page">
      <div className="allocation-card">
        <div className="allocation-header"><h2>Room Allocation Form</h2></div>
        {!isSessionOpen ? (
          <div className="session-closed" style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444' }}>
            🚫 Session Closed or Configuration Missing
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="allocation-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input placeholder="Enter Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Registration Number</label>
                <input placeholder="Enter Reg No" value={form.regNo} onChange={e => setForm({...form, regNo: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input placeholder="Enter Dept" value={form.department} onChange={e => setForm({...form, department: e.target.value})} required />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Select Hostel</label>
                <HostelSelector value={form.hostel} onChange={v => { setForm({...form, hostel: v}); setSelected(null); }} />
              </div>
              <div className="form-group">
                <label>Select Floor</label>
                <FloorSelector value={form.floor} onChange={v => { setForm({...form, floor: v}); setSelected(null); }} />
              </div>
            </div>

            <div className="form-group">
                <label>Upload Payment Receipt (JPG/PNG)</label>
                <input type="file" onChange={e => setReceipt(e.target.files[0])} required />
            </div>
            
            <div className="room-selection-area">
                <label>Select Your Bed</label>
                <RoomGrid 
                 rooms={rooms} 
                 getBeds={getBedStatus} 
                 selected={selected} 
                 onSelectFreeBed={(roomNo, bedIndex) => setSelected({ roomNo, bedIndex })} 
                />
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Allocation"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}