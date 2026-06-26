import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "bootstrap-icons/font/bootstrap-icons.css";
import './index.css';

function DietRecommend() {
  const [patientNo, setPatientNo] = useState('');
  const [meals, setMeals] = useState({
    breakfast: [''],
    midMorningSnack: [''],
    lunch: [''],
    eveningSnack: [''],
    dinner: [''],
  });

  const mealIcons = {
    breakfast: 'bi-brightness-alt-high icon-breakfast',
    midMorningSnack: 'bi-cup-hot icon-midMorningSnack',
    lunch: 'bi-sun icon-lunch',
    eveningSnack: 'bi-cup-straw icon-eveningSnack',
    dinner: 'bi-moon-stars icon-dinner'
  };

  const mealTitles = {
    breakfast: 'Breakfast',
    midMorningSnack: 'Mid-Morning Snack',
    lunch: 'Lunch',
    eveningSnack: 'Evening Snack',
    dinner: 'Dinner'
  };

  // Reset meals when patientNo changes
  useEffect(() => {
    if (patientNo === '') {
      setMeals({
        breakfast: [''],
        midMorningSnack: [''],
        lunch: [''],
        eveningSnack: [''],
        dinner: [''],
      });
    }
  }, [patientNo]);

  // Add a new dish to the specified meal type
  const addDish = (mealType) => {
    setMeals((prevMeals) => ({
      ...prevMeals,
      [mealType]: [...prevMeals[mealType], ''],
    }));
  };

  // Remove a dish from the specified meal type
  const removeDish = (mealType, index) => {
    const updatedDishes = meals[mealType].filter((_, i) => i !== index);
    setMeals((prevMeals) => ({
      ...prevMeals,
      [mealType]: updatedDishes,
    }));
  };

  // Handle input change for a specific dish in a specific meal type
  const handleDishChange = (mealType, index, value) => {
    const updatedMeals = { ...meals };
    updatedMeals[mealType][index] = value;
    setMeals(updatedMeals);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/diet/addOrUpdateDiet`, {
        patientNo,
        breakfast: meals.breakfast,
        midMorningSnack: meals.midMorningSnack,
        lunch: meals.lunch,
        eveningSnack: meals.eveningSnack,
        dinner: meals.dinner,
      });
      alert(response.data.message); // Alert on success
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || 'Something went wrong'));
    }
    setPatientNo("");
  };

  return (
    <div className="diet-container">
      <div className="diet-wrapper">
        
        {/* Diet Form Card */}
        <div className="diet-card">
          <div className="diet-header">
            <h2><i className="bi bi-journal-medical"></i> Recommend Patient Diet</h2>
            <p>Create a custom meal plan for a specific patient by entering their ID.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="patient-input-group">
              <label>Patient ID Number</label>
              <i className="bi bi-search"></i>
              <input
                type="text"
                className="custom-input"
                placeholder="e.g. PAT-12345"
                value={patientNo}
                onChange={(e) => setPatientNo(e.target.value)}
                required
              />
            </div>

            <div className="meal-grid">
              {Object.keys(meals).map((mealType) => (
                <div key={mealType} className="meal-box">
                  <div className="meal-box-header">
                    <h5>
                      <i className={`bi ${mealIcons[mealType]}`}></i>
                      {mealTitles[mealType]}
                    </h5>
                    <button 
                      type="button" 
                      className="btn-add-dish" 
                      onClick={() => addDish(mealType)}
                      title="Add Dish"
                    >
                      <i className="bi bi-plus-lg"></i>
                    </button>
                  </div>
                  
                  <div className="dish-list">
                    {meals[mealType].map((dish, index) => (
                      <div className="dish-input-row" key={index}>
                        <input
                          type="text"
                          className="dish-input"
                          placeholder="e.g. Oatmeal with fruits"
                          value={dish}
                          onChange={(e) => handleDishChange(mealType, index, e.target.value)}
                        />
                        {meals[mealType].length > 1 && (
                          <button
                            type="button"
                            className="btn-remove-dish"
                            onClick={() => removeDish(mealType, index)}
                            title="Remove Dish"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="submit-btn-container">
              <button type="submit" className="submit-btn">
                <i className="bi bi-send-check"></i> Save Meal Plan
              </button>
            </div>
          </form>
        </div>

        {/* Preview Table Card */}
        <div className="diet-card preview-card">
          <div className="diet-header" style={{ marginBottom: '24px' }}>
            <h2><i className="bi bi-eye"></i> Meal Plan Preview</h2>
          </div>
          
          <div className="preview-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  {Object.keys(meals).map(mealType => (
                    <th key={mealType}>{mealTitles[mealType]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {Object.keys(meals).map((mealType) => (
                    <td key={mealType}>
                      <ul>
                        {meals[mealType].map((dish, index) => (
                          <li key={index}>
                            {dish || <em style={{opacity: 0.5}}>Empty</em>}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DietRecommend;
