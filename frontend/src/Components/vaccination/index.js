import React, { useState, useEffect } from 'react';
import "./index.css";
import Vacci from "./vacciimg.png";

function Vaccination() {
  const [vaccinationData, setVaccinationData] = useState([]);
  const [completedVaccines, setCompletedVaccines] = useState([]);
  
  const userId = JSON.parse(localStorage.getItem('user'))._id;

  useEffect(() => {
    fetchVaccinationData();
  }, []);

  // Fetch vaccination data from the backend
  const fetchVaccinationData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/vaccination/getVaccinationDetails/${userId}`);
      const data = await response.json();

      if (data.success) {
        const pending = data.data.vaccination.filter(vaccine => vaccine.availability);
        const completed = data.data.vaccination.filter(vaccine => !vaccine.availability);

        setVaccinationData(pending);
        setCompletedVaccines(completed);
      } else {
        console.error('No vaccination data found for this user');
      }
    } catch (error) {
      console.error('Error fetching vaccination data:', error);
    }
  };

  // Update vaccination status
  const updateVaccinationStatus = async (vacciname) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/vaccination/vaccineStatus`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, vacciname, availability: false }),
      });

      const data = await response.json();

      if (data.success) {
        fetchVaccinationData(); // Refresh data after successful update
      } else {
        console.error('Failed to update vaccination status:', data.message);
      }
    } catch (error) {
      console.error('Error updating vaccination status:', error);
    }
  };

  // Remove vaccination status and make it available again
  const removeVaccinationStatus = async (vacciname) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/vaccination/vaccineStatus`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, vacciname, availability: true }),
      });

      const data = await response.json();

      if (data.success) {
        fetchVaccinationData(); // Refresh data after successful update
      } else {
        console.error('Failed to update vaccination status:', data.message);
      }
    } catch (error) {
      console.error('Error updating vaccination status:', error);
    }
  };

  return (
    <div className='container py-5 vaccination-container'>
      <div className='vaccination-hero'>
        <div className='row align-items-center'>
          <div className='col-12 col-lg-7 order-2 order-lg-1'>
            <h3><i className="bi bi-shield-check me-2 text-primary"></i>Why do we need Vaccination?</h3>
            <p className='mb-4'>
              Vaccinations are a vital part of a child’s health and well-being. They protect children from serious and
              potentially life-threatening diseases by strengthening their immune system to fight infections. Vaccines
              not only safeguard your child but also help prevent the spread of diseases within the community, creating a
              safer environment for everyone. Early vaccination ensures your baby is protected during their most
              vulnerable years, giving you peace of mind and supporting their healthy development.
            </p>
            <h5 className='text-dark fw-bold mb-3'>
              <i className="bi bi-heart-pulse me-2 text-danger"></i>The Importance of Vaccination
            </h5>
            <p className='mb-0'>
              Vaccination is one of the most effective ways to ensure your child’s long-term health and protect them from
              preventable diseases. From the earliest stages of life, vaccines prepare the immune system to recognize and
              combat harmful viruses and bacteria. By adhering to a proper immunization schedule, you not only protect
              your child but also contribute to the overall health of the community.
            </p>
          </div>
          <div className='col-12 col-lg-5 order-1 order-lg-2 mb-4 mb-lg-0 text-center'>
            <img className='img-fluid rounded-4 shadow-sm' src={Vacci} alt="Vaccination illustration" style={{maxHeight: '350px'}} />
          </div>
        </div>
      </div>

      <div className='text-center mb-5'>
        <h2 className='fw-bold' style={{color: '#0077B6'}}>Your Child's Immunization Schedule</h2>
        <p className='text-muted'>Track and manage your child's vaccinations easily.</p>
      </div>

      <div className="row g-4">
        {/* Pending Vaccinations */}
        <div className="col-12 col-lg-6">
          <div className="bg-white p-4 rounded-4 shadow-sm h-100">
            <h4 className="fw-bold mb-4 text-dark border-bottom pb-3">
              <i className="bi bi-clock-history me-2 text-warning"></i>Pending Vaccinations
            </h4>
            <div className="vacci-list pe-2">
              {vaccinationData.length === 0 ? (
                <div className="text-center p-4">
                  <i className="bi bi-check2-circle text-success" style={{fontSize: '3rem'}}></i>
                  <p className="mt-2 text-muted fw-bold">All caught up! No pending vaccinations.</p>
                </div>
              ) : (
                vaccinationData.map(({ age, vacciname, dose, availability }) => (
                  <div key={vacciname} className="vaccine-card d-flex flex-column justify-content-between">
                    <div>
                      <h6><i className="bi bi-calendar-event me-2"></i>{age}</h6>
                      <p className="mb-2">
                        {vacciname} <span className="text-muted fw-normal ms-1">- {dose}</span>
                      </p>
                      <div className="mb-3">
                        <span className={`badge ${availability ? 'bg-success' : 'bg-secondary'}`}>
                          {availability ? 'Available Now' : 'Not Available Yet'}
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn-mark-completed w-100"
                      onClick={() => updateVaccinationStatus(vacciname)}
                      disabled={!availability}
                    >
                      <i className="bi bi-check-circle me-2"></i>Mark as Completed
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Completed Vaccinations */}
        <div className="col-12 col-lg-6">
          <div className="bg-light p-4 rounded-4 shadow-sm border h-100">
            <h4 className="fw-bold mb-4 text-dark border-bottom pb-3">
              <i className="bi bi-shield-check me-2 text-success"></i>Completed Vaccinations
            </h4>
            <div className="comp-vacci-list pe-2">
              {completedVaccines.length === 0 ? (
                <div className="text-center p-4">
                  <i className="bi bi-shield-x text-muted" style={{fontSize: '3rem'}}></i>
                  <p className="mt-2 text-muted">No vaccinations completed yet.</p>
                </div>
              ) : (
                completedVaccines.map(({ age, vacciname }) => (
                  <div key={vacciname} className='vaccine-card completed d-flex justify-content-between align-items-center'>
                    <div>
                      <h6 className='text-success mb-1'><i className="bi bi-calendar-check me-2"></i>{age}</h6>
                      <p className="mb-0 fw-bold text-dark">{vacciname}</p>
                    </div>
                    <button
                      className='btn-remove-completed'
                      onClick={() => removeVaccinationStatus(vacciname)}
                      title="Undo Completion"
                    >
                      <i className="bi bi-arrow-counterclockwise"></i> Undo
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Vaccination;
