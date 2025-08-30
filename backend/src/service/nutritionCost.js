// src/service/nutritionCost.js
// Pure helpers (no DB). Central place for step, totals, cost & demand.

const STEP = (() => {
  const raw = process.env.unitPortionFactor ?? process.env.UNIT_PORTION_FACTOR;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0.25;   // default 0.25 portion steps
})();

// COST: weighted under/over (over gets 0.5 weight) — matches your sample
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

// Normalize one meal-like doc → per-portion macros
function _fromDoc(doc = {}) {
  return {
    grams:    Number(doc.portionSize   || 0),
    calories: Number(doc.totalCalories || 0),
    protein:  Number(doc.totalProtein  || 0),
    fat:      Number(doc.totalFat      || 0),
    carb:     Number(doc.totalCarbs    || 0),
  };
}

// Aggregate items => totals (expects each item to have `mealDoc` and `quantity`)
function comboTotals(items = []) {
  return items.reduce((t, it) => {
    const q = Number(it.quantity || 1);
    const m = _fromDoc(it.mealDoc || {});
    t.grams    += m.grams    * q;
    t.calories += m.calories * q;
    t.protein  += m.protein  * q;
    t.fat      += m.fat      * q;
    t.carb     += m.carb     * q;
    return t;
  }, { grams: 0, calories: 0, protein: 0, fat: 0, carb: 0 });
}

// factor choices: STEP..upper, where upper is derived from cfg.maxPortionSize (sample logic)
function allowedQtyChoicesForMealWithMax(mealLike, cfg = {}, step = STEP, globalMaxFactor = 8) {
  const grams = Number(mealLike?.portionSize || 0);
  const maxPortionSize = Number(cfg.maxPortionSize || 0);
  let maxFromGrams = 1;
  if (grams > 0 && maxPortionSize > 0) {
    maxFromGrams = Math.max(1, Math.floor(maxPortionSize / grams));
  }
  const upper = Math.max(1, Math.min(globalMaxFactor, Math.max(maxFromGrams, 1) * 2));
  const out = [];
  for (let f = step; f <= upper + 1e-9; f += step) out.push(Number(f.toFixed(2)));
  return out;
}

// Feasibility with tolerancePercent (<= demand*(1+tol)) — matches sample
function withinTolerance(tot, cfg, tolerancePercent = 0.10) {
  const tol = Number(tolerancePercent) || 0;
  return (
    tot.calories <= Number(cfg.calorieDemand || 0) * (1 + tol) &&
    tot.protein  <= Number(cfg.proteinDemand || 0) * (1 + tol) &&
    tot.fat      <= Number(cfg.fatDemand     || 0) * (1 + tol) &&
    tot.carb     <= Number(cfg.carbDemand    || 0) * (1 + tol)
  );
}

// Build demand for a slot from total NR + per-slot portions
function calcDemand(nr = {}, tc = {}) {
  const tCal = Number(nr.calories || 0);
  const tPro = Number(nr.protein  || 0);
  const tCar = Number(nr.carbs    || 0);
  const tFat = Number(nr.fats ?? nr.fat ?? 0);
  return {
    calories: Math.max(0, Number((tCal * Number(tc.caloriePortion || 0)).toFixed(2))),
    protein:  Math.max(0, Number((tPro * Number(tc.proteinPortion || 0)).toFixed(2))),
    carbs:    Math.max(0, Number((tCar * Number(tc.carbPortion    || 0)).toFixed(2))),
    fats:     Math.max(0, Number((tFat * Number(tc.fatPortion     || 0)).toFixed(2))),
  };
}

module.exports = {
  STEP,
  planCost,
  comboTotals,
  allowedQtyChoicesForMealWithMax,
  withinTolerance,
  calcDemand,
};
