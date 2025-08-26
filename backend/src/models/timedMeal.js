// backend/src/models/timedMeal.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const EmbeddedMealItem = new Schema(
  {
    // source of the item
    source: { type: String, enum: ['system', 'user'], default: 'system' },

    // system meal
    meal: { type: Schema.Types.ObjectId, ref: 'meal' },

    // user meal snapshot (NO writes to user doc)
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    userMealId: { type: Schema.Types.ObjectId }, // subdoc _id in user.myMeals

    // snapshotted fields for user meals
    name: String,
    portionSize: Number,
    totalCalories: Number,
    totalProtein: Number,
    totalCarbs: Number,
    totalFat: Number,

    // common
    quantity: { type: Number, default: 1, min: 0.25 },
  },
  { _id: false }
);

const EmbeddedMealCombo = new Schema(
  {
    meals: [EmbeddedMealItem],
    cost: { type: Number, default: 0 },
  },
  { _id: false }
);

const TimedMealSchema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'brunch', 'supper'],
      required: true,
    },
    choosenCombo: EmbeddedMealCombo,
    mealCombos: [EmbeddedMealCombo],
    totalCalories: { type: Number, default: 0 },
    totalProtein:  { type: Number, default: 0 },
    totalCarbs:    { type: Number, default: 0 },
    totalFat:      { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compute totals from chosen combo (system items are populated; user items use snapshot fields)
TimedMealSchema.pre('save', async function (next) {
  try {
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    const items = Array.isArray(this.choosenCombo?.meals) ? this.choosenCombo.meals : [];

    // populate system meals only if present
    if (items.some(it => it.source === 'system' && it.meal)) {
      await this.populate('choosenCombo.meals.meal');
    }

    for (const it of items) {
      const qty = Number(it.quantity || 1);
      if (it.source === 'system') {
        const m = it.meal;
        if (!m) continue;
        totalCalories += (Number(m.totalCalories) || 0) * qty;
        totalProtein  += (Number(m.totalProtein)  || 0) * qty;
        totalCarbs    += (Number(m.totalCarbs)    || 0) * qty;
        totalFat      += (Number(m.totalFat)      || 0) * qty;
      } else {
        // user snapshot
        totalCalories += (Number(it.totalCalories) || 0) * qty;
        totalProtein  += (Number(it.totalProtein)  || 0) * qty;
        totalCarbs    += (Number(it.totalCarbs)    || 0) * qty;
        totalFat      += (Number(it.totalFat)      || 0) * qty;
      }
    }

    this.totalCalories = totalCalories;
    this.totalProtein  = totalProtein;
    this.totalCarbs    = totalCarbs;
    this.totalFat      = totalFat;
    next();
  } catch (err) { next(err); }
});

module.exports = mongoose.model('timedMeal', TimedMealSchema);
