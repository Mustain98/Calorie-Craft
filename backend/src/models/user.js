const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const calculateMealMacros = require('../utils/calculateMealMacros');

function calculateNutrition({ gender, age, weight, height, activityLevel }) {
  const bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const multiplier = {
    sedentary: 1.2, light: 1.375, moderate: 1.55,
    active: 1.725, 'very active': 1.9
  };

  const tdee = bmr * (multiplier[activityLevel] || 1.2);
  const calories = Math.round(tdee);
  const protein = Math.round(weight * 2);
  const fats = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - (protein * 4 + fats * 9)) / 4);

  return { calories, protein, carbs, fats };
}

const EmbeddedMealSchema = new mongoose.Schema({
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
  totalProtein: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  totalFat: { type: Number, default: 0 },
  portionSize: { type: Number},
  categories: [{
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'main dish', 'side dish', 'dessert', 'drink']
  }],
  macroCategory: { 
    type: String, 
    enum: ['protein', 'carb', 'fat', 'balanced'],
    default: 'balanced' 
  }
});

EmbeddedMealSchema.pre('save', async function (next) {
    try {
  
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


const EmbeddedTimedMealConfig =new mongoose.Schema({
  name:{type:String,required:true},
  type: { 
    type: String, 
    enum: ["breakfast", "lunch", "dinner", "snack", "brunch", "supper"], 
    required: true 
  },
  caloriePortion:{type:Number,required:true},
  carbPortion:{type:Number,required:true},
  proteinPortion:{type:Number,required:true},
  fatPortion:{type:Number,required:true},
  order:{type:Number,required:true}
})

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: Number,
  gender: { type: String, enum: ['male', 'female'] },
  weight: Number,
  height: Number,
  activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very active'] },
  manualNutrition: { type: Boolean, default: false },
  nutritionalRequirement: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
  },
  myMeals: [EmbeddedMealSchema],
  timedMealConfig: {
    type: [EmbeddedTimedMealConfig],
    default: [
      { name: 'Breakfast', type:'breakfast', caloriePortion: 0.3, carbPortion: 0.35, proteinPortion: 0.3, fatPortion: 0.3, order: 0 },
      { name: 'Lunch', type:'lunch', caloriePortion: 0.4, carbPortion: 0.4, proteinPortion: 0.35, fatPortion: 0.35, order: 1 },
      { name: 'Dinner', type:'dinner', caloriePortion: 0.3, carbPortion: 0.25, proteinPortion: 0.35, fatPortion: 0.35, order: 2 }
    ]
  },
  weekPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'weekPlan'
  }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (this.isModified('password'))
    this.password = await bcrypt.hash(this.password, 10);

  if (!this.manualNutrition || !this.nutritionalRequirement) {
    this.nutritionalRequirement = calculateNutrition(this);
    this.manualNutrition = false;
  }

  next();
});

UserSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

UserSchema.statics.calculateNutrition = calculateNutrition;

module.exports = mongoose.model('user', UserSchema);
