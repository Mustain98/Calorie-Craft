require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
//routes
const foodItemRoute = require("./src/routes/fooditem");
const mealRoute = require("./src/routes/meal");
const timedMealRoute = require("./src/routes/timedMeal");
const dayPlanRoute = require("./src/routes/dayPlan");
const weekPlanRoute = require("./src/routes/weekPlan");
const userRoute = require("./src/routes/user");

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://calorie-craft-9ii6.onrender.com",
      "http://localhost:3000",
    ],
    credentials: true, // only needed if you use cookies/auth
  })
);

app.use(express.urlencoded({ extended: true }));

// Route
app.use("/api/fooditem", foodItemRoute);
app.use("/api/meal", mealRoute);
app.use("/api/timed-meals", timedMealRoute);
app.use("/api/dayPlan", dayPlanRoute);
app.use("/api/weekPlans", weekPlanRoute);
app.use("/api/users", userRoute);

// Connect to MongoDB and then start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log("🚀 Server running on", PORT);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
