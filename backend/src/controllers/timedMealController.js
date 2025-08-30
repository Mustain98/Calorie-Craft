// backend/src/controllers/timedMealController.js
const TimedMeal = require('../models/timedMeal');
const User = require('../models/user');

const STEP = (() => {
  const raw = process.env.UNIT_PORTION_FACTOR || process.env.unitPortionFactor;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0.25;
})();

const roundToStep = (q) => {
  const base = Number(q ?? STEP);
  const rounded = Math.max(STEP, Math.round(base / STEP) * STEP);
  return Number(rounded.toFixed(2));
};

const num = (x, d = 0) => (Number.isFinite(Number(x)) ? Number(x) : d);

// normalize ONE item (system or user snapshot)
async function normalizeItemFromPayload(raw, userId) {
  if (!raw || typeof raw !== 'object') return null;
  const quantity = roundToStep(raw.quantity);

  // user meal snapshot path
  if (raw.source === 'user' || raw.userMealId) {
    const u = await User.findById(userId).select('myMeals').lean();
    if (!u) throw new Error('User not found for user meal item');
    const m = (u.myMeals || []).find(mm => String(mm._id) === String(raw.userMealId));
    if (!m) throw new Error('userMealId not found in your myMeals');

    return {
      source: 'user',
      user: userId,
      userMealId: m._id,
      quantity,
      name: m.name,
      portionSize: num(m.portionSize, 0),
      totalCalories: num(m.totalCalories, 0),
      totalProtein:  num(m.totalProtein, 0),
      totalCarbs:    num(m.totalCarbs, 0),
      totalFat:      num(m.totalFat, 0),
    };
  }

  // system meal path
  if (!raw.meal) throw new Error('Missing meal id for system item');
  return { source: 'system', meal: raw.meal, quantity };
}

async function normalizeComboFromPayload(combo, userId) {
  if (!combo || typeof combo !== 'object') return null;
  const items = Array.isArray(combo.meals) ? combo.meals : [];
  const normMeals = await Promise.all(items.map(it => normalizeItemFromPayload(it, userId)));
  return { meals: normMeals.filter(Boolean), cost: num(combo.cost, 0) };
}

function pickMinCostCombo(arr = []) {
  if (!arr.length) return null;
  return arr.reduce((best, x) => (num(x?.cost, Infinity) < num(best?.cost, Infinity) ? x : best));
}

/* ---------------- CRUD ---------------- */

exports.createTimedMeal = async (req, res) => {
  try {
    const { name, type, mealCombos = [], choosenCombo } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'name and type are required' });

    const combos = (await Promise.all(mealCombos.map(c => normalizeComboFromPayload(c, req.user.id))))
      .filter(Boolean);

    let chosen = null;
    if (choosenCombo) chosen = await normalizeComboFromPayload(choosenCombo, req.user.id);
    if (!chosen) chosen = pickMinCostCombo(combos) || null;

    const doc = new TimedMeal({ name, type, mealCombos: combos, choosenCombo: chosen });
    await doc.save();

    const populated = await TimedMeal.findById(doc._id)
      .populate('mealCombos.meals.meal')
      .populate('choosenCombo.meals.meal');

    return res.status(201).json(populated);
  } catch (err) {
    console.error('[createTimedMeal] error:', err);
    return res.status(500).json({ error: 'Failed to create timed meal', details: err.message });
  }
};

exports.getAllTimedMeals = async (_req, res) => {
  try {
    const timedMeals = await TimedMeal.find()
      .populate('mealCombos.meals.meal')
      .populate('choosenCombo.meals.meal');
    return res.status(200).json(timedMeals);
  } catch (err) {
    console.error('[getAllTimedMeals] error:', err);
    return res.status(500).json({ error: 'Failed to fetch timed meals', details: err.message });
  }
};

exports.getTimedMealById = async (req, res) => {
  try {
    const timedMeal = await TimedMeal.findById(req.params.id)
      .populate('mealCombos.meals.meal')
      .populate('choosenCombo.meals.meal');
    if (!timedMeal) return res.status(404).json({ error: 'Timed meal not found' });
    return res.status(200).json(timedMeal);
  } catch (err) {
    console.error('[getTimedMealById] error:', err);
    return res.status(500).json({ error: 'Failed to fetch timed meal', details: err.message });
  }
};

/**
 * Update supports:
 * - name/type changes
 * - Replace entire mealCombos
 * - addCombo / removeComboIndex / replaceComboAt
 * - choose choosenCombo by payload, min-cost, or by index
 * Payload items can be system or user snapshots.
 */
exports.updateTimedMeal = async (req, res) => {
  try {
    const {
      name, type,
      mealCombos, addCombo, removeComboIndex, replaceComboAt,
      choosenCombo, chooseMinCost, chooseIndex
    } = req.body;

    const tm = await TimedMeal.findById(req.params.id);
    if (!tm) return res.status(404).json({ error: 'Timed meal not found' });

    if (typeof name === 'string') tm.name = name;
    if (typeof type === 'string') tm.type = type;

    if (Array.isArray(mealCombos)) {
      tm.mealCombos = (await Promise.all(mealCombos.map(c => normalizeComboFromPayload(c, req.user.id))))
        .filter(Boolean);
    }
    if (addCombo) {
      const n = await normalizeComboFromPayload(addCombo, req.user.id);
      if (n) tm.mealCombos.push(n);
    }
    if (Number.isInteger(removeComboIndex) && removeComboIndex >= 0 && removeComboIndex < tm.mealCombos.length) {
      tm.mealCombos.splice(removeComboIndex, 1);
    }
    if (replaceComboAt && Number.isInteger(replaceComboAt.index) && replaceComboAt.combo) {
      const idx = replaceComboAt.index;
      if (idx >= 0 && idx < tm.mealCombos.length) {
        const n = await normalizeComboFromPayload(replaceComboAt.combo, req.user.id);
        if (n) tm.mealCombos[idx] = n;
      }
    }

    if (choosenCombo) {
      const n = await normalizeComboFromPayload(choosenCombo, req.user.id);
      if (n) tm.choosenCombo = n;
    } else if (chooseMinCost) {
      const best = pickMinCostCombo(tm.mealCombos);
      if (best) tm.choosenCombo = best;
    } else if (Number.isInteger(chooseIndex) && chooseIndex >= 0 && chooseIndex < tm.mealCombos.length) {
      tm.choosenCombo = tm.mealCombos[chooseIndex];
    }

    await tm.save();

    const populated = await TimedMeal.findById(tm._id)
      .populate('mealCombos.meals.meal')
      .populate('choosenCombo.meals.meal');

    return res.status(200).json(populated);
  } catch (err) {
    console.error('[updateTimedMeal] error:', err);
    return res.status(500).json({ error: 'Failed to update timed meal', details: err.message });
  }
};

exports.deleteTimedMeal = async (req, res) => {
  try {
    const timedMeal = await TimedMeal.findByIdAndDelete(req.params.id);
    if (!timedMeal) return res.status(404).json({ error: 'Timed meal not found' });
    return res.status(200).json({ message: 'Timed meal deleted successfully' });
  } catch (err) {
    console.error('[deleteTimedMeal] error:', err);
    return res.status(500).json({ error: 'Failed to delete timed meal', details: err.message });
  }
};
