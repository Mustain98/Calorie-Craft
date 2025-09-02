const mongoose=require('mongoose')

const WeekPlanSchema = new mongoose.Schema({
  days: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'dayPlan'
    }
  ]
}, { timestamps: true });

module.exports=mongoose.model('weekPlan',WeekPlanSchema)
