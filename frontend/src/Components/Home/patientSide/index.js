import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./index.css";
import diet from "./img/Untitled design (5).png";
import tablet from "./img/Untitled design (2).png";
import personal from "./img/Untitled design (6).png";
import carousel1 from "./img/carousel1.png";
import carousel3 from "./img/carousel3.png";
import carousel2 from "./img/carouse2.png";
import Doc from "./img/doc.png";

function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nextVaccine, setNextVaccine] = useState({
    name: "No upcoming vaccines",
    date: "",
    daysToDue: null,
  });

  const handleLogin = () => {
    navigate("/login");
  };

  const handleHelloCaretaker = () => {
    // Implement caretaker-specific actions here
  };

  useEffect(() => {
    // Check if the user is logged in
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
    } 
 
    
    // Fetch DOB and calculate next vaccine
    const dob = localStorage.getItem("dob");
    if (dob) {
      calculateNextVaccine(new Date(dob));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.dob) {
      calculateNextVaccine(new Date(user.dob));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 
  const calculateNextVaccine = async (dob) => {
    const schedule = [
      { ageInDays: 42, name: "Penta-1, OPV-1, IPV-1, Rota-1" },  // 6th Week
      { ageInDays: 70, name: "Penta-2, OPV-2, Rota-2" },        // 10th Week
      { ageInDays: 98, name: "Penta-3, OPV-3, IPV-2, Rota-3" },  // 14th Week
      { ageInDays: 270, name: "MR 1st Dose, JE-1 (if applicable)" },
      { ageInDays: 365, name: "DPT 1st booster, OPV booster" },
      { ageInDays: 5475, name: "TT single dose (16th Year)" }
    ];
  
    const today = new Date();
    const ageInDays = Math.floor((today - dob) / (1000 * 60 * 60 * 24));
  
    const upcomingVaccines = schedule.filter((v) => v.ageInDays > ageInDays);
  
    let nextVaccine = null;
  
    // Loop through the upcoming vaccines
    for (let i = 0; i < upcomingVaccines.length; i++) {
      const vaccine = upcomingVaccines[i];
      const userId = JSON.parse(localStorage.getItem("user"))._id;
      const vaccineStatus = await fetchVaccinationStatus(userId, vaccine.name);
  
      // If the vaccine is not completed, show it as the next vaccine
      if (!vaccineStatus || !vaccineStatus.completed) {
        nextVaccine = vaccine;
        break; // Found the first vaccine that is not completed
      }
    }
  
    // If a next vaccine is found, calculate days remaining
    if (nextVaccine) {
      const dueDate = new Date(dob);
      dueDate.setDate(dueDate.getDate() + nextVaccine.ageInDays);
  
      const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  
      setNextVaccine({
        name: nextVaccine.name,
        date: dueDate.toDateString(),
        daysToDue: daysRemaining,
      });
    } else {
      setNextVaccine({
        name: "All vaccines are up-to-date",
        date: "",
        daysToDue: null,
      });
    }
  };
  
  

  // Fetch vaccination status for a specific vaccine
  const fetchVaccinationStatus = async (userId, vaccineName) => {
    try {
      const response = await fetch(`/vaccination/getVacciStatus?userId=${userId}&vaccineName=${vaccineName}`);
      if (!response.ok) {
        throw new Error("Failed to fetch vaccination status");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching vaccination status:", error);
      return { completed: false };
    }
  };
  

  return (
    <div className="home-com">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to<br/>Childcare Clinic</h1>
          <p className="hero-subtitle">Providing compassionate and expert care for your little ones.</p>
          
          <div>
            {isLoggedIn ? (
              <button className="btn-custom-primary" onClick={handleHelloCaretaker}>
                Hello Caretaker
              </button>
            ) : (
              <div>
                <p className="hero-subtitle mb-2" style={{color: '#fff', fontWeight: 'bold'}}>For more services</p>
                <button className="btn-custom-primary" onClick={handleLogin}>
                  Login / Signup
                </button>
              </div>
            )}
          </div>
          
          {isLoggedIn && (
            <div className="patient-id-badge shadow-sm">
              Patient ID: {JSON.parse(localStorage.getItem("user"))?.patientNo || "Not Available"}
            </div>
          )}
        </div>
        <img className="hero-image" src={Doc} alt="Doctor" />
      </div>

      {/* Book Slot and Vaccination Reminder */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-lg-6">
          <div className="carousel-wrapper">
            <div id="carouselExampleInterval" className="carousel slide h-100" data-bs-ride="carousel">
              <div className="carousel-inner h-100">
                <div className="carousel-item active h-100" data-bs-interval="3000">
                  <img src={carousel1} className="d-block w-100 h-100" alt="carousel" style={{objectFit: 'cover'}} />
                </div>
                <div className="carousel-item h-100" data-bs-interval="2000">
                  <img src={carousel2} className="d-block w-100 h-100" alt="carousel" style={{objectFit: 'cover'}} />
                </div>
                <div className="carousel-item h-100">
                  <img src={carousel3} className="d-block w-100 h-100" alt="carousel" style={{objectFit: 'cover'}} />
                </div>
              </div>
              <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleInterval" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleInterval" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="row g-4 h-100">
            <div className="col-12 col-md-6">
              <div className="modern-card">
                <div className="card-icon-wrapper bg-blue-light">
                  <i className="fas fa-calendar-check" style={{fontSize: '24px'}}>📅</i>
                </div>
                <h3>Book Slot</h3>
                <p>Pre-book your clinic slots for routine check-ups and consultations easily.</p>
                <Link to="/Service" className="btn-custom-primary mt-auto text-center" style={{textDecoration: 'none'}}>
                  Book Now
                </Link>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="modern-card">
                <div className="card-icon-wrapper bg-orange-light">
                  <i className="fas fa-syringe" style={{fontSize: '24px'}}>💉</i>
                </div>
                <h3>Vaccination</h3>
                {nextVaccine.name !== "All vaccines are up-to-date" ? (
                  <div className="vaccination-alert">
                    <h4>{nextVaccine.name}</h4>
                    {nextVaccine.date && <p className="mb-1">Due: <strong>{nextVaccine.date}</strong></p>}
                    {nextVaccine.daysToDue !== null && (
                      <p>Remaining: <strong>{nextVaccine.daysToDue} day(s)</strong></p>
                    )}
                  </div>
                ) : (
                  <p className="text-success fw-bold mb-4 mt-2">All vaccines are up-to-date! 🎉</p>
                )}

                {nextVaccine.daysToDue !== null && nextVaccine.daysToDue <= 3 ? (
                  <Link to="/Service" className="btn-custom-primary mt-auto text-center" style={{textDecoration: 'none'}}>
                    Schedule Vaccine
                  </Link>
                ) : (
                  <button className="btn btn-secondary mt-auto" disabled style={{borderRadius: '50px', padding: '12px', fontWeight: 'bold'}}>
                    {nextVaccine.name === "All vaccines are up-to-date" ? "Completed" : "Opening Soon"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diet Chart, Personal Details, Doctor Prescription Grid */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <div className="service-card">
            <div className="service-img-container">
              <img src={diet} alt="Diet Chart" />
            </div>
            <div className="service-card-body text-center">
              <h5>Recommended Diet</h5>
              <p>Customized healthy diet plans provided by your doctor for proper child growth.</p>
              <Link to="/diet" className="btn-outline-primary-custom mt-auto">
                Get Diet
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="service-card">
            <div className="service-img-container">
              <img src={tablet} alt="Medicine Prescription" />
            </div>
            <div className="service-card-body text-center">
              <h5>Prescriptions</h5>
              <p>View the prescribed medicines for each visited slot instantly.</p>
              <Link to="/prescription" className="btn-outline-primary-custom mt-auto">
                View Prescriptions
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="service-card">
            <div className="service-img-container">
              <img src={personal} alt="Personal Details" />
            </div>
            <div className="service-card-body text-center">
              <h5>Personal Details</h5>
              <p>Update and manage your child's personal and medical information.</p>
              <Link to="/personal" className="btn-outline-primary-custom mt-auto">
                Manage Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
