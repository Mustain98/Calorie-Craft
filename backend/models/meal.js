const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    default: '',
    trim: true
  },
  foodItems: [
    {
      food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'fooditem',
        required: true
      },
      quantity: {
        type: Number,
        default: 1,
        min: 0.1
      }
    }
  ],
  totalCalories: { type: Number, default: 0 },
  totalProtein:  { type: Number, default: 0 },
  totalCarbs:    { type: Number, default: 0 },
  totalFat:      { type: Number, default: 0 }
}, { timestamps: true });

MealSchema.pre('save', async function (next) {
  const meal = this;

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const item of meal.foodItems) {
    const food = await mongoose.model('fooditem').findById(item.food);
    if (!food) continue;

    const qty = item.quantity || 1;

    totalCalories += food.calories * qty;
    totalProtein  += food.protein  * qty;
    totalCarbs    += food.carbs    * qty;
    totalFat      += food.fat      * qty;
  }

  meal.totalCalories = totalCalories;
  meal.totalProtein  = totalProtein;
  meal.totalCarbs    = totalCarbs;
  meal.totalFat      = totalFat;

  next();
});

module.exports = mongoose.model('meal', MealSchema);
