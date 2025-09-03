require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const adminRoutes = require('./src/routes/admin');
const mealRoute = require('./src/routes/meal');
const foodItemRoute = require('./src/routes/fooditem');


const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ 
  origin: ['http://localhost:3002',
    'https://calorie-craft-admin-frontend.onrender.com',
    'https://calorie-craft-frontend-admin-2.onrender.com'
  ]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  next();
});
app.use('/api/admin', adminRoutes);
app.use('/api/meal',mealRoute);
app.use('/api/fooditem', foodItemRoute);

app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB (admin)');
    app.listen(PORT, () => console.log(`🚀 Admin server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error (admin):', err.message);
  });
