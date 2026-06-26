import React from 'react'
import "./index.css";
import logo from "./img/PediaCare.png";

function Footer() {
  return (
    <footer className="modern-footer container-fluid">
      <div className="container">
        <div className="row g-5">
          {/* Logo & Location */}
          <div className="col-12 col-md-6 col-lg-3 footer-section">
            <div className="d-flex align-items-center mb-4">
              <img src={logo} alt="PediaCare Logo" className="footer-logo-img" />
              <h3 className="mb-0 fw-bold text-white">PediaCare</h3>
            </div>
            <div className="mb-4">
              <h5 className="text-white fw-bold mb-2">Location:</h5>
              <p className="text-light opacity-75 m-0" style={{lineHeight: '1.6'}}>
                No: 255, CTH road,<br />Thiruninravur - 602024
              </p>
            </div>
            <div className="footer-social-icons d-lg-none mt-3">
              <a href="#" className="social-icon"><i className="bi bi-facebook"></i></a>
              <a href="#" className="social-icon"><i className="bi bi-youtube"></i></a>
              <a href="#" className="social-icon"><i className="bi bi-instagram"></i></a>
              <a href="#" className="social-icon"><i className="bi bi-twitter-x"></i></a>
            </div>
          </div>

          {/* Contact */}
          <div className="col-12 col-md-6 col-lg-3 footer-section">
            <h4>Contact</h4>
            <ul className="footer-list">
              <li>
                <i className="bi bi-telephone-fill me-3 text-warning"></i>
                <div>
                  <span className="d-block fw-bold text-white" style={{fontSize: '0.85rem'}}>Mobile No</span>
                  <span>+91 9025899267</span>
                </div>
              </li>
              <li className="mt-3">
                <i className="bi bi-envelope-fill me-3 text-warning"></i>
                <div>
                  <span className="d-block fw-bold text-white" style={{fontSize: '0.85rem'}}>Email</span>
                  <span>pediacare@gmail.com</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-12 col-md-6 col-lg-3 footer-section">
            <h4>Support</h4>
            <ul className="footer-list">
              <li><span>Donate</span></li>
              <li><span>Customer Service</span></li>
              <li><span>Emergency Care</span></li>
              <li><span>Visitor Info</span></li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div className="col-12 col-md-6 col-lg-3 footer-section">
            <h4>Trust & Legal</h4>
            <ul className="footer-list">
              <li><span>Terms & Conditions</span></li>
              <li><span>Hospital Stay</span></li>
              <li><span>Privacy Policy</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="d-flex align-items-center mb-3 mb-md-0">
            <p className="footer-bottom-text">© 2024 PediaCare Clinic.</p>
            <span className="footer-bottom-divider">|</span>
            <p className="footer-bottom-text">Version 1.0.1</p>
          </div>
          
          <div className="footer-social-icons d-none d-lg-flex">
            <a href="#" className="social-icon"><i className="bi bi-facebook"></i></a>
            <a href="#" className="social-icon"><i className="bi bi-youtube"></i></a>
            <a href="#" className="social-icon"><i className="bi bi-instagram"></i></a>
            <a href="#" className="social-icon"><i className="bi bi-twitter-x"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer
