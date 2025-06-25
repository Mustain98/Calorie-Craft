const mongoose = require('mongoose');

const TimedMealSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack1', 'snack2', 'snack3'],
  },
  meal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'meal',
    required: true,
  }
});
//need to add macros requirement from user
module.exports = TimedMealSchema; 
