const mongoose = require('mongoose');

const WeekPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  startDate: {
    type: Date,
    required: true
  },
  days: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DayPlan'
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('WeekPlan', WeekPlanSchema);
