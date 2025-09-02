const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

const EmbeddedTimedMealConfig = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["breakfast", "lunch", "dinner", "snack", "brunch", "supper"], 
    required: true 
  },
  caloriePortion: { type: Number, required: true },
  carbPortion: { type: Number, required: true },
  proteinPortion: { type: Number, required: true },
  fatPortion: { type: Number, required: true },
  order: { type: Number, required: true }
});

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
  timedMealConfig: {
    type: [EmbeddedTimedMealConfig],
    default: [
      { name: 'Breakfast', type: 'breakfast', caloriePortion: 0.3, carbPortion: 0.35, proteinPortion: 0.3, fatPortion: 0.3, order: 0 },
      { name: 'Lunch', type: 'lunch', caloriePortion: 0.4, carbPortion: 0.4, proteinPortion: 0.35, fatPortion: 0.35, order: 1 },
      { name: 'Dinner', type: 'dinner', caloriePortion: 0.3, carbPortion: 0.25, proteinPortion: 0.35, fatPortion: 0.35, order: 2 }
    ]
  },
  myMeals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserMeal' }],
  weekPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'weekPlan'
  }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (!this.manualNutrition && (this.isModified('gender') || this.isModified('age') || 
      this.isModified('weight') || this.isModified('height') || this.isModified('activityLevel'))) {
    this.nutritionalRequirement = calculateNutrition(this);
  }

  next();
});

UserSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

UserSchema.statics.calculateNutrition = calculateNutrition;

module.exports = mongoose.model('user', UserSchema);