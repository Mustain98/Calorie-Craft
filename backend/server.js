require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const foodItemRoute = require('./routes/fooditem');
const mealRoute=require('./routes/meal')
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// Route
app.use('/api/fooditem', foodItemRoute);
app.use('/api/meal',mealRoute);

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
