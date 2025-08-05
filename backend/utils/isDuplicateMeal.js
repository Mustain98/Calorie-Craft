const PendingMeal = require('../models/pendingMeal');
const Meal = require('../models/meal');
const User = require('../models/user');



// Check in public/system meals (exact match on name + foodItems)

// Check in pending meals (only check name + submittedBy, ignore foodItems)
const isDuplicateInPendingMeals = async (userId, name) => {
  const pendingMeal = await PendingMeal.findOne({ name, submittedBy: userId });
  const systemMeal = await Meal.findOne({name});
  if (pendingMeal||systemMeal) {
    return true;
  }
  return false;
};


// Check in user's saved meals (duplicate if either name matches OR foodItems match)
const isDuplicateInMyMeals = async (userId, mealName) => {
  const user = await User.findById(userId);
  if (!user) return { isDuplicate: false };

  for (const meal of user.myMeals) {
    if (meal.name === mealName) {
      return { isDuplicate: true, source: 'myMeals (name)' };
    }
  }

  return { isDuplicate: false };
};


module.exports = {
  isDuplicateInPendingMeals,
  isDuplicateInMyMeals
};
