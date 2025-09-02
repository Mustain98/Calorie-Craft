const mongoose = require('mongoose');
const timedMeal = require('./timedMeal');

const DayPlanSchema = new mongoose.Schema({
  day: {
  type: String,
  enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  required: true,
  },
  timedMeals: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'timedMeal'
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

DayPlanSchema.pre('save', async function (next) {
  const dayPlan = this;

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const timedMealId of dayPlan.timedMeals) {
    const timedMeal = await mongoose.model('timedMeal').findById(timedMealId);
    if (!timedMeal) continue;

    totalCalories += timedMeal.totalCalories || 0;
    totalCarbs    += timedMeal.totalCarbs    || 0;
    totalProtein  += timedMeal.totalProtein  || 0;
    totalFat      += timedMeal.totalFat      || 0;
  }

  dayPlan.totalCalories = totalCalories;
  dayPlan.totalCarbs    = totalCarbs;
  dayPlan.totalProtein  = totalProtein;
  dayPlan.totalFat      = totalFat;

  next();
});

module.exports = mongoose.model('dayPlan', DayPlanSchema);
