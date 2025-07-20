const mongoose = require('mongoose');
const calculateMealMacros = require('../utils/calculateMealMacros');

const MealSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description:{type: String, default: ''},
  imageUrl: { type: String, default: '', trim: true },
  imageId: {type: String,default: null},
  foodItems: [
    {
      food: { type: mongoose.Schema.Types.ObjectId, ref: 'fooditem', required: true },
      quantity: { type: Number, default: 1, min: 0.1 }
    }
  ],
  totalCalories: { type: Number, default: 0 },
  totalProtein:  { type: Number, default: 0 },
  totalCarbs:    { type: Number, default: 0 },
  totalFat:      { type: Number, default: 0 }
}, { timestamps: true });

MealSchema.pre('save', async function (next) {
  const macros = await calculateMealMacros(this.foodItems);
  this.totalCalories = macros.totalCalories;
  this.totalProtein  = macros.totalProtein;
  this.totalCarbs    = macros.totalCarbs;
  this.totalFat      = macros.totalFat;
  next();
});

module.exports = mongoose.model('meal', MealSchema);
