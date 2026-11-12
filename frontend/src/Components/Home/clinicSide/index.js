import React, { useState } from "react";
import "./index.css";

function Chome() {
  const [medicineData, setMedicineData] = useState({
    medicines: [],
  });
  const [currentMedicine, setCurrentMedicine] = useState({
    name: "",
    dose: "",
    meal: "",
    session: { morning: false, afternoon: false, night: false },
    days: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [appointmentNumber, setAppointmentNumber] = useState("");
  const [details, setDetails] = useState({
    appointment: {},
    patient: {},
  });
  const [vaccinationDetails, setVaccinationDetails] = useState({
    finished: [],
    upcoming: [],
  });
  const [error, setError] = useState(null);

 
  const handleSearch = async () => {
    // Clear previous data before searching
    setDetails({ appointment: {}, patient: {} });
    setMedicineData({ medicines: [] });
    setVaccinationDetails({ finished: [], upcoming: [] });
    setCurrentMedicine({
      name: "",
      dose: "",
      meal: "",
      session: { morning: false, afternoon: false, night: false },
      days: "",
    });
    setEditingIndex(null);
    setIsUpdate(false);
    setError(null);

    try {
      const appointmentResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/slot/getAppointment?appId=${appointmentNumber}`
      );
  
      if (!appointmentResponse.ok) {
        throw new Error("Failed to fetch appointment details");
      }
  
      const appointmentData = await appointmentResponse.json();
  
      let patientData = {};
      try {
        if (appointmentData.appointment?.pId) {
          const patientResponse = await fetch(
            `${process.env.REACT_APP_API_URL}/patient/getPatient?pId=${appointmentData.appointment.pId}`
          );
          if (patientResponse.ok) {
            patientData = await patientResponse.json();
          } else {
            console.warn("Patient details not found for this appointment.");
          }
        }
      } catch (err) {
        console.warn("Error fetching patient details:", err);
      }
  
      setDetails({
        appointment: appointmentData.appointment || {},
        patient: patientData.patient || {},
      });
  
      fetchVaccinationDetails(appointmentData.appointment.pId);
  
      // Fetch Medicines for this appointment
      fetchMedicines(appointmentNumber);
  
      setError(null);
    } catch (error) {
      console.error("Error fetching details:", error);
      setError(error.message);
    }
  };
  
  
  

  const fetchVaccinationDetails = async (pId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/vaccination/getVaccinationDetails/${pId}`
      );
  
      if (!response.ok) {
        throw new Error("Failed to fetch vaccination details");
      }
  
      const data = await response.json();
      console.log("Vaccination details fetched:", data); // Debugging line
  
      // Classifying vaccines as finished or upcoming
      const finishedVaccines = data.data.vaccination.filter(vaccine => !vaccine.availability);
      const upcomingVaccines = data.data.vaccination.filter(vaccine => vaccine.availability);
  
      setVaccinationDetails({
        finished: finishedVaccines,
        upcoming: upcomingVaccines,
      });
    } catch (error) {
      console.error("Error fetching vaccination details:", error);
      setError(error.message);
    }
  };
  
  const [isUpdate, setIsUpdate] = useState(false);

const fetchMedicines = async (appId) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/medicine/getMedicinesById?appId=${appId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch medicines");
    }

    const data = await response.json();

    if (data.medicines.length > 0) {
      setMedicineData({ medicines: data.medicines });
      setIsUpdate(true); // If medicines exist, show Update button
    } else {
      setMedicineData({ medicines: [] });
      setIsUpdate(false); // If no medicines, show Submit button
    }
  } catch (error) {
    console.error("Error fetching medicines:", error);
    setError(error.message);
  }
};

 
  const handleAddOrEditMedicine = () => {
    const newMedicine = {
      ...currentMedicine,
      meal: currentMedicine.meal.toLowerCase(),
      session: Object.keys(currentMedicine.session).filter(
        (key) => currentMedicine.session[key]
      ),
    };

    if (editingIndex !== null) {
      // Update existing medicine
      setMedicineData((prev) => {
        const updatedMedicines = [...prev.medicines];
        updatedMedicines[editingIndex] = newMedicine;
        return { medicines: updatedMedicines };
      });
      setEditingIndex(null);
    } else {
      // Add new medicine
      setMedicineData((prev) => ({
        medicines: [...prev.medicines, newMedicine],
      }));
    }

    setCurrentMedicine({
      name: "",
      dose: "",
      session: { morning: false, afternoon: false, night: false },
      meal: "",
      days: "",
    });
  };

  const handleRemoveMedicine = (index) => {
    setMedicineData((prev) => ({
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
    // Also clear editing state if the removed medicine was being edited
    if (editingIndex === index) {
      setEditingIndex(null);
      setCurrentMedicine({
        name: "",
        dose: "",
        session: { morning: false, afternoon: false, night: false },
        meal: "",
        days: "",
      });
    } else if (editingIndex !== null && index < editingIndex) {
      // Adjust editing index if a previous item is removed
      setEditingIndex(editingIndex - 1);
    }
  };
 
  const handleSubmitOrUpdate = async () => {
    if (!medicineData.medicines.length) {
      setError("No medicines to submit or update!");
      return;
    }
  
    const medicinePayload = {
      appId: appointmentNumber,
      medicines: medicineData.medicines,
      pId: details.appointment.pId,
    };
  
    try {
      let response;
      
      if (isUpdate) {
        // Update existing medicines
        response = await fetch(
          `${process.env.REACT_APP_API_URL}/medicine/updateMedicine/${appointmentNumber}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(medicinePayload),
          }
        );
      } else {
        // Submit new medicines
        response = await fetch(`${process.env.REACT_APP_API_URL}/medicine/addMedicine`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(medicinePayload),
        });
      }
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error submitting or updating medicines:", errorText);
        throw new Error("Failed to submit/update medicines");
      }
  
      // Mark the slot as done
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/slot/slotdone`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appId: appointmentNumber })
        });
      } catch (err) {
        console.error("Error marking slot as done:", err);
      }

      alert(isUpdate ? "Medicines updated successfully!" : "Medicines submitted successfully!");
      
      // Refresh forms after saving
      setAppointmentNumber("");
      setDetails({ appointment: {}, patient: {} });
      setMedicineData({ medicines: [] });
      setVaccinationDetails({ finished: [], upcoming: [] });
      setCurrentMedicine({
        name: "",
        dose: "",
        meal: "",
        session: { morning: false, afternoon: false, night: false },
        days: "",
      });
      setEditingIndex(null);
      setIsUpdate(false);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    }
  };
  
 
  const handleEditMedicine = (index) => {
    const medicineToEdit = medicineData.medicines[index];
    setCurrentMedicine({
      ...medicineToEdit,
      session: {
        morning: medicineToEdit.session.includes("morning"),
        afternoon: medicineToEdit.session.includes("afternoon"),
        night: medicineToEdit.session.includes("night"),
      },
    });
    setEditingIndex(index);
  };


  return (
    <div className="clinic-dashboard-wrapper pt-4" style={{ minHeight: '100vh' }}>
      <div className="container pb-5 mb-5 clinic-dashboard-container">
      
      {/* Search Section */}
      <div className="search-banner text-center">
        <h2 className="fw-bold mb-4" style={{color: '#0077B6'}}>
          <i className="bi bi-search me-2"></i>Find Patient Appointment
        </h2>
        <div className="search-input-group d-flex">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Enter Appointment ID (e.g., APP-1234)"
            value={appointmentNumber}
            onChange={(e) => setAppointmentNumber(e.target.value)}
          />
          <button
            type="button"
            className="search-btn"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        {error && (
          <div className="alert alert-danger mt-4 mx-auto border-0 shadow-sm rounded-3 text-start" style={{maxWidth: '600px'}}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
          </div>
        )}
      </div>

      <div className="row g-4 mb-4">
        {/* Left Column: Patient Overview */}
        <div className="col-12 col-xl-5">
          <div className="modern-card p-4 h-100">
            <h4 className="fw-bold mb-4 pb-2 border-bottom text-dark">
              <i className="bi bi-person-vcard me-2 text-primary"></i>Patient Overview
            </h4>
            
            <div className="row">
              {[
                { label: "Child Name", value: details.appointment?.name, col: "12" },
                { label: "Service", value: details.appointment?.service, col: "6" },
                { label: "Appointment Date", value: details.appointment?.date, col: "6" },
                { label: "Slot Time", value: details.appointment?.slot, col: "6" },
                { label: "Session", value: details.appointment?.session, col: "6" },
                { label: "Gender", value: details.patient?.gender, col: "6" },
                { label: "DOB", value: details.patient?.dob, col: "6" },
                { label: "Parents", value: `${details.patient?.fatherName || ''} & ${details.patient?.motherName || ''}`, col: "12" },
                { label: "Phone", value: details.patient?.mobile, col: "12" },
              ].map((item, index) => (
                <div className={`col-${item.col}`} key={index}>
                  <p className="info-label">{item.label}</p>
                  <p className="info-value">{item.value || "--"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Medicine Prescription */}
        <div className="col-12 col-xl-7">
          <div className="modern-card p-4 h-100">
            <h4 className="fw-bold mb-4 pb-2 border-bottom text-dark d-flex justify-content-between align-items-center">
              <span><i className="bi bi-capsule-pill me-2 text-danger"></i>Prescriptions</span>
              <button className="btn-custom-primary btn-sm px-4" onClick={handleSubmitOrUpdate}>
                {isUpdate ? "Save Updates" : "Submit Prescription"}
              </button>
            </h4>

            {/* Add Medicine Form */}
            <div className="prescription-form-card mb-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold text-secondary small text-uppercase">Medicine Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter medicine name"
                    value={currentMedicine.name}
                    onChange={(e) => setCurrentMedicine({ ...currentMedicine, name: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-secondary small text-uppercase">Dose (e.g., 5ml)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter dose"
                    value={currentMedicine.dose}
                    onChange={(e) => setCurrentMedicine({ ...currentMedicine, dose: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-secondary small text-uppercase">Meal Time</label>
                  <select
                    className="form-select"
                    value={currentMedicine.meal}
                    onChange={(e) => setCurrentMedicine({ ...currentMedicine, meal: e.target.value })}
                  >
                    <option value="">Select Meal</option>
                    <option value="before">Before Meal</option>
                    <option value="after">After Meal</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-secondary small text-uppercase">Duration (Days)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g., 5"
                    value={currentMedicine.days}
                    onChange={(e) => setCurrentMedicine({ ...currentMedicine, days: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold text-secondary small text-uppercase mb-2 d-block">Session</label>
                  <div className="d-flex gap-4">
                    {["morning", "afternoon", "night"].map((time) => (
                      <div className="form-check custom-checkbox" key={time}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`session-${time}`}
                          checked={currentMedicine.session[time]}
                          onChange={(e) =>
                            setCurrentMedicine({
                              ...currentMedicine,
                              session: { ...currentMedicine.session, [time]: e.target.checked },
                            })
                          }
                        />
                        <label className="form-check-label text-capitalize" htmlFor={`session-${time}`}>
                          {time}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-12 mt-3 text-end">
                  <button className="btn btn-outline-primary px-4 fw-bold" style={{borderRadius: '50px'}} onClick={handleAddOrEditMedicine}>
                    <i className="bi bi-plus-circle me-2"></i>
                    {editingIndex !== null ? "Update Medicine" : "Add Medicine"}
                  </button>
                </div>
              </div>
            </div>

            {/* Medicine List Table */}
            <div className="medicine-list mt-2">
              {medicineData.medicines.length > 0 ? (
                <div className="table-responsive">
                  <table className="table prescription-table">
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Dose & Meal</th>
                        <th>Session</th>
                        <th>Days</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicineData.medicines.map((med, index) => (
                        <tr key={index}>
                          <td><span className="fw-bold">{med.name}</span></td>
                          <td>
                            <div>{med.dose}</div>
                            <small className="text-muted">{med.meal === 'before' ? 'Before Meal' : med.meal === 'after' ? 'After Meal' : med.meal}</small>
                          </td>
                          <td>
                            {med.session.morning && <span className="session-badge">Morning</span>}
                            {med.session.afternoon && <span className="session-badge">Afternoon</span>}
                            {med.session.night && <span className="session-badge">Night</span>}
                          </td>
                          <td>{med.days} days</td>
                          <td className="text-end">
                            <button className="action-btn btn-edit-med me-2" onClick={() => handleEditMedicine(index)} title="Edit">
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button className="action-btn btn-del-med" onClick={() => handleRemoveMedicine(index)} title="Remove">
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5 bg-light rounded-4 border">
                  <i className="bi bi-capsule text-muted mb-2" style={{fontSize: '2rem'}}></i>
                  <p className="text-muted mb-0">No medicines prescribed yet.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Vaccination History Section in its own row */}
      <div className="row g-4 mb-5">
        <div className="col-12">
          <div className="modern-card p-4">
            <h4 className="fw-bold mb-4 pb-2 border-bottom text-dark">
              <i className="bi bi-shield-check me-2 text-success"></i>Vaccination Status
            </h4>
            <div className="row">
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <h6 className="fw-bold text-success mb-3"><i className="bi bi-check-circle me-1"></i>Completed</h6>
                <div className="finished-vaccine custom-scrollbar">
                  {vaccinationDetails.finished.length > 0 ? (
                    vaccinationDetails.finished.map((vaccine, index) => (
                      <div className="vaccine-item completed shadow-sm" key={index}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold text-dark">{vaccine.vacciname}</span>
                          <span className="badge bg-success rounded-pill">{vaccine.age}</span>
                        </div>
                        <small className="text-muted">Dose: {vaccine.dose}</small>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted small italic">No completed vaccines.</p>
                  )}
                </div>
              </div>
              <div className="col-12 col-md-6">
                <h6 className="fw-bold text-warning mb-3"><i className="bi bi-clock-history me-1"></i>Upcoming</h6>
                <div className="upcoming-vaccine custom-scrollbar">
                  {vaccinationDetails.upcoming.length > 0 ? (
                    vaccinationDetails.upcoming.map((vaccine, index) => (
                      <div className="vaccine-item upcoming shadow-sm" key={index}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold text-dark">{vaccine.vacciname}</span>
                          <span className="badge bg-warning text-dark rounded-pill">{vaccine.age}</span>
                        </div>
                        <small className="text-muted">Dose: {vaccine.dose}</small>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted small italic">No upcoming vaccines.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ clear: 'both', height: '100px', width: '100%' }}></div>
    </div>
    </div>
  );
}

export default Chome;  