// src/service/timedMealRecommender.js
const mongoose = require('mongoose');
const Meal = require('../models/meal');
const UserMealPreference = require('../models/userMealPreference');

// STEP from env or default 0.25 (and safely parsed)
const STEP = (() => {
  const raw = process.env.UNIT_PORTION_FACTOR || process.env.unitPortionFactor;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0.25;
})();

/* ---------------- cost & utils ---------------- */

function planCost(tot, demand) {
  const dCal = (tot.calories || 0) - (demand.calories || 0);
  const dPro = (tot.protein  || 0) - (demand.protein  || 0);
  const dFat = (tot.fat      || 0) - (demand.fats     || 0);
  const dCar = (tot.carb     || 0) - (demand.carbs    || 0);

  const wCal = 1, wPro = 8, wFat = 6, wCar = 6;
  const under = (x) => (x < 0 ? -x : 0);
  const over  = (x) => (x > 0 ?  x : 0);

  return (
    wCal * (under(dCal) + 0.5 * over(dCal)) +
    wPro * (under(dPro) + 0.5 * over(dPro)) +
    wFat * (under(dFat) + 0.5 * over(dFat)) +
    wCar * (under(dCar) + 0.5 * over(dCar))
  );
}

function totalsOf(items) {
  return items.reduce((t, it) => {
    const m = it.mealDoc || {};
    const q = Number(it.quantity || 1);
    t.grams    += (Number(m.portionSize)   || 0) * q;
    t.calories += (Number(m.totalCalories) || 0) * q;
    t.protein  += (Number(m.totalProtein)  || 0) * q;
    t.fat      += (Number(m.totalFat)      || 0) * q;
    t.carb     += (Number(m.totalCarbs)    || 0) * q;
    return t;
  }, { grams: 0, calories: 0, protein: 0, fat: 0, carb: 0 });
}

function pick(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[(Math.random() * arr.length) | 0];
}

function dedupeKey(items) {
  // key = sorted list of mealId@qty
  return items
    .map(it => `${String(it.meal)}@${Number(it.quantity || 1).toFixed(2)}`)
    .sort()
    .join('|');
}

/* ---------------- adaptive quantity helpers ---------------- */

// factor needed so THIS meal alone could meet demand for each macro/calories,
// take the maximum (tightest constraint); clamp with cap.
function maxFactorToMeetDemand(meal, demand, cap = 8) {
  const ratios = [];
  if ((meal.totalCalories || 0) > 0 && (demand.calories || 0) > 0)
    ratios.push(demand.calories / meal.totalCalories);
  if ((meal.totalProtein || 0) > 0 && (demand.protein || 0) > 0)
    ratios.push(demand.protein / meal.totalProtein);
  if ((meal.totalFat || 0) > 0 && (demand.fats || 0) > 0)
    ratios.push(demand.fats / meal.totalFat);
  if ((meal.totalCarbs || 0) > 0 && (demand.carbs || 0) > 0)
    ratios.push(demand.carbs / meal.totalCarbs);

  if (!ratios.length) return 1; // nothing constrains – safe default
  const fMax = Math.max(...ratios);
  if (!isFinite(fMax) || fMax <= 0) return 1;
  return Math.min(cap, fMax);
}

// build discrete choices: STEP … fMax in STEP increments
function allowedQtyChoicesForMeal(meal, demand, step = STEP, cap = 8) {
  const fMax = Math.max(step, maxFactorToMeetDemand(meal, demand, cap));
  const out = [];
  for (let f = step; f <= fMax + 1e-9; f += step) out.push(Number(f.toFixed(2)));
  return out;
}

/* ---------------- generator ---------------- */

/**
 * generateTimedMeal
 * Build N candidate combos for a given timed-meal slot (type + macro demand).
 *
 * @param {Object} params
 *  - userId: ObjectId|string (optional, enables preference mixing)
 *  - type: 'breakfast'|'lunch'|'dinner'|'snack'|'brunch'|'supper'
 *  - demand: { calories, protein, fats, carbs }
 *  - preferPct: fraction [0..1] – probability a slot is chosen from user's preferences
 *  - nCombos: max number of combos to return
 *  - attempts: random attempts to generate combos
 *  - includeChances: { side: number, drink: number } in [0..1]
 *  - step: quantity step (default from env or 0.25)
 *  - maxFactorCap: hard cap for quantity factor (default 8x)
 *
 * @returns {Promise<Array<{ meals: [{meal, quantity}], cost }>>} sorted by cost asc
 */
async function generateTimedMeal({
  userId = null,
  type,
  demand,
  preferPct = 0.4,
  nCombos = 20,
  attempts = 400,
  includeChances = { side: 0.6, drink: 0.5 },
  step = STEP,
  maxFactorCap = 8,
} = {}) {
  if (!type || !demand) return [];

  // 1) Load meals for this type (categories contains the timed type)
  const base = await Meal.find({ categories: type })
    .select('_id name portionSize totalCalories totalProtein totalCarbs totalFat categories')
    .lean();
  if (!base.length) return [];

  const mains  = base.filter(m => (m.categories || []).includes('main dish'));
  const sides  = base.filter(m => (m.categories || []).includes('side dish'));
  const drinks = base.filter(m => (m.categories || []).includes('drink'));

  const safeMains  = mains.length  ? mains  : base;
  const safeSides  = sides.length  ? sides  : [];
  const safeDrinks = drinks.length ? drinks : [];

  // 2) Load user preferences (to bias pools)
  let prefIds = new Set();
  if (userId) {
    const prefDoc = await UserMealPreference.findOne({ user: userId }, { meals: 1 }).lean();
    if (prefDoc?.meals?.length) {
      prefIds = new Set(prefDoc.meals.map(id => String(id)));
    }
  }
  const isPref = (m) => prefIds.has(String(m._id));
  const splitPool = (arr) => ({ pref: arr.filter(isPref), sys: arr.filter(m => !isPref(m)) });
  const P = splitPool(safeMains);
  const S = splitPool(safeSides);
  const D = splitPool(safeDrinks);

  // 3) Randomly generate combos
  const seen = new Set();
  const combos = [];

  for (let i = 0; i < attempts && combos.length < nCombos; i++) {
    // Always choose ONE main
    const mainPool = Math.random() < preferPct && P.pref.length ? P.pref : (P.sys.length ? P.sys : P.pref);
    const main = pick(mainPool);
    if (!main) continue;

    const items = [];

    // MAIN with adaptive quantity
    {
      const qChoices = allowedQtyChoicesForMeal(main, demand, step, maxFactorCap);
      const qty = pick(qChoices) || step;
      items.push({ meal: main._id, mealDoc: main, quantity: qty });
    }

    // optional SIDE with adaptive quantity
    if (safeSides.length && Math.random() < (includeChances.side ?? 0.6)) {
      const sidePool = Math.random() < preferPct && S.pref.length ? S.pref : (S.sys.length ? S.sys : S.pref);
      const side = pick(sidePool);
      if (side && String(side._id) !== String(main._id)) {
        const qChoices = allowedQtyChoicesForMeal(side, demand, step, maxFactorCap);
        const qty = pick(qChoices) || step;
        items.push({ meal: side._id, mealDoc: side, quantity: qty });
      }
    }

    // optional DRINK with adaptive quantity
    if (safeDrinks.length && Math.random() < (includeChances.drink ?? 0.5)) {
      const drinkPool = Math.random() < preferPct && D.pref.length ? D.pref : (D.sys.length ? D.sys : D.pref);
      const drink = pick(drinkPool);
      if (drink && !items.some(it => String(it.meal) === String(drink._id))) {
        const qChoices = allowedQtyChoicesForMeal(drink, demand, step, maxFactorCap);
        const qty = pick(qChoices) || step;
        items.push({ meal: drink._id, mealDoc: drink, quantity: qty });
      }
    }

    if (!items.length) continue;

    const key = dedupeKey(items);
    if (seen.has(key)) continue;
    seen.add(key);

    const tot = totalsOf(items);
    const cost = planCost(tot, demand);

    combos.push({
      meals: items.map(it => ({ meal: it.meal, quantity: it.quantity })),
      cost: Number(cost.toFixed(4)),
    });
  }

  combos.sort((a, b) => a.cost - b.cost);
  return combos.slice(0, nCombos);
}

module.exports = { generateTimedMeal };
