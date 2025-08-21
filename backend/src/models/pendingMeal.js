const mongoose = require('mongoose');
const calculateMealMacros =require('../utils/calculateMealMacros');

const PendingMealSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '', trim: true },
  imageId: { type: String, default: null },
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
  portionSize:   { type: Number, default:100},
  categories: [{
  type: String,
  enum: ['breakfast', 'lunch', 'dinner', 'snack', 'main dish', 'side dish', 'dessert', 'drink']
  }],
  macroCategory: { 
    type: String, 
    enum: ['protein', 'carb', 'fat', 'balanced'],
    default: 'balanced' 
  },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true });
PendingMealSchema.pre('save', async function (next) {
  try {
      // Populate foodItems.food first — required to access unitWeight and macros
      await this.populate('foodItems.food');
  
      // Now calculate macros based on populated food items
      const macros = await calculateMealMacros(this.foodItems);
  
      // Set totals
      this.totalCalories = macros.totalCalories;
      this.totalProtein = macros.totalProtein;
      this.totalCarbs = macros.totalCarbs;
      this.totalFat = macros.totalFat;
  
      // Calculate portionSize: sum of (unitWeight * quantity) for each food item
      let portionSize = 0;
      for (const item of this.foodItems) {
        // Defensive: check if unitWeight exists on populated food document
        if (item.food && item.food.totalunitweight) {
          portionSize += item.food.totalunitweight * (item.quantity || 1);
        } else {
          // If missing, you might want to throw an error or set default value
          portionSize += 0;
        }
      }
      this.portionSize = portionSize;
  
      // Calculate macroCategory based on total macros
      const macroValues = [
        { name: 'protein', value: this.totalProtein },
        { name: 'carb', value: this.totalCarbs },
        { name: 'fat', value: this.totalFat },
      ];
  
      // Sort descending by macro value
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
module.exports = mongoose.model('PendingMeal', PendingMealSchema, 'pendingMeals');
