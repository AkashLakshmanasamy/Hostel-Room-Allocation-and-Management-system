import React, { useEffect, useState } from "react";
import { API_BASE_URL as BASE_URL } from "../../config";
import "../../styles/VacantRooms-new.css"; 

// Backend API URLs
const API_BASE_URL = `${BASE_URL}/api/room/allocations`;
const ADMIN_ALLOCATE_URL = `${BASE_URL}/api/allocation/admin-fill`; 

export default function VacantRooms() {
    const HOSTELS = ["Hostel 1", "Hostel 2", "Hostel 3", "Hostel 4", "Hostel 5", "Hostel 6", "Hostel 7"];
    const FLOORS = ["Ground", "First", "Second", "Third"];

    const [hostel, setHostel] = useState(HOSTELS[0]); 
    const [floor, setFloor] = useState(FLOORS[0]);
    const [allocations, setAllocations] = useState([]); 
    const [loading, setLoading] = useState(false);

    // --- Admin Manual Fill States ---
    const [showModal, setShowModal] = useState(false);
    const [selectedBed, setSelectedBed] = useState(null); 
    const [formData, setFormData] = useState({
        name: "",
        regNo: "",
        department: "",
        email: ""
    });

    const getRoomNumbers = (selectedFloor) => {
        if (selectedFloor === "Ground") {
            return Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(3, "0"));
        }
        let start = selectedFloor === "First" ? 101 : selectedFloor === "Second" ? 201 : 301;
        return Array.from({ length: 40 }, (_, i) => String(start + i));
    };

    const roomNumbers = getRoomNumbers(floor);

    useEffect(() => {
        fetchAllocations();
    }, [hostel, floor]);

    const fetchAllocations = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}?hostel=${encodeURIComponent(hostel)}&floor=${floor}`);
            if (!response.ok) throw new Error("Server error");
            const data = await response.json();
            setAllocations(data || []);
        } catch (err) {
            console.error("Error fetching vacant rooms:", err);
        } finally {
            setLoading(false);
        }
    };

    const isBedBooked = (currentRoomNo, bedIndex) => {
        const currentBedNumber = bedIndex + 1;
        return allocations.find((alloc) => 
            String(alloc.room_number) === String(currentRoomNo) && 
            Number(alloc.bed_number) === currentBedNumber
        );
    };

    // --- 🚀 UPDATED: Form Submit Handler (Admin Manual Fill with PAID Status) ---
    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        
        // Data Payload for Backend
        const payload = {
            name: formData.name,
            regNo: formData.regNo,
            department: formData.department,
            email: formData.email,
            hostel: hostel,
            floor: floor,
            roomNumber: selectedBed.roomNo,
            bedNumber: selectedBed.bedIdx + 1,
            // Inga dhaan namma status-ai 'approved' & 'paid' nu force panrom
            // So student profile-la 'Pending' varathu, direct-ah PAID nu update aagum
            status: 'approved',
            paymentStatus: 'paid'
        };

        try {
            const res = await fetch(ADMIN_ALLOCATE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (res.ok) {
                alert(`Successfully allocated Room ${selectedBed.roomNo} to ${formData.name}. Status: PAID ✅`);
                setShowModal(false);
                setFormData({ name: "", regNo: "", department: "", email: "" });
                fetchAllocations(); // Grid refresh aagi occupied (red) aagidum
            } else {
                alert("Error: " + result.error);
            }
        } catch (err) {
            alert("Failed to connect to server. Check if backend is running.");
        }
    };

    return (
        <div className="vacant-container">
            <div className="vacant-header">
                <div className="header-title">
                    <h2>Vacant Rooms (Admin Panel)</h2>
                    <p>Select an available bed to manually allocate a student</p>
                </div>

                <div className="filter-group">
                    <select value={hostel} onChange={(e) => setHostel(e.target.value)} className="custom-select">
                        {HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select value={floor} onChange={(e) => setFloor(e.target.value)} className="custom-select">
                        {FLOORS.map(f => <option key={f} value={f}>{f} Floor</option>)}
                    </select>
                </div>

                <div className="legend">
                    <div className="legend-item"><div className="legend-box free"></div><span>Available (Click to Fill)</span></div>
                    <div className="legend-item"><div className="legend-box occupied"></div><span>Occupied</span></div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Loading Room Status...</div>
            ) : (
                <div className="rooms-grid">
                    {roomNumbers.map((roomNo) => (
                        <div key={roomNo} className="room-card">
                            <div className="room-number">{roomNo}</div>
                            <div className="bed-row">
                                {[0, 1, 2].map(bedIdx => { 
                                    const occupant = isBedBooked(roomNo, bedIdx);
                                    return (
                                        <div
                                            key={bedIdx}
                                            className={`bed-box ${occupant ? "occupied" : "free"}`}
                                            title={occupant ? `Occupied by: ${occupant.name}` : "Click to Allocate"}
                                            onClick={() => {
                                                if (!occupant) {
                                                    setSelectedBed({ roomNo, bedIdx });
                                                    setShowModal(true);
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- Admin Manual Allocation Modal --- */}
            {showModal && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="modal-content" style={modalContentStyle}>
                        <h3 style={{marginBottom: '10px'}}>Manual Allocation</h3>
                        <p style={{fontSize: '0.85rem', color: '#666', marginBottom: '15px'}}>
                            Hostel: <b>{hostel}</b> | Room: <b>{selectedBed.roomNo}</b> | Bed: <b>{selectedBed.bedIdx + 1}</b>
                        </p>
                        
                        <form onSubmit={handleAdminSubmit} style={formStyle}>
                            <div className="input-field" style={inputFieldContainer}>
                                <label style={labelStyle}>Student Name</label>
                                <input required style={inputStyle} type="text" placeholder="Enter Full Name" 
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="input-field" style={inputFieldContainer}>
                                <label style={labelStyle}>Registration No</label>
                                <input required style={inputStyle} type="text" placeholder="e.g. 2021CS101" 
                                    value={formData.regNo} onChange={e => setFormData({...formData, regNo: e.target.value})} />
                            </div>
                            <div className="input-field" style={inputFieldContainer}>
                                <label style={labelStyle}>Department</label>
                                <input required style={inputStyle} type="text" placeholder="e.g. Mechanical" 
                                    value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                            </div>
                            <div className="input-field" style={inputFieldContainer}>
                                <label style={labelStyle}>Email ID</label>
                                <input required style={inputStyle} type="email" placeholder="student@university.com" 
                                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>

                            <div className="modal-actions" style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                                <button type="submit" className="submit-btn" style={submitBtnStyle}>Assign Room</button>
                                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn" style={cancelBtnStyle}>Back</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Minimal Inline Styles for Modal ---
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { backgroundColor: 'white', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const inputFieldContainer = { display: 'flex', flexDirection: 'column', gap: '4px' };
const labelStyle = { fontSize: '0.8rem', fontWeight: '600', color: '#444' };
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem' };
const submitBtnStyle = { flex: 1, padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' };
const cancelBtnStyle = { flex: 1, padding: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' };