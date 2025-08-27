const UserMeal = require('../models/userMeal');
const pendingMeal = require('../models/pendingMeal');
const Meal = require('../models/meal');

const isDuplicateInMyMeals = async (userId, mealName, foodItems) => {
  try {
    
    const existingMeal = await UserMeal.findOne({
      user: userId,
      name: { $regex: new RegExp(`^${mealName}$`, 'i') }
    });

    console.log(`myMeals check result: ${existingMeal ? 'FOUND' : 'NOT FOUND'}`);
    return { isDuplicate: !!existingMeal, existingMeal };
  } catch (err) {
    console.error('Error in isDuplicateInMyMeals:', err.message);
    return { isDuplicate: false, error: err.message };
  }
};

const isDuplicateInPendingMeals = async (userId, mealName) => {
  try {
    
    const existingMeal = await pendingMeal.findOne({
      submittedBy: userId,
      name: { $regex: new RegExp(`^${mealName}$`, 'i') }
    });
    return { isDuplicate: !!existingMeal, existingMeal };
  } catch (err) {
    return { isDuplicate: false, error: err.message };
  }
};

const isDuplicateInMealSchema = async (mealName) => {
  try {
    
    const existingMeal = await Meal.findOne({
      name: { $regex: new RegExp(`^${mealName}$`, 'i') }
    });

    return { isDuplicate: !!existingMeal, existingMeal };
  } catch (err) {
    return { isDuplicate: false, error: err.message };
  }
};

// Combined check for sharing - checks all three collections
const isDuplicateForSharing = async (userId, mealName, excludeMealId = null) => {
  try {

    // Check in pending meals
    const pendingCheck = await isDuplicateInPendingMeals(userId, mealName);
    if (pendingCheck.isDuplicate) {
      return { isDuplicate: true, source: 'pendingMeals', existingMeal: pendingCheck.existingMeal };
    }

    // Check in main meal schema
    const mealCheck = await isDuplicateInMealSchema(mealName);
    if (mealCheck.isDuplicate) {
      return { isDuplicate: true, source: 'mealSchema', existingMeal: mealCheck.existingMeal };
    }

    return { isDuplicate: false };
  } catch (err) {
    return { isDuplicate: false, error: err.message };
  }
};

module.exports = { 
  isDuplicateInMyMeals, 
  isDuplicateInPendingMeals, 
  isDuplicateInMealSchema,
  isDuplicateForSharing 
};