// utils/calculateMealMacros.js

const mongoose = require('mongoose');
const FoodItem = require('../models/foodItem'); 
module.exports = async function calculateMealMacros(foodItems) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const item of foodItems) {
    const food = await mongoose.model('fooditem').findById(item.food);
    if (!food) continue;

    const qty = item.quantity || 1;

    totalCalories += food.calories * qty;
    totalProtein  += food.protein  * qty;
    totalCarbs    += food.carbs    * qty;
    totalFat      += food.fat      * qty;
  }

  return { totalCalories, totalProtein, totalCarbs, totalFat };
};
