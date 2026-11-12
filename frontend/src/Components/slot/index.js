import React, { useEffect, useState } from 'react';
import "./index.css";
import axios from 'axios';

function Slots() {
  const [slots, setSlots] = useState([]);
  const [date] = useState(new Date().toISOString().split('T')[0]); // Default to today's date
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch slots for the current date
    const fetchSlots = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/slot/getbookedslot?date=${date}`);
        setSlots(response.data.slots);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching slots');
        setLoading(false);
      }
    };

    fetchSlots();
  }, [date]);

  return (
    <div className="container py-5" style={{fontFamily: "'Nunito', sans-serif"}}>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-2">
        <h2 className="fw-bold" style={{color: '#0077B6'}}>Today's Schedule</h2>
        <div className="bg-light px-4 py-2 rounded-pill shadow-sm">
          <span className="fw-bold text-secondary me-2">Date:</span>
          <span className="text-primary fw-bold">{date}</span>
        </div>
      </div>

      <div className="modern-card p-4">
        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <h5 className="text-secondary">Loading slots...</h5>
          </div>
        ) : error ? (
          <div className="alert alert-danger shadow-sm border-0" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        ) : slots.length > 0 ? (
          <div className="d-flex flex-column gap-3">
            {slots.map((slot, i) => (
              <div
                key={slot._id}
                className={`p-3 rounded-4 shadow-sm border-start border-4 ${
                  slot.done ? 'border-success bg-success bg-opacity-10' : 'border-primary bg-white'
                }`}
                style={{transition: 'transform 0.2s ease', cursor: 'pointer'}}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                  <div className="d-flex align-items-center gap-4">
                    <h3 className="mb-0 text-muted" style={{width: '30px'}}>#{i + 1}</h3>
                    <div>
                      <h5 className="mb-1 fw-bold text-dark">{slot.name} <small className="text-muted fw-normal">({slot.parentName})</small></h5>
                      <div className="d-flex gap-3 text-secondary" style={{fontSize: '0.9rem'}}>
                        <span><i className="bi bi-clock-fill me-1 text-primary"></i> {slot.slot} ({slot.session})</span>
                        <span><i className="bi bi-bookmark-fill me-1 text-warning"></i> {slot.service}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-end mt-2 mt-md-0">
                    <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill">ID: {slot.appId}</span>
                    {slot.done && <span className="badge bg-success ms-2 px-3 py-2 rounded-pill"><i className="bi bi-check-circle-fill me-1"></i>Completed</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-5 bg-light rounded-4">
            <i className="bi bi-calendar-x text-muted" style={{fontSize: '3rem'}}></i>
            <h4 className="mt-3 text-secondary">No Appointments Today</h4>
            <p className="text-muted">You have a clear schedule for the selected date.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Slots;
