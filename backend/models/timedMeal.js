const mongoose = require('mongoose');

const TimedMealSchema = new mongoose.Schema({
  name: {
    type: String, // e.g., 'breakfast', 'lunch', 'snack1'
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

module.exports = mongoose.model('TimedMeal', TimedMealSchema);
