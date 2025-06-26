const mongoose = require('mongoose');

const DayPlanSchema = new mongoose.Schema({
  date: {
    type: Date,
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

module.exports = mongoose.model('dayPlan', DayPlanSchema);
