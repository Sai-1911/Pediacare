import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './index.css';

function Personal() {
const[error,setError]= useState("");
const navigate= useNavigate();

  const [formData, setFormData] = useState({
    childName: '',
    fatherName: '',
    motherName: '',
    dob: '',
    gender: '',
    phone: '',
    height: '',
    weight: '',
    address: '',
  });

  // Fetch data from server when the component is mounted
  useEffect(() => {
    const fetchPatientData = async () => {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData && userData._id) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/patient/getPatient?pId=${userData._id}`);
          if (response.ok) {
            const data = await response.json();
            const patient = data.patient;
            if (patient) {
              setFormData({
                childName: patient.name || '',
                fatherName: patient.fatherName || '',
                motherName: patient.motherName || '',
                dob: patient.dob ? patient.dob.substring(0, 10) : '',
                gender: patient.gender || '',
                phone: patient.mobile || '',
                height: patient.height || '',
                weight: patient.weight || '',
                address: patient.address || '',
              });
            }
          }
        } catch (err) {
          console.error("Error fetching patient info:", err);
        }
      }
    };
    fetchPatientData();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission to handle it manually
  
    const userId = JSON.parse(localStorage.getItem('user'))?._id; // Access _id from localStorage
    console.log('LocalStorage User:', JSON.parse(localStorage.getItem('user')));
    console.log('Payload being sent:', formData);
  
    if (!userId) {
      setError('User not logged in or invalid user data');
      return;
    }
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/patient/updatePatient/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
  
      const responseData = await response.json();
      console.log('Response from server:', responseData);
  
      if (response.ok) {
        // Optionally update the name in localStorage if it changed
        const userData = JSON.parse(localStorage.getItem('user')) || {};
        if (formData.childName) {
          userData.name = formData.childName;
          localStorage.setItem('user', JSON.stringify(userData));
        }
  
        console.log('Patient data updated');
        alert('Patient data updated successfully!');
      } else {
        setError(responseData.error || 'Failed to update');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }

    navigate('/Home');
  };
  
  

  return (
    <div className="personal-info-wrapper">
      <div className="glass-container">
        <div className="glass-header">
          <div className="avatar-wrapper">
            <div className="avatar">
              {formData.childName ? formData.childName.charAt(0).toUpperCase() : 'P'}
            </div>
            <div className="avatar-ring"></div>
          </div>
          <h2>Patient Profile</h2>
          <p>Manage your personal and medical information</p>
        </div>

        <form onSubmit={handleSubmit} className="modern-form">
          <div className="form-section">
            <h3 className="section-title">Personal Details</h3>
            <div className="form-grid">
              <div className="input-group-modern">
                <label>Child's Name</label>
                <input type="text" name="childName" value={formData.childName} onChange={handleChange} placeholder="Enter child's name" required />
              </div>
              <div className="input-group-modern">
                <label>Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
              </div>
              <div className="input-group-modern">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Guardian Information</h3>
            <div className="form-grid">
              <div className="input-group-modern">
                <label>Father's Name</label>
                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Father's full name" />
              </div>
              <div className="input-group-modern">
                <label>Mother's Name</label>
                <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} placeholder="Mother's full name" />
              </div>
              <div className="input-group-modern">
                <label>Contact Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Primary phone number" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Vitals & Address</h3>
            <div className="form-grid">
              <div className="input-group-modern">
                <label>Height (cm)</label>
                <input type="text" name="height" value={formData.height} onChange={handleChange} placeholder="e.g. 120" />
              </div>
              <div className="input-group-modern">
                <label>Weight (kg)</label>
                <input type="text" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 25" />
              </div>
              <div className="input-group-modern full-width">
                <label>Residential Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Enter full address" rows="3"></textarea>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit-modern">
              Save Changes
              <span className="btn-icon">→</span>
            </button>
            {error && <div className="error-message">{error}</div>}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Personal;
