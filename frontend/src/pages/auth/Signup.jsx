import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
import { API_BASE_URL } from "../../config";
import "../../styles/Auth.css";

export default function Signup() {
  const { setLoading } = useAuth(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRoleState] = useState("student"); 
  const [error, setError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: role }), 
      });

      const result = await response.json();

      if (response.ok) {
        setLoading(false);
        setLocalLoading(false);
        
        // Success: Alert kaatti login page-ku kootitu pogum
        alert("Account created successfully! Please login with your credentials.");
        navigate("/login"); 
      } else {
        setError(result.error || "Signup failed");
        setLoading(false);
        setLocalLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      setLoading(false);
      setLocalLoading(false);
    }
  };

  if (localLoading) {
    return (
      <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading-spinner">Creating Account...</div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join the hostel management system</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <input 
              type="email" 
              className="auth-input" 
              placeholder="Email Address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              className="auth-input" 
              placeholder="Create Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px', display: 'block' }}>Select Role</label>
            <select className="auth-input" value={role} onChange={(e) => setRoleState(e.target.value)}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" disabled={localLoading} className="auth-btn btn-success">
            {localLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Login here</Link>
        </div>
      </div>
    </div>
  );
}