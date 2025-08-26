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
const attemptsDefault  = Math.max(50, Math.floor(num(process.env.REC_ATTEMPTS, 300)));

function calcDemand(totals = {}, tc = {}) {
  const tCal = num(totals.calories), tPro = num(totals.protein), tCar = num(totals.carbs), tFat = num(totals.fats);
  const pCal = num(tc.caloriePortion), pPro = num(tc.proteinPortion), pCar = num(tc.carbPortion), pFat = num(tc.fatPortion);
  return {
    calories: Math.max(0, Number((tCal * pCal).toFixed(2))),
    protein:  Math.max(0, Number((tPro * pPro).toFixed(2))),
    carbs:    Math.max(0, Number((tCar * pCar).toFixed(2))),
    fats:     Math.max(0, Number((tFat * pFat).toFixed(2))),
  };
}

function comboRespectsCap(combo, freqMap, cap = 3) {
  const items = Array.isArray(combo?.meals) ? combo.meals : [];
  for (const it of items) {
    const id = String(it.meal);
    const used = freqMap.get(id) || 0;
    if (used >= cap) return false;
  }
  return true;
}

function bumpFrequency(combo, freqMap) {
  const ids = new Set((combo?.meals || []).map(it => String(it.meal)));
  for (const id of ids) freqMap.set(id, (freqMap.get(id) || 0) + 1);
}

async function recalcDayTotals(dayPlanId) {
  const day = await DayPlan.findById(dayPlanId).populate('timedMeals');
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

/**
 * Create a new week plan for the given user.
 * - DOES NOT touch user.weekPlan until AFTER WeekPlan is created.
 * - Requires user.timedMealConfig and user.nutritionalRequirement to exist.
 */
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

  // preserve order
  const orderedCfg = [...cfg].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  for (const day of WEEK_DAYS) {
    const timedMealIds = [];
    const tmDocs = [];

    for (const tc of orderedCfg) {
      const demand = calcDemand(totals, tc);
      // skip trivially small
      if (demand.calories < 50) continue;

      let options = [];
      try {
        options = await generateTimedMeal({ userId, type: tc.type, demand, preferPct, nCombos, attempts });
      } catch (e) {
        console.error('[generateTimedMeal] failed:', e);
      }
      if (!options.length) continue;

      let chosen = options.find(opt => comboRespectsCap(opt, mealFrequency, 3)) || options[0];
      bumpFrequency(chosen, mealFrequency);

      const tm = await new TimedMeal({
        name: tc.name,
        type: tc.type,
        choosenCombo: {
          meals: (chosen.meals || []).map(x => ({ meal: x.meal, quantity: num(x.quantity, 1) })),
          cost: num(chosen.cost, 0)
        },
        mealCombos: options.map(opt => ({
          meals: (opt.meals || []).map(x => ({ meal: x.meal, quantity: num(x.quantity, 1) })),
          cost: num(opt.cost, 0)
        }))
      }).save();

      timedMealIds.push(tm._id);
      tmDocs.push(tm);
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

  // attach AFTER creating week plan
  await User.updateOne({ _id: userId }, { $set: { weekPlan: weekPlan._id } });

  // populate for response
  return await WeekPlan.findById(weekPlan._id).populate({
    path: 'days',
    populate: {
      path: 'timedMeals',
      populate: [
        { path: 'choosenCombo.meals.meal' },
        { path: 'mealCombos.meals.meal' },
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

  let chosen = options[0];

  tm.mealCombos = options.map(opt => ({
    meals: (opt.meals || []).map(x => ({ meal: x.meal, quantity: num(x.quantity, 1) })),
    cost: num(opt.cost, 0)
  }));
  tm.choosenCombo = {
    meals: (chosen.meals || []).map(x => ({ meal: x.meal, quantity: num(x.quantity, 1) })),
    cost: num(chosen.cost, 0)
  };
  await tm.save();

  await recalcDayTotals(dayPlan._id);

  return await TimedMeal.findById(tm._id)
    .populate('choosenCombo.meals.meal')
    .populate('mealCombos.meals.meal');
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
