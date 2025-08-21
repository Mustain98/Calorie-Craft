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
  totalFat:      { type: Number, default: 0 },
  portionSize:   { type: Number, required:true},
  categories: [{
  type: String,
  enum: ['breakfast', 'lunch', 'dinner', 'snack', 'main dish', 'side dish', 'dessert', 'drink']
  }],
  macroCategory: { 
    type: String, 
    enum: ['protein', 'carb', 'fat', 'balanced'],
    default: 'balanced' 
  }

}, { timestamps: true });

MealSchema.pre('save', async function (next) {
  try {
    await this.populate('foodItems.food');

    const macros = await calculateMealMacros(this.foodItems);

    this.totalCalories = macros.totalCalories;
    this.totalProtein = macros.totalProtein;
    this.totalCarbs = macros.totalCarbs;
    this.totalFat = macros.totalFat;

    const macroValues = [
      { name: 'protein', value: this.totalProtein },
      { name: 'carb', value: this.totalCarbs },
      { name: 'fat', value: this.totalFat },
    ];

    macroValues.sort((a, b) => b.value - a.value);

    const maxMacro = macroValues[0];
    const secondMaxMacro = macroValues[1];

    const threshold = 0.15;

    if (secondMaxMacro.value === 0) {
      this.macroCategory = maxMacro.name;
    } else if ((maxMacro.value - secondMaxMacro.value) / secondMaxMacro.value >= threshold) {
      this.macroCategory = maxMacro.name;
    } else {
      this.macroCategory = 'balanced';
    }

    next();
  } catch (err) {
    next(err);
  }
});



module.exports = mongoose.model('meal', MealSchema);
