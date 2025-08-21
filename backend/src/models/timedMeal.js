const mongoose = require('mongoose');

const TimedMealSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: true,
  },
  meals: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'meal',
    }
  ],
  totalCalories: {
    type: Number,
    default: 0
  },
  totalProtein: {
    type: Number,
    default: 0
  },
  totalCarbs: {
    type: Number,
    default: 0
  },
  totalFat: {
    type: Number,
    default: 0
  }
}, { timestamps: true });
TimedMealSchema.pre('save', async function (next) {
  const timedMeal = this;

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  // Populate and calculate macros
  for (const mealId of timedMeal.meals) {
    const meal = await mongoose.model('meal').findById(mealId);
    if (!meal) continue;

    totalCalories += meal.totalCalories || 0;
    totalProtein  += meal.totalProtein  || 0;
    totalCarbs    += meal.totalCarbs    || 0;
    totalFat      += meal.totalFat      || 0;
  }

  // Assign calculated totals
  timedMeal.totalCalories = totalCalories;
  timedMeal.totalProtein  = totalProtein;
  timedMeal.totalCarbs    = totalCarbs;
  timedMeal.totalFat      = totalFat;

  next();
});
module.exports = mongoose.model('timedMeal', TimedMealSchema);
