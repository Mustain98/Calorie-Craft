// backend/src/models/timedMeal.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// pull the user + cost helpers (pure)
const User = require('./user');
const { planCost, calcDemand } = require('../service/nutritionCost');

const EmbeddedMealItem = new Schema(
  {
    source: { type: String, enum: ['system', 'user'], default: 'system' },
    meal: { type: Schema.Types.ObjectId, ref: 'meal' },
    userMeal: { type: Schema.Types.ObjectId, ref: 'UserMeal' },
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
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    choosenCombo: EmbeddedMealCombo,
    mealCombos: [EmbeddedMealCombo],
    totalCalories: { type: Number, default: 0 },
    totalProtein:  { type: Number, default: 0 },
    totalCarbs:    { type: Number, default: 0 },
    totalFat:      { type: Number, default: 0 },
    weekPlan: { type: Schema.Types.ObjectId, ref: 'weekPlan' }
  },
  { timestamps: true }
);

TimedMealSchema.pre('save', async function (next) {
  try {
    // --- 1) Recompute totals from chosen combo ---
    this.totalCalories = 0;
    this.totalProtein  = 0;
    this.totalCarbs    = 0;
    this.totalFat      = 0;

    const combo = this?.choosenCombo;
    const items = combo?.meals;

    if (Array.isArray(items) && items.length > 0) {
      // populate bases used below
      await this.populate([
        { path: 'choosenCombo.meals.meal' },
        { path: 'choosenCombo.meals.userMeal' },
      ]);

      for (const it of items) {
        const qty = Number.isFinite(Number(it?.quantity)) ? Number(it.quantity) : 1;

        const src = it?.source === 'user'
          ? 'user'
          : (it?.source === 'system'
              ? 'system'
              : (it?.userMeal ? 'user' : 'system'));

        const base = (src === 'user') ? it?.userMeal : it?.meal;
        if (!base) continue;

        this.totalCalories += (Number(base.totalCalories) || 0) * qty;
        this.totalProtein  += (Number(base.totalProtein)  || 0) * qty;
        this.totalCarbs    += (Number(base.totalCarbs)    || 0) * qty;
        this.totalFat      += (Number(base.totalFat)      || 0) * qty;
      }
    }

    const r2 = (v) => Math.round((Number(v) + Number.EPSILON) * 100) / 100;
    this.totalCalories = r2(this.totalCalories);
    this.totalProtein  = r2(this.totalProtein);
    this.totalCarbs    = r2(this.totalCarbs);
    this.totalFat      = r2(this.totalFat);

    // --- 2) Recompute cost for chosen combo (if possible) ---
    try {
      if (
        this.user &&
        this.type &&
        this.choosenCombo &&
        Array.isArray(this.choosenCombo.meals) &&
        this.choosenCombo.meals.length > 0
      ) {
        const u = await User.findById(this.user)
          .select('nutritionalRequirement timedMealConfig')
          .lean();

        const tc = (u?.timedMealConfig || []).find(x => x.type === this.type);
        if (u?.nutritionalRequirement && tc) {
          const demand = calcDemand(u.nutritionalRequirement, tc); // {calories, protein, carbs, fats}
          const tot = {
            calories: this.totalCalories,
            protein:  this.totalProtein,
            fat:      this.totalFat,
            carb:     this.totalCarbs,
          };
          const cost = planCost(tot, demand);
          this.choosenCombo.cost = Number(cost.toFixed(4));
        }
      }
    } catch (e) {
      // Don’t block save if cost calc fails; just log and continue
      console.warn('[TimedMeal pre-save] cost calc skipped:', e?.message);
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('timedMeal', TimedMealSchema);
