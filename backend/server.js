require('dotenv').config();
const express = require('express');
const cors=require('cors');
const mongoose = require('mongoose');
//routes
const foodItemRoute = require('./routes/fooditem');
const mealRoute=require('./routes/meal');
const timedMealRoute=require('./routes/timedMeal');
const dayPlanRoute=require('./routes/dayPlan');
const weekPlanRoute=require('./routes/weekPlan');
const userRoute=require('./routes/user');

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.urlencoded({ extended: true }));


// Route
app.use('/api/fooditem', foodItemRoute);
app.use('/api/meal',mealRoute);
app.use('/api/timedMeal',timedMealRoute);
app.use('/api/dayPlan',dayPlanRoute);
app.use('/api/weekPlan',weekPlanRoute);
app.use('/api/users',userRoute);

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
