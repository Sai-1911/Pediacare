import React, { useState } from "react";
 
import "./index.css";
import { Link,useNavigate } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
  
    if (email.trim() && password.trim() && mobile.trim() && name.trim()) {
      if (!/^[0-9]{10}$/.test(mobile)) {
        setError("Please enter a valid 10-digit phone number.");
        return;
      }
  
      try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/patient/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email: email.trim(), password, mobile: mobile.trim(), name: name.trim() }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          localStorage.setItem("user", JSON.stringify(data));
          window.dispatchEvent(new Event("storage"));
          setSuccess("Signup Successful!");
          setError("");
          setEmail("");
          setPassword("");
          setMobile("");
          setName("");
          navigate("/home");
        } else {
          setError(data.error || "Signup failed. Please try again.");
        }
      } catch (err) {
        console.error("Error during signup:", err);
        setError("An error occurred during signup. Please try again.");
      }
    } else {
      setError("Please fill in all fields.");
    }
  };
  
  
  
  
  
  return (
    <div className="container d-flex justify-content-center align-items-center" style={{minHeight: '80vh'}}>
      <div className="text-center log-banner">
        <h1>Create Account</h1>
        <form onSubmit={handleSignup}>
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
          />
          <input
            className="auth-input"
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Mobile Number"
            required
          />
          <input
            className="auth-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            required
          />
          <input
            className="auth-input"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <div className="d-flex align-items-center" style={{gap: '10px'}}>
            <input
              className="check-input"
              type="checkbox"
              id="showPasswordSignup"
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPasswordSignup" style={{color: '#64748b', margin: 0, cursor: 'pointer'}}>Show password</label>
          </div>
          <button type="submit" className="btn-auth-primary w-100 mt-2">
            Sign Up
          </button>
          
          {success && <p className="text-success mt-3 mb-0 fw-bold">{success}</p>}
          {error && <p className="text-danger mt-3 mb-0 fw-bold">{error}</p>}
          
          <p className="mt-3 mb-0" style={{color: '#64748b'}}>
            Already have an account?{" "}
            <Link to="/Login" style={{color: '#FFB703', fontWeight: '700', textDecoration: 'none'}}>
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
