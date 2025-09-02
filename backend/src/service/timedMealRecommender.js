// src/service/timedMealRecommender.js
// Recommender that mirrors your sample algorithm exactly, with .env-driven tunables.

const Meal = require('../models/meal');
const UserMealPreference = require('../models/userMealPreference');

const {
  STEP,
  planCost,
  comboTotals,
  allowedQtyChoicesForMealWithMax,
  withinTolerance,
} = require('./nutritionCost');

// env helpers
const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
const clamp01 = (x) => Math.max(0, Math.min(1, x));

const ENV = {
  ITERATIONS:         Math.max(100, Math.floor(num(process.env.REC_ITERATIONS,        1000))),
  TOLERANCE_PCT:      clamp01(num(process.env.REC_TOLERANCE_PCT,                       0.10)),
  GLOBAL_MAX_FACTOR:  Math.max(1, num(process.env.REC_GLOBAL_MAX_FACTOR,               6)),
  SIDE_CHANCE:        clamp01(num(process.env.REC_SIDE_CHANCE,                         0.60)),
  DRINK_CHANCE:       clamp01(num(process.env.REC_DRINK_CHANCE,                        0.50)),
  MAX_PORTION_SIZE:   Math.max(0, num(process.env.REC_MAX_PORTION_SIZE,                0)), // 0 => no cap
};

function pick(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[(Math.random() * arr.length) | 0];
}
function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function dedupeKey(items) {
  return items
    .map(it => `${String(it.meal)}@${Number(it.quantity || 1).toFixed(2)}`)
    .sort()
    .join('|');
}
function filterByType(meals, type) {
  return meals.filter(m => Array.isArray(m.categories) && m.categories.includes(type));
}

/**
 * generateTimedMeal
 *  - userId: bias towards preferred meals (optional)
 *  - type:   timed meal slot (e.g., 'breakfast')
 *  - demand: { calories, protein, carbs, fats } for THIS slot
 *  - preferPct: probability to choose from preferred pool first
 *  - nCombos: how many results to return
 *  - attempts: attempts per subset (inner loop)
 *
 * Returns: [{ meals:[{meal, quantity}], cost:Number, feasible:Boolean, total:{...} }]
 */
async function generateTimedMeal({
  userId = null,
  type,
  demand,
  preferPct = 0.4,
  nCombos = 20,
  attempts = 60,
  step = STEP,
  // optional advanced (via env by default):
  iterations = ENV.ITERATIONS,
  tolerancePercent = ENV.TOLERANCE_PCT,
  globalMaxFactor = ENV.GLOBAL_MAX_FACTOR,
  includeChances = { side: ENV.SIDE_CHANCE, drink: ENV.DRINK_CHANCE },
  maxPortionSize = ENV.MAX_PORTION_SIZE, // grams cap; 0 disables
} = {}) {
  if (!type || !demand) return [];

  // 1) Load meals for this type
  const base = await Meal.find({ categories: type })
    .select('_id name portionSize totalCalories totalProtein totalCarbs totalFat categories')
    .lean();
  if (!base.length) return [];

  const mains  = base.filter(m => (m.categories || []).includes('main dish'));
  const sides  = base.filter(m => (m.categories || []).includes('side dish'));
  const drinks = base.filter(m => (m.categories || []).includes('drink'));

  const pool = filterByType(base, type);
  const maxSubsetSize = Math.min(6, Math.max(1, Math.floor(pool.length / 2)));

  const safeMains  = mains.length  ? mains  : base;
  const safeSides  = sides.length  ? sides  : [];
  const safeDrinks = drinks.length ? drinks : [];

  // 2) Load user preferences (optional)
  let prefIds = new Set();
  if (userId) {
    const prefDoc = await UserMealPreference.findOne({ user: userId }, { meals: 1 }).lean();
    if (prefDoc?.meals?.length) prefIds = new Set(prefDoc.meals.map(id => String(id)));
  }
  const isPref = (m) => prefIds.has(String(m._id));
  const split = (arr) => ({ pref: arr.filter(isPref), sys: arr.filter(m => !isPref(m)) });
  const P = split(safeMains);
  const S = split(safeSides);
  const D = split(safeDrinks);

  // 3) Random search with subset attempts (sample logic)
  const seen = new Set();
  const candidatesMap = new Map();
  const tol = Number(tolerancePercent) || 0;

  const cfgForFactors = { maxPortionSize: maxPortionSize > 0 ? maxPortionSize : Number.MAX_SAFE_INTEGER };

  for (let it = 0; it < iterations; it++) {
    // subset size distribution skewed to smaller sets
    const s = Math.max(1, Math.round(Math.pow(Math.random(), 1.3) * (maxSubsetSize - 1))) + 1;
    const subsetShuffled = shuffleInPlace([...pool]);
    const subset = subsetShuffled.slice(0, Math.min(s, subsetShuffled.length));

    let bestForSubset = null;

    for (let attempt = 0; attempt < attempts; attempt++) {
      const items = [];

      // MAIN (mandatory)
      {
        const mainPool = Math.random() < preferPct && P.pref.length ? P.pref : (P.sys.length ? P.sys : P.pref);
        const main = pick(mainPool);
        if (!main) continue;
        const qChoices = allowedQtyChoicesForMealWithMax(main, cfgForFactors, step, globalMaxFactor);
        const qty = pick(qChoices) || step;
        items.push({ meal: main._id, mealDoc: main, quantity: qty });
      }

      // SIDE (optional)
      if (safeSides.length && Math.random() < (includeChances.side ?? 0.6)) {
        const sidePool = Math.random() < preferPct && S.pref.length ? S.pref : (S.sys.length ? S.sys : S.pref);
        const side = pick(sidePool);
        if (side && !items.some(it => String(it.meal) === String(side._id))) {
          const qChoices = allowedQtyChoicesForMealWithMax(side, cfgForFactors, step, globalMaxFactor);
          const qty = pick(qChoices) || step;
          items.push({ meal: side._id, mealDoc: side, quantity: qty });
        }
      }

      // DRINK (optional)
      if (safeDrinks.length && Math.random() < (includeChances.drink ?? 0.5)) {
        const drinkPool = Math.random() < preferPct && D.pref.length ? D.pref : (D.sys.length ? D.sys : D.pref);
        const drink = pick(drinkPool);
        if (drink && !items.some(it => String(it.meal) === String(drink._id))) {
          const qChoices = allowedQtyChoicesForMealWithMax(drink, cfgForFactors, step, globalMaxFactor);
          const qty = pick(qChoices) || step;
          items.push({ meal: drink._id, mealDoc: drink, quantity: qty });
        }
      }

      if (!items.length) continue;

      const key = dedupeKey(items);
      if (seen.has(key)) continue;
      seen.add(key);

      const tot = comboTotals(items);
      if (maxPortionSize > 0 && tot.grams > maxPortionSize) continue;

      // Your cost & feasibility logic
      const score = planCost(tot, demand);
      const feasible = withinTolerance(tot, {
        calorieDemand: demand.calories,
        proteinDemand: demand.protein,
        fatDemand:     demand.fats,
        carbDemand:    demand.carbs,
      }, tol);

      const candidate = { items, tot, score, feasible };

      if (!bestForSubset) {
        bestForSubset = candidate;
      } else {
        if (feasible && !bestForSubset.feasible) {
          bestForSubset = candidate;
        } else if (feasible === bestForSubset.feasible && score < bestForSubset.score) {
          bestForSubset = candidate;
        }
      }
      if (feasible && score === 0) break;
    }

    if (bestForSubset && bestForSubset.items.length > 0) {
      const k = dedupeKey(bestForSubset.items);
      const existing = candidatesMap.get(k);
      if (!existing || bestForSubset.score < existing.score) {
        candidatesMap.set(k, bestForSubset);
      }
    }

    // early exit like your sample
    if (candidatesMap.size >= nCombos * 3 && it > iterations * 0.2) {
      if (candidatesMap.size >= nCombos * 2) break;
    }
  }

  // Rank: feasible first, then by cost asc
  const all = Array.from(candidatesMap.values());
  all.sort((a, b) => {
    if (a.feasible && !b.feasible) return -1;
    if (!a.feasible && b.feasible) return 1;
    return a.score - b.score;
  });

  return all.slice(0, nCombos).map(c => ({
    meals: c.items.map(it => ({ meal: it.meal, quantity: Number(it.quantity) })), // minimal payload
    total: {
      grams:     Number(c.tot.grams.toFixed(2)),
      calories:  Number(c.tot.calories.toFixed(2)),
      protein:   Number(c.tot.protein.toFixed(2)),
      fat:       Number(c.tot.fat.toFixed(2)),
      carbs:     Number(c.tot.carb.toFixed(2)),
    },
    cost: Number(c.score.toFixed(4)),
    feasible: !!c.feasible,
  }));
}

module.exports = { generateTimedMeal };
