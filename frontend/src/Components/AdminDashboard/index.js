import React, { useState, useEffect } from "react";
import "./index.css";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSlots: 0,
    finishedSlots: 0,
    remainingBookedSlots: 0,
    unbookedSlots: 0,
  });

  const [scheduleForm, setScheduleForm] = useState({
    startDate: "",
    endDate: "",
    session: "Morning",
    startTime: "08:00",
    endTime: "12:00",
    interval: 15,
  });

  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [message, setMessage] = useState("");

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const response = await fetch(`${process.env.REACT_APP_API_URL}/slot/dashboardStats?date=${today}`);
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats({
        totalSlots: data.totalSlots || 0,
        finishedSlots: data.finishedSlots || 0,
        remainingBookedSlots: data.remainingBookedSlots || 0,
        unbookedSlots: data.unbookedSlots || 0,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleChange = (e) => {
    setScheduleForm({ ...scheduleForm, [e.target.name]: e.target.value });
  };

  const generateSlots = (start, end, interval) => {
    const slots = [];
    let current = new Date(`2000-01-01T${start}:00`);
    const endTime = new Date(`2000-01-01T${end}:00`);

    while (current < endTime) {
      const hours = String(current.getHours()).padStart(2, "0");
      const minutes = String(current.getMinutes()).padStart(2, "0");
      slots.push(`${hours}:${minutes}`);
      current.setMinutes(current.getMinutes() + Number(interval));
    }
    return slots;
  };

  const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      dates.push(new Date(current).toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleForm.startDate || !scheduleForm.endDate) {
      setMessage("Please select start and end dates.");
      return;
    }

    const slots = generateSlots(scheduleForm.startTime, scheduleForm.endTime, scheduleForm.interval);
    const dates = getDatesInRange(scheduleForm.startDate, scheduleForm.endDate);

    try {
      setLoadingSubmit(true);
      setMessage("");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/slot/createSchedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dates,
          session: scheduleForm.session,
          slots,
        }),
      });

      if (!response.ok) throw new Error("Failed to create schedule");
      setMessage(`Successfully created ${scheduleForm.session} schedule for ${dates.length} day(s) with ${slots.length} slots each.`);
      fetchStats(); // refresh stats
    } catch (error) {
      console.error(error);
      setMessage("Error creating schedule. Please try again.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="admin-dashboard-wrapper pt-4" style={{ minHeight: "100vh" }}>
      <div className="container pb-5 mb-5 clinic-dashboard-container">
        
        {/* Title */}
        <div className="text-center mb-5">
          <h2 className="fw-bold" style={{ color: "#0077B6" }}>
            <i className="bi bi-speedometer2 me-2"></i>Admin Dashboard
          </h2>
          <p className="text-muted">Manage daily and weekly schedules & track today's appointments.</p>
        </div>

        {/* Stats Row */}
        <div className="row g-4 mb-5">
          <div className="col-md-3 col-sm-6">
            <div className="stat-card bg-primary text-white shadow-sm h-100 p-4 rounded-4 text-center">
              <i className="bi bi-calendar-event fs-1 mb-2"></i>
              <h3 className="fw-bold">{loadingStats ? "..." : stats.totalSlots}</h3>
              <p className="mb-0">Total Slots Today</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="stat-card bg-success text-white shadow-sm h-100 p-4 rounded-4 text-center">
              <i className="bi bi-check-circle fs-1 mb-2"></i>
              <h3 className="fw-bold">{loadingStats ? "..." : stats.finishedSlots}</h3>
              <p className="mb-0">Finished Appts</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="stat-card bg-warning text-dark shadow-sm h-100 p-4 rounded-4 text-center">
              <i className="bi bi-clock-history fs-1 mb-2"></i>
              <h3 className="fw-bold">{loadingStats ? "..." : stats.remainingBookedSlots}</h3>
              <p className="mb-0">Remaining Booked</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="stat-card bg-info text-white shadow-sm h-100 p-4 rounded-4 text-center">
              <i className="bi bi-door-open fs-1 mb-2"></i>
              <h3 className="fw-bold">{loadingStats ? "..." : stats.unbookedSlots}</h3>
              <p className="mb-0">Unbooked Slots</p>
            </div>
          </div>
        </div>

        {/* Create Schedule Section */}
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="modern-card p-4 shadow-sm rounded-4">
              <h4 className="fw-bold mb-4 pb-2 border-bottom text-dark">
                <i className="bi bi-calendar-plus me-2 text-primary"></i>Generate Schedule
              </h4>
              
              {message && (
                <div className={`alert ${message.includes("Error") ? "alert-danger" : "alert-success"} alert-dismissible fade show`} role="alert">
                  {message}
                  <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
                </div>
              )}

              <form onSubmit={handleCreateSchedule}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-secondary small text-uppercase">Start Date</label>
                    <input type="date" className="form-control" name="startDate" value={scheduleForm.startDate} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-secondary small text-uppercase">End Date (Optional for single day)</label>
                    <input type="date" className="form-control" name="endDate" value={scheduleForm.endDate} onChange={handleChange} />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-bold text-secondary small text-uppercase">Session</label>
                    <select className="form-select" name="session" value={scheduleForm.session} onChange={handleChange}>
                      <option value="Morning">Morning</option>
                      <option value="Evening">Evening</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold text-secondary small text-uppercase">Start Time</label>
                    <input type="time" className="form-control" name="startTime" value={scheduleForm.startTime} onChange={handleChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold text-secondary small text-uppercase">End Time</label>
                    <input type="time" className="form-control" name="endTime" value={scheduleForm.endTime} onChange={handleChange} required />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-bold text-secondary small text-uppercase">Interval (Mins)</label>
                    <input type="number" className="form-control" name="interval" value={scheduleForm.interval} onChange={handleChange} required min="5" max="120" />
                  </div>
                  
                  <div className="col-12 mt-4 text-end">
                    <button type="submit" className="btn btn-primary px-4 fw-bold" style={{ borderRadius: "50px" }} disabled={loadingSubmit}>
                      {loadingSubmit ? (
                        <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Generating...</span>
                      ) : (
                        <span><i className="bi bi-save me-2"></i>Save Schedule</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
