import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from "./img/PediaCare.png";
import "./index.css";

function PNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [childName, setChildName] = useState("");

  const checkAuth = useCallback(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        setIsLoggedIn(true);
        setChildName(user.name || user.childName || "Patient");
      } else {
        setIsLoggedIn(false);
        setChildName("");
      }
    } catch (error) {
      console.error("Error parsing data from localStorage:", error);
      setIsLoggedIn(false);
      setChildName("");
    }
  }, []);

  useEffect(() => {
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, [location.pathname, checkAuth]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("id");
    window.dispatchEvent(new Event("storage")); // Trigger storage event to refresh
    navigate("/Login");
  };


  return (
    <div className="container-fluid position-sticky z-3 top-0 start-0 p-0">
      <nav className="navbar navbar-expand-lg modern-navbar">
        <div className="container-fluid px-4">
          <Link to="/Home" className="navbar-brand d-flex align-items-center text-decoration-none">
            <img src={Logo} className="logo-img" alt="Logo" />
            <h1 className="web-name mb-0">PediaCare</h1>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNavAltMarkup">
            <div className="navbar-nav align-items-center gap-3">
              <Link to="/Home" className="nav-link-custom text-decoration-none">
                Home
              </Link>
              <Link to="/Service" className="nav-link-custom text-decoration-none">
                Book Slot
              </Link>
              <div className="nav-item dropdown">
                <a
                  className="nav-link-custom text-decoration-none dropdown-toggle d-flex align-items-center"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ cursor: 'pointer' }}
                >
                  Settings
                </a>
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-custom">
                  <li>
                    <Link to='/appointment' className="dropdown-item dropdown-item-custom">
                      Appointment
                    </Link>
                  </li>
                  <li>
                    <Link to='/vaccination' className="dropdown-item dropdown-item-custom">
                      Vaccination Details
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link to="/Terms" className="dropdown-item dropdown-item-custom">
                      Terms & Conditions
                    </Link>
                  </li>
                  <li>
                    <button className="dropdown-item dropdown-item-custom text-danger fw-bold" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
              {isLoggedIn ? (
                <span className="patient-name-badge ms-lg-3">
                  <i className="bi bi-person-circle me-2"></i>
                  {childName}
                </span>
              ) : (
                <Link to="/Login" className="nav-link-custom text-decoration-none ms-lg-3 fw-bold text-primary">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default PNavbar;
