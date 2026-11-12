const { PatientModel, CounterModel }= require('../models/patient'); // Declare only once
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST Route for Signup
const getNextPatientNo = async () => {
  const counter = await CounterModel.findOneAndUpdate(
    { name: 'patientNo' }, // Search for the patient number counter
    { $inc: { value: 1 } }, // Increment the value
    { new: true, upsert: true } // Create if not exists
  );
  return counter.value;
};

// POST Route for Signup
const signup = async (req, res) => {
  const { email, password, mobile, name } = req.body;

  try {
    const existingPatientByEmail = await PatientModel.findOne({ email });
    const existingPatientByMobile = await PatientModel.findOne({ mobile });

    if (existingPatientByEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    if (existingPatientByMobile) {
      return res.status(400).json({ error: 'Mobile number already exists' });
    }

    // Get next patient number
    const patientNo = await getNextPatientNo();

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save new patient
    const newPatient = new PatientModel({
      patientNo,
      email,
      password: hashedPassword, // Ensure this is hashed in production
      mobile,
      name,
    });

    await newPatient.save();

    // Generate JWT token
    const token = jwt.sign(
      { _id: newPatient._id, patientNo: newPatient.patientNo },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      _id: newPatient._id,
      patientNo: newPatient.patientNo,
      name: newPatient.name,
      email: newPatient.email,
      mobile: newPatient.mobile,
      token: token
    });
  } catch (error) {
    console.error('Signup error:', error.message); // Log the error message
    res.status(500).json({ error: 'Failed to save patient', details: error.message });
  }
};





// POST Route for Login
const login = async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or mobile

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Please enter email/mobile and password.' });
  }

  const cleanIdentifier = identifier.trim();

  try {
    const escapedIdentifier = cleanIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await PatientModel.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${escapedIdentifier}$`, 'i') } },
        { mobile: cleanIdentifier },
      ],
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email/mobile or password.' });
    }

    let isMatch = false;
    // Check if the password is a bcrypt hash (starts with $2b$, $2a$, or $2y$)
    if (typeof user.password === 'string' && (user.password.startsWith('$2b$') || user.password.startsWith('$2a$') || user.password.startsWith('$2y$'))) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Fallback for existing plaintext passwords
      isMatch = (user.password === password);
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email/mobile or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, patientNo: user.patientNo },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      token: token,
      user: {
        _id: user._id,
        patientNo: user.patientNo,
        name: user.name,
        email: user.email,
        mobile: user.mobile
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};


// GET Route to Fetch All Signup Data
const getPatients = async (req, res) => {
  try {
    const patients = await PatientModel.find();
    res.json(patients);
  } catch (error) {
    console.error('Error retrieving patients:', error);
    res.status(500).send('Error retrieving data');
  }
};

// Update Patient by ID
const updatePatient = async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  try {
    const updatedPatient = await PatientModel.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.status(200).json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
};


// DELETE Route to Remove a Patient
const deletePatient = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedPatient = await PatientModel.findByIdAndDelete(id);
    if (!deletedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully', patient: deletedPatient });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
};
//for clinic fetch data
const getPatientDetails = async (req, res) => {
  let { pId } = req.query; // Retrieve the patient ID from query params

  if (!pId) {
    return res.status(400).json({ error: "pId is required." });
  }

  // Trim any whitespace or newline characters
  pId = pId.trim();

  try {
    // Search by _id
    const patient = await PatientModel.findOne({ _id: pId });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found." });
    }

    res.status(200).json({
      patient,
    });
  } catch (error) {
    console.error("Error fetching patient details:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};



module.exports = {
  signup,
  login,
  getPatients,
  updatePatient,
  deletePatient,
  getPatientDetails
};
