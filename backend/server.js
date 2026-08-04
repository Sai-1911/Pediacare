require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose'); // Declared once at the top
const cors = require('cors');
const cookieParser = require('cookie-parser');
const patientroutes = require('./routes/patient');
const medicineRoutes = require('./routes/medicine');
const slotRoutes = require('./routes/slot'); 
const vaccinationRotes=require('./routes/vaccination');
const dietRoutes=require('./routes/diet');
const chatRoutes = require('./routes/chat');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  // useNewUrlParser: true, 
  // useUnifiedTopology: true,
})
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

// Use Signup Routes
app.use('/patient', patientroutes); // Use the login route 
app.use('/slot', slotRoutes);
app.use('/vaccination',vaccinationRotes);
app.use('/medicine', medicineRoutes);
app.use('/diet',dietRoutes);
app.use('/chat', chatRoutes);

// Start Server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
