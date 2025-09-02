// backend/src/service/weekPlanService.js
const User      = require('../models/user');
const DayPlan   = require('../models/dayPlan');
const WeekPlan  = require('../models/weekPlan');
const TimedMeal = require('../models/timedMeal');
const { generateTimedMeal } = require('./timedMealRecommender');

const WEEK_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const num = (x, d = 0) => (Number.isFinite(Number(x)) ? Number(x) : d);

// env defaults
const preferPctDefault = clamp01(num(process.env.USER_PREFER_PCT ?? process.env.user_prefer_pct, 0.4));
const nCombosDefault   = Math.max(1, Math.floor(num(process.env.NCOMBOS ?? process.env.nCombos, 12)));
const attemptsDefault  = Math.max(50, Math.floor(num(process.env.REC_ATTEMPTS ?? process.env.rec_attempts, 300)));

function calcDemand(totals = {}, tc = {}) {
  const tCal = num(totals.calories), tPro = num(totals.protein), tCar = num(totals.carbs), tFat = num(totals.fats ?? totals.fat);
  const pCal = num(tc.caloriePortion), pPro = num(tc.proteinPortion), pCar = num(tc.carbPortion), pFat = num(tc.fatPortion);
  return {
    calories: Math.max(0, Number((tCal * pCal).toFixed(2))),
    protein:  Math.max(0, Number((tPro * pPro).toFixed(2))),
    carbs:    Math.max(0, Number((tCar * pCar).toFixed(2))),
    fats:     Math.max(0, Number((tFat * pFat).toFixed(2))),
  };
}

// frequency helpers: respect both system meal and user meal ids
function comboRespectsCap(combo, freqMap, cap = 3) {
  const items = Array.isArray(combo?.meals) ? combo.meals : [];
  for (const it of items) {
    const key = String(it.meal ?? it.userMeal ?? '');
    if (!key) continue;
    const used = freqMap.get(key) || 0;
    if (used >= cap) return false;
  }
  return true;
}
function bumpFrequency(combo, freqMap) {
  const ids = new Set((combo?.meals || []).map(it => String(it.meal ?? it.userMeal ?? '')).filter(Boolean));
  for (const id of ids) freqMap.set(id, (freqMap.get(id) || 0) + 1);
}

async function recalcDayTotals(dayPlanId) {
  const day = await DayPlan.findById(dayPlanId).populate([
    {
      path: 'timedMeals',
      populate: [
        { path: 'choosenCombo.meals.meal' },
        { path: 'choosenCombo.meals.userMeal' },
      ]
    }
  ]);
  if (!day) return null;

  const roll = (day.timedMeals || []).reduce(
    (a, tm) => ({
      totalCalories: a.totalCalories + num(tm.totalCalories),
      totalProtein:  a.totalProtein  + num(tm.totalProtein),
      totalCarbs:    a.totalCarbs    + num(tm.totalCarbs),
      totalFat:      a.totalFat      + num(tm.totalFat),
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
  );

  Object.assign(day, roll);
  await day.save();
  return day;
}

// infer + compute totals from chosen combo (doesn't rely on "source" being set)
function recomputeTimedMealTotalsFromChosenLocal(tmDoc) {
  const chosen = tmDoc?.choosenCombo || { meals: [] };
  let c = 0, p = 0, cb = 0, f = 0;

  (chosen.meals || []).forEach((it) => {
    const qty = num(it.quantity, 1);
    if (it.userMeal) {
      const m = it.userMeal;
      c += num(m.totalCalories) * qty;
      p += num(m.totalProtein) * qty;
      cb += num(m.totalCarbs) * qty;
      f += num(m.totalFat) * qty;
    } else if (it.meal) {
      const m = it.meal;
      c += num(m.totalCalories) * qty;
      p += num(m.totalProtein) * qty;
      cb += num(m.totalCarbs) * qty;
      f += num(m.totalFat) * qty;
    }
  });

  tmDoc.totalCalories = Number(c.toFixed(2));
  tmDoc.totalProtein  = Number(p.toFixed(2));
  tmDoc.totalCarbs    = Number(cb.toFixed(2));
  tmDoc.totalFat      = Number(f.toFixed(2));
}

function mapOptionMeal(x) {
  // Accepts either system meal or user meal item from recommender
  if (x?.userMeal) return { source: 'user', userMeal: x.userMeal, quantity: num(x.quantity, 1) };
  // default to system meal
  return { source: 'system', meal: x.meal, quantity: num(x.quantity, 1) };
}
function normalizeOptionCombo(opt) {
  return {
    meals: (opt?.meals || []).map(mapOptionMeal),
    cost: num(opt?.cost, 0),
  };
}

async function createWeekPlan(userId, opts = {}) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const cfg = Array.isArray(user.timedMealConfig) ? user.timedMealConfig : [];
  if (!cfg.length) throw new Error('User timedMealConfig is empty. Configure Meal Plan Setting first.');

  const totals = user.nutritionalRequirement;
  if (!totals) throw new Error('User nutritional requirement not found');

  const preferPct = clamp01(num(opts.preferPct, preferPctDefault));
  const nCombos   = Math.max(1, Math.floor(num(opts.nCombos, nCombosDefault)));
  const attempts  = Math.max(50, Math.floor(num(opts.attempts, attemptsDefault)));

  const dayPlanIds = [];
  const mealFrequency = new Map();

  const orderedCfg = [...cfg].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  for (const day of WEEK_DAYS) {
    const timedMealIds = [];
    const tmDocs = [];

    for (const tc of orderedCfg) {
      const demand = calcDemand(totals, tc);
      if (demand.calories < 50) continue;

      let options = [];
      try {
        options = await generateTimedMeal({ userId, type: tc.type, demand, preferPct, nCombos, attempts });
      } catch (e) {
        console.error('[generateTimedMeal] failed:', e);
      }
      if (!options.length) continue;

      // choose with cap (consider both system + user meals)
      let chosen = options.find(opt => comboRespectsCap(opt, mealFrequency, 3)) || options[0];
      bumpFrequency(chosen, mealFrequency);

      const normalizedOptions = options.map(normalizeOptionCombo);
      const normalizedChosen  = normalizeOptionCombo(chosen);

      // IMPORTANT: attach user to every TimedMeal
      const tm = await new TimedMeal({
        user: userId,
        name: tc.name,
        type: tc.type,
        choosenCombo: normalizedChosen,
        mealCombos: normalizedOptions,
      }).save();

      // populate, recompute totals, save again so Day totals are correct
      const populated = await TimedMeal.findById(tm._id)
        .populate('choosenCombo.meals.meal')
        .populate('choosenCombo.meals.userMeal');

      recomputeTimedMealTotalsFromChosenLocal(populated);
      await populated.save();

      timedMealIds.push(populated._id);
      tmDocs.push(populated);
    }

    const dayTotals = tmDocs.reduce(
      (a, tm) => ({
        totalCalories: a.totalCalories + num(tm.totalCalories),
        totalProtein:  a.totalProtein  + num(tm.totalProtein),
        totalCarbs:    a.totalCarbs    + num(tm.totalCarbs),
        totalFat:      a.totalFat      + num(tm.totalFat),
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
    );

    const dp = await DayPlan.create({ day, timedMeals: timedMealIds, ...dayTotals });
    dayPlanIds.push(dp._id);
  }

  const weekPlan = await WeekPlan.create({ days: dayPlanIds });

  await User.updateOne({ _id: userId }, { $set: { weekPlan: weekPlan._id } });

  return await WeekPlan.findById(weekPlan._id).populate({
    path: 'days',
    populate: {
      path: 'timedMeals',
      populate: [
        { path: 'choosenCombo.meals.meal' },
        { path: 'choosenCombo.meals.userMeal' },
        { path: 'mealCombos.meals.meal' },
        { path: 'mealCombos.meals.userMeal' },
      ],
    },
  });
}

/** Hard-delete a full week plan (+ its day plans + timed meals) */
async function deleteWeekPlanByIdInternal(weekPlanId) {
  const wp = await WeekPlan.findById(weekPlanId).lean();
  if (!wp) return;

  const dayIds = Array.isArray(wp.days) ? wp.days : [];
  const dayDocs = await DayPlan.find({ _id: { $in: dayIds } }).lean();
  const timedIds = dayDocs.flatMap(d => d.timedMeals || []);

  if (timedIds.length) await TimedMeal.deleteMany({ _id: { $in: timedIds } });
  if (dayIds.length)   await DayPlan.deleteMany({ _id: { $in: dayIds } });
  await WeekPlan.deleteOne({ _id: weekPlanId });
}

/** Regenerate a single timed meal (new combos + chosen), then recalc its day totals */
async function regenerateTimedMealById(userId, timedMealId, opts = {}) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const tm = await TimedMeal.findById(timedMealId);
  if (!tm) throw new Error('Timed meal not found');

  const dayPlan = await DayPlan.findOne({ timedMeals: timedMealId }).lean();
  if (!dayPlan) throw new Error('Day plan not found for timed meal');

  const totals = user.nutritionalRequirement;
  if (!totals) throw new Error('User nutritional requirement not found');

  const cfg = (user.timedMealConfig || []).find(x => x.type === tm.type);
  if (!cfg) throw new Error(`No timedMealConfig entry for type ${tm.type}`);

  const demand = calcDemand(totals, cfg);

  const preferPct = clamp01(num(opts.preferPct, preferPctDefault));
  const nCombos   = Math.max(1, Math.floor(num(opts.nCombos, nCombosDefault)));
  const attempts  = Math.max(50, Math.floor(num(opts.attempts, attemptsDefault)));

  const options = await generateTimedMeal({ userId, type: tm.type, demand, preferPct, nCombos, attempts });
  if (!options.length) throw new Error('No options generated for this slot');

  const normalizedOptions = options.map(normalizeOptionCombo);
  const normalizedChosen  = normalizeOptionCombo(options[0]);

  tm.user = tm.user || userId; // ensure ownership
  tm.mealCombos = normalizedOptions;
  tm.choosenCombo = normalizedChosen;
  await tm.save();

  const populated = await TimedMeal.findById(tm._id)
    .populate('choosenCombo.meals.meal')
    .populate('choosenCombo.meals.userMeal');

  recomputeTimedMealTotalsFromChosenLocal(populated);
  await populated.save();

  await recalcDayTotals(dayPlan._id);

    return await TimedMeal.findById(populated._id)
    .populate({ path: 'choosenCombo.meals.meal',     populate: { path: 'foodItems.food' } })
    .populate({ path: 'choosenCombo.meals.userMeal', populate: { path: 'foodItems.food' } })
    .populate({ path: 'mealCombos.meals.meal',       populate: { path: 'foodItems.food' } })
    .populate({ path: 'mealCombos.meals.userMeal',   populate: { path: 'foodItems.food' } });

}

/** Remove a timed meal from its day, delete it, and recalc day totals */
async function deleteTimedMealFromWeek(timedMealId) {
  const day = await DayPlan.findOne({ timedMeals: timedMealId });
  if (!day) return { deleted: false, message: 'Day not found for timed meal' };

  day.timedMeals = (day.timedMeals || []).filter(id => String(id) !== String(timedMealId));
  await day.save();

  await TimedMeal.findByIdAndDelete(timedMealId);
  await recalcDayTotals(day._id);

  return { deleted: true, dayId: day._id };
}

module.exports = {
  WEEK_DAYS,
  createWeekPlan,
  deleteWeekPlanByIdInternal,
  regenerateTimedMealById,
  deleteTimedMealFromWeek,
};
