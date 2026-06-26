import React, { useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

function Appointment() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData || !userData._id) {
          throw new Error("User session not found. Please log in again.");
        }

        const parentId = userData._id;

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/slot/recentSlot?pId=${parentId}`
        );

        if (!response.ok) {
          throw new Error(`Unable to fetch appointments (Error ${response.status})`);
        }

        let data = await response.json();
        
        data.reverse(); // Show the latest first

        setAppointments(data);
        if (data.length > 0) {
          setSelectedAppointment(data[0]); // Default to the most recent appointment
        } else {
          setError("You have no recent appointments.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to fetch appointments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="appointments-container">
      <div className="appointments-wrapper">
        {/* Left Side: Appointment List */}
        <div className="appointment-list-col">
          <h2 className="section-title">
            <i className="bi bi-calendar-check"></i> My Appointments
          </h2>
          
          {error && <div className="error-message"><i className="bi bi-exclamation-triangle-fill"></i> {error}</div>}
          
          {loading ? (
            <div className="empty-state">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading your schedule...</p>
            </div>
          ) : appointments.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {appointments.map((appointment, index) => (
                <div
                  key={appointment.appId}
                  className={`appointment-card animate-fade-in ${
                    selectedAppointment?.appId === appointment.appId ? "active" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <span className="apt-id">ID: {appointment.appId}</span>
                  <div className="apt-date">
                    <i className="bi bi-calendar-event"></i> {appointment.date}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !error && (
              <div className="empty-state animate-fade-in">
                <i className="bi bi-calendar-x"></i>
                <p>No appointments found</p>
              </div>
            )
          )}
        </div>

        {/* Right Side: Appointment Details */}
        <div className="appointment-detail-col animate-fade-in">
          {selectedAppointment ? (
            <>
              <div className="detail-header">
                <h2>Appointment Details</h2>
                <p>Review the specific information regarding your scheduled visit.</p>
              </div>
              
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">
                    <i className="bi bi-hash"></i> Appointment ID
                  </div>
                  <div className="detail-value">{selectedAppointment.appId || "N/A"}</div>
                </div>

                <div className="detail-item">
                  <div className="detail-label">
                    <i className="bi bi-clipboard2-pulse"></i> Service Type
                  </div>
                  <div className="detail-value">{selectedAppointment.service || "N/A"}</div>
                </div>

                <div className="detail-item">
                  <div className="detail-label">
                    <i className="bi bi-person-badge"></i> Child Name
                  </div>
                  <div className="detail-value">{selectedAppointment.name || "N/A"}</div>
                </div>

                <div className="detail-item">
                  <div className="detail-label">
                    <i className="bi bi-person-hearts"></i> Caretaker Name
                  </div>
                  <div className="detail-value">{selectedAppointment.parentName || "N/A"}</div>
                </div>

                <div className="detail-item">
                  <div className="detail-label">
                    <i className="bi bi-calendar-date"></i> Age
                  </div>
                  <div className="detail-value">{selectedAppointment.age ? `${selectedAppointment.age} Yrs` : "N/A"}</div>
                </div>

                <div className="detail-item">
                  <div className="detail-label">
                    <i className="bi bi-sun"></i> Session
                  </div>
                  <div className="detail-value">{selectedAppointment.session || "N/A"}</div>
                </div>

                <div className="detail-item">
                  <div className="detail-label">
                    <i className="bi bi-clock"></i> Timing
                  </div>
                  <div className="detail-value">{selectedAppointment.slot || "N/A"}</div>
                </div>

                <div className="detail-item">
                  <div className="detail-label">
                    <i className="bi bi-calendar-day"></i> Appointment Date
                  </div>
                  <div className="detail-value">{selectedAppointment.date || "N/A"}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <i className="bi bi-file-earmark-medical"></i>
              <p>Select an appointment to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Appointment;
