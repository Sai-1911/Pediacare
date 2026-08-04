import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import "./index.css";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (!identifier || !password) {
      setError("Please enter email/mobile and password.");
      return;
    }
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/patient/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ identifier, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("storage"));
        navigate("/Home");
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("An error occurred during login. Please try again.");
    }
  };
  
  return (
    <div className="container d-flex justify-content-center align-items-center" style={{minHeight: '80vh'}}>
      <div className="text-center log-banner">
        <h1>Welcome Back</h1>
        <form onSubmit={handleLogin}>
          <input
            className="auth-input"
            onChange={(e) => setIdentifier(e.target.value)}
            type="text"
            value={identifier}
            placeholder="Email or Mobile Number"
          />
          <input
            className="auth-input"
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            value={password}
            placeholder="Password"
          />
          <div className="d-flex align-items-center" style={{gap: '10px'}}>
            <input
              className="check-input"
              type="checkbox"
              id="showPassword"
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPassword" style={{color: '#64748b', margin: 0, cursor: 'pointer'}}>Show password</label>
          </div>
          <button type="submit" className="btn-auth-primary w-100 mt-2">
            Login
          </button>
          {error && <p className="text-danger mt-3 mb-0 fw-bold">{error}</p>}
          <p className="mt-3 mb-0" style={{color: '#64748b'}}>
            Don't have an account?{" "}
            <Link to="/Signup" style={{color: '#FFB703', fontWeight: '700', textDecoration: 'none'}}>
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
