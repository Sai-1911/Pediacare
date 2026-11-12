import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./index.css";

function Service() {
  const [startDate, setStartDate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    parentName: "",
    age: "",
    session: "Choose...",
    slot: "",
    service: "Vaccination",
    pId: "",
  });
  const navigate = useNavigate(); 
  const [availableSlots, setAvailableSlots] = useState([]);
  const [, setBookedSlots] = useState([]);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [message, setMessage] = useState("");

  // Calculate today's date and the maximum date (4 days from now)
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 4);

  // Retrieve user data from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user._id) {
      setFormData((prev) => ({ ...prev, pId: user._id }));
    }
  }, []);

  // Fetch available slots dynamically when date or session changes
  useEffect(() => {
    if (startDate && formData.session !== "Choose...") {
      fetchAvailableSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, formData.session]);

  const fetchAvailableSlots = async () => {
    if (!startDate || formData.session === "Choose...") {
      setMessage("Please select a date and session.");
      return;
    }
    
    console.log("startDate selected: ", startDate);
    
    // Format the selected date to YYYY-MM-DD manually to avoid timezone issues
    const formattedDate = startDate.getFullYear() + '-' 
      + String(startDate.getMonth() + 1).padStart(2, '0') + '-' 
      + String(startDate.getDate()).padStart(2, '0');
      
    console.log("Formatted date:", formattedDate);
    console.log(`📅 Requesting slots for: ${formattedDate} ${formData.session}`);
  
    const url = `${process.env.REACT_APP_API_URL}/slot/availability?date=${formattedDate}&session=${formData.session}`;
    console.log("Request URL:", url);
    
    setLoadingSlots(true);
    
    try {
      const response = await fetch(url);
      const data = await response.json();
    
      console.log("📢 Fetched Data from API:", data);
    
      if (response.ok) {
        // Filter out booked slots from the available slots
        const availableSlots = data.slots.filter(
          (slot) => !data.bookedSlots.includes(slot)
        );
    
        console.log(`✅ Available Slots for ${formattedDate} (${formData.session}):`, availableSlots);
        console.log(`❌ Booked Slots for ${formattedDate} (${formData.session}):`, data.bookedSlots);
    
        setAvailableSlots(availableSlots);
        setBookedSlots(data.bookedSlots);
    
        setMessage(availableSlots.length ? "" : "No slots available for the selected session.");
      } else {
        setMessage(data.error || "Error fetching slots.");
      }
    } catch (error) {
      setMessage("Failed to fetch slots. Please try again later.");
    } finally {
      setLoadingSlots(false);
    }
  };
  
  
  
 
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    console.log("Updated Session:", e.target.value);
  };

  const handleSlotSelect = (slot) => {
    setFormData({ ...formData, slot });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.parentName ||
      !formData.age ||
      !formData.session ||
      !formData.slot ||
      !formData.service ||
      !formData.pId
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const formattedDate = startDate.toLocaleDateString("en-CA"); // YYYY-MM-DD format

    const requestData = {
      date: formattedDate,
      slot: formData.slot,
      name: formData.name,
      parentName: formData.parentName,
      age: formData.age,
      session: formData.session,
      service: formData.service,
      pId: formData.pId,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/slot/bookslot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Slot booked successfully!");

        // Save booking details in localStorage
        const bookedDetails = JSON.parse(localStorage.getItem("bookedDetails")) || [];
        bookedDetails.push(requestData);
        localStorage.setItem("bookedDetails", JSON.stringify(bookedDetails));

        // Remove the booked slot from available slots
        setAvailableSlots((prev) => prev.filter((slot) => slot !== formData.slot));
        navigate("/appointment");
      } else {
        alert(data.error || "Failed to book slot.");
      }
    } catch (error) {
      alert("Failed to book slot. Please try again later.");
    }
  }; 
  return (
    <div className="container px-4">
      <div className="modern-form-container">
        <h1 className="modern-form-title">Book a Slot</h1>
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <div className="modern-input-group">
                <label className="modern-label">Select Date:</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  className="modern-input"
                  minDate={today}
                  maxDate={maxDate}
                  placeholderText="Click to select a date"
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="modern-input-group">
                <label className="modern-label">Session:</label>
                <select
                  name="session"
                  value={formData.session}
                  onChange={handleInputChange}
                  className="modern-select"
                >
                  <option value="Choose...">Choose...</option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="modern-input-group">
                <label className="modern-label">Child's Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="modern-input"
                  placeholder="Enter child's name"
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="modern-input-group">
                <label className="modern-label">Parent's Name:</label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  className="modern-input"
                  placeholder="Enter parent's name"
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="modern-input-group">
                <label className="modern-label">Age:</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="modern-input"
                  placeholder="Child's age in years"
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="modern-input-group">
                <label className="modern-label">Service Type:</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  className="modern-select"
                >
                  <option value="Vaccination">Vaccination</option>
                  <option value="Checkup">Checkup</option> 
                </select>
              </div>
            </div>

            <div className="col-12 mt-4">
              <h5 className="modern-label mb-3 border-bottom pb-2">Available Slots</h5>
              {loadingSlots ? (
                <div className="d-flex align-items-center text-primary">
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  <span>Loading available slots...</span>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`slot-btn ${formData.slot === slot ? "selected" : ""}`}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="alert alert-light text-muted border-0 bg-light rounded-3">
                  <i className="bi bi-info-circle me-2"></i>
                  {message || "No slots available for the selected date and session."}
                </div>
              )}
            </div>

            <div className="col-12 mt-4">
              <button type="submit" className="btn-book-primary shadow-sm">
                Confirm Booking
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Service;