import React, { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

function Prescription() {
  const [medicineData, setMedicineData] = useState([]);
  const [allPrescriptions, setAllPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAppId, setSelectedAppId] = useState(null);

  useEffect(() => {
    const fetchAllPrescriptions = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const pId = user?._id;
        if (!pId) {
          throw new Error("User session not found. Please log in again.");
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/medicine/getMedicines?pId=${pId}`
        );

        if (!response.ok) {
          throw new Error(`Unable to fetch prescriptions (Error ${response.status})`);
        }

        const data = await response.json();
        
        let prescriptionsList = data.medicines || [];
        prescriptionsList.reverse(); // Display latest first

        setAllPrescriptions(prescriptionsList);
        
        // Auto-select the most recent prescription and load its data
        if (prescriptionsList.length > 0) {
          setSelectedAppId(prescriptionsList[0].appId);
          setMedicineData(prescriptionsList[0].medicines || []);
        }

      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to fetch prescriptions");
      } finally {
        setLoading(false);
      }
    };

    fetchAllPrescriptions();
  }, []);

  const handleSelectPrescription = (prescription) => {
    setSelectedAppId(prescription.appId);
    setMedicineData(prescription.medicines || []);
  };

  return (
    <div className="prescription-container">
      <div className="prescription-wrapper">
        
        {/* Left Column: All Prescriptions List */}
        <div className="prescription-list-col">
          <h2 className="section-title">
            <i className="bi bi-journal-medical"></i> My Prescriptions
          </h2>

          {error && (
            <div className="error-message">
              <i className="bi bi-exclamation-triangle-fill"></i> {error}
            </div>
          )}

          {loading ? (
            <div className="empty-state">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading prescriptions...</p>
            </div>
          ) : allPrescriptions.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {allPrescriptions.map((prescription, index) => (
                <div
                  key={index}
                  className={`prescription-card animate-fade-in ${
                    selectedAppId === prescription.appId ? "active" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleSelectPrescription(prescription)}
                >
                  <div className="presc-info">
                    <span className="presc-id">Appt ID: {prescription.appId}</span>
                  </div>
                  <div className="presc-icon">
                    <i className="bi bi-chevron-right"></i>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !error && (
              <div className="empty-state animate-fade-in">
                <i className="bi bi-journal-x"></i>
                <p>No prescriptions found</p>
              </div>
            )
          )}
        </div>

        {/* Right Column: Prescription Details */}
        <div className="prescription-detail-col animate-fade-in">
          {selectedAppId ? (
            <>
              <div className="detail-header">
                <div>
                  <h2>Prescription Details</h2>
                  <p>Medication and dosage instructions for your visit.</p>
                </div>
                <div className="app-id-badge">
                  <i className="bi bi-hash"></i> {selectedAppId}
                </div>
              </div>

              {medicineData && medicineData.length > 0 ? (
                <div className="medicine-table-container animate-fade-in">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th><i className="bi bi-capsule"></i> Medicine Name</th>
                        <th><i className="bi bi-droplet"></i> Dosage</th>
                        <th><i className="bi bi-clock-history"></i> Timing</th>
                        <th><i className="bi bi-sun"></i> Session</th>
                        <th><i className="bi bi-calendar-check"></i> Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicineData.map((medicine, index) => (
                        <tr key={index}>
                          <td><strong>{medicine.name}</strong></td>
                          <td>{medicine.dose}</td>
                          <td>{medicine.meal}</td>
                          <td>
                            <span className="badge-session">
                              {medicine.session && Array.isArray(medicine.session) 
                                ? medicine.session.join(", ") 
                                : medicine.session}
                            </span>
                          </td>
                          <td>{medicine.days} Days</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <i className="bi bi-capsule-pill"></i>
                  <p>No medicines prescribed for this appointment.</p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <i className="bi bi-file-medical"></i>
              <p>Select a prescription from the list to view details</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Prescription;
