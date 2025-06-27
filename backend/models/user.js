const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Nutrition calculation helper
function calculateNutrition({ gender, age, weight, height, activityLevel }) {
  let bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const multiplier = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    'very active': 1.9
  };

  const tdee = bmr * (multiplier[activityLevel] || 1.2);
  const calories = Math.round(tdee);
  const protein = Math.round(weight * 2);
  const fats = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - (protein * 4 + fats * 9)) / 4);

  return { calories, protein, carbs, fats };
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: Number,
  gender: { type: String, enum: ['male', 'female'] },
  weight: Number,
  height: Number,
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very active']
  },
  manualNutrition: { type: Boolean, default: false },
  nutritionalRequirement: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number
  },
  weekPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'weekPlan'
  }
}, { timestamps: true });

// Password hash
UserSchema.pre('save', async function (next) {
  if (this.isModified('password'))
    this.password = await bcrypt.hash(this.password, 10);

  // Only auto-calculate if not manual
  if (!this.manualNutrition || !this.nutritionalRequirement) {
    this.nutritionalRequirement = calculateNutrition(this);
    this.manualNutrition = false;
  }

  next();
});

// Password comparison
UserSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Export with nutrition calculator
UserSchema.statics.calculateNutrition = calculateNutrition;

module.exports = mongoose.model('user', UserSchema);
