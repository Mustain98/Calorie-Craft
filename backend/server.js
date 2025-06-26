require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const foodItemRoute = require('./routes/fooditem');
const mealRoute=require('./routes/meal');
const timedMealRoute=require('./routes/timedMeal');
const dayPlanRoute=require('./routes/dayPlan');


const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());

// Route
app.use('/api/fooditem', foodItemRoute);
app.use('/api/meal',mealRoute);
app.use('/api/timedMeal',timedMealRoute);
app.use('/api/dayPlan',dayPlanRoute);

// Connect to MongoDB and then start server
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
        console.log('🚀 Server running on', PORT);
    });
})
.catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
});
