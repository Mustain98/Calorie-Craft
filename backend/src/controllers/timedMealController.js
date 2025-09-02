// backend/src/controllers/timedMealController.js
const mongoose = require('mongoose');
const TimedMeal = require('../models/timedMeal');
const UserMeal = require('../models/userMeal');
const Meal     = require('../models/meal');
const User     = require('../models/user');

const {
  STEP,
  planCost,
  calcDemand,
  withinTolerance,
} = require('../service/nutritionCost');

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const r2 = (v) => Math.round((Number(v) + Number.EPSILON) * 100) / 100;

// env knobs used here
const GLOBAL_MAX_FACTOR = Math.max(1, Number(process.env.REC_GLOBAL_MAX_FACTOR || 6));
const TOL_PCT = Math.max(0, Math.min(1, Number(process.env.REC_TOLERANCE_PCT || 0.10)));

// DEEP populate: include nested foodItems.food for both system and user meals
const populateFull = [
  { path: 'choosenCombo.meals.meal',     populate: { path: 'foodItems.food' } },
  { path: 'choosenCombo.meals.userMeal', populate: { path: 'foodItems.food' } },
  { path: 'mealCombos.meals.meal',       populate: { path: 'foodItems.food' } },
  { path: 'mealCombos.meals.userMeal',   populate: { path: 'foodItems.food' } },
];

function ensureOwner(doc, req) {
  if (!doc) return;
  if (req?.user?.id && String(doc.user) !== String(req.user.id)) {
    const err = new Error('Forbidden: not your timed meal');
    err.status = 403;
    throw err;
  }
}

function normalizeEmbeddedItem(raw) {
  const item = {
    source: raw?.source === 'user' ? 'user' : 'system',
    quantity: Number.isFinite(Number(raw?.quantity)) ? Math.max(0.25, Number(raw.quantity)) : 1,
  };
  if (raw?.userMeal && isObjectId(raw.userMeal)) {
    item.userMeal = raw.userMeal; item.source = 'user';
  } else if (raw?.meal && isObjectId(raw.meal)) {
    item.meal = raw.meal; item.source = 'system';
  } else {
    return null;
  }
  return item;
}

// ---- helper: extract macros from (userMeal|meal) doc
function macrosFromDoc(doc = {}) {
  return {
    grams:    Number(doc.portionSize   || 0),
    calories: Number(doc.totalCalories || 0),
    protein:  Number(doc.totalProtein  || 0),
    carbs:    Number(doc.totalCarbs    || 0),
    fats:     Number(doc.totalFat      || 0),
  };
}

// ---- helper: compute current chosen totals from populated doc
function chosenTotals(tm) {
  let c = 0, p = 0, cb = 0, f = 0, g = 0;
  const items = tm?.choosenCombo?.meals || [];
  for (const it of items) {
    const qty = Number.isFinite(Number(it?.quantity)) ? Number(it.quantity) : 1;
    const base = it?.userMeal || it?.meal;
    if (!base) continue;
    const m = macrosFromDoc(base);
    g += m.grams    * qty;
    c += m.calories * qty;
    p += m.protein  * qty;
    cb+= m.carbs    * qty;
    f += m.fats     * qty;
  }
  return { grams: r2(g), calories: r2(c), protein: r2(p), carbs: r2(cb), fats: r2(f) };
}

// ---- helper: compute max factor so THIS meal alone could meet remaining demand
function maxFactorToMeetRemaining(mealDoc, remaining, cap = GLOBAL_MAX_FACTOR) {
  const m = macrosFromDoc(mealDoc);
  // build positive ratios only (where remaining > 0 and meal macro > 0)
  const ratios = [];
  if (m.calories > 0 && remaining.calories > 0) ratios.push(remaining.calories / m.calories);
  if (m.protein  > 0 && remaining.protein  > 0) ratios.push(remaining.protein  / m.protein);
  if (m.fats     > 0 && remaining.fats     > 0) ratios.push(remaining.fats     / m.fats);
  if (m.carbs    > 0 && remaining.carbs    > 0) ratios.push(remaining.carbs    / m.carbs);

  if (!ratios.length) return STEP; // nothing to fill or meal can't help → minimal step
  const fMax = Math.max(...ratios);
  if (!Number.isFinite(fMax) || fMax <= 0) return STEP;
  return Math.max(STEP, Math.min(cap, Number(fMax.toFixed(6))));
}

/* ----------------------------- CONTROLLERS ----------------------------- */

// POST /api/timed-meals
async function create(req, res) {
  try {
    const userId = req.user?.id || req.body.user;
    if (!userId || !isObjectId(userId)) return res.status(400).json({ error: 'Missing/invalid user id' });

    const { name, type, weekPlan, choosenCombo, mealCombos } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'name and type are required' });

    const doc = new TimedMeal({
      name,
      type,
      user: userId,
      weekPlan: isObjectId(weekPlan) ? weekPlan : undefined,
      choosenCombo: undefined,
      mealCombos: [],
    });

    if (mealCombos && Array.isArray(mealCombos)) {
      doc.mealCombos = mealCombos.map(c => ({
        cost: Number.isFinite(Number(c?.cost)) ? Number(c.cost) : 0,
        meals: Array.isArray(c?.meals) ? c.meals.map(normalizeEmbeddedItem).filter(Boolean) : [],
      }));
    }

    if (choosenCombo && typeof choosenCombo === 'object') {
      doc.choosenCombo = {
        cost: Number.isFinite(Number(choosenCombo?.cost)) ? Number(choosenCombo.cost) : 0,
        meals: Array.isArray(choosenCombo?.meals) ? choosenCombo.meals.map(normalizeEmbeddedItem).filter(Boolean) : [],
      };
    }

    await doc.save();
    await doc.populate(populateFull);
    return res.status(201).json({ message: 'Created', timedMeal: doc });
  } catch (err) {
    console.error('[create timed meal]', err);
    return res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
}

// DELETE /api/timed-meals/:id
async function remove(req, res) {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

    const doc = await TimedMeal.findById(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    ensureOwner(doc, req);

    await doc.deleteOne();
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('[delete timed meal]', err);
    return res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
}

// GET /api/timed-meals
async function getAll(req, res) {
  try {
    const userId = req.user?.id || req.query.user;
    if (!userId || !isObjectId(userId)) return res.status(400).json({ error: 'Missing/invalid user id' });

    const { type, weekPlan, page = 1, limit = 20 } = req.query;
    const q = { user: userId };
    if (type) q.type = type;
    if (weekPlan && isObjectId(weekPlan)) q.weekPlan = weekPlan;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      TimedMeal.find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate(populateFull)
        .lean(),
      TimedMeal.countDocuments(q),
    ]);

    return res.json({
      data: items,
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (err) {
    console.error('[getAll timed meals]', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// GET /api/timed-meals/:id
async function getById(req, res) {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

    const doc = await TimedMeal.findById(id).populate(populateFull);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    ensureOwner(doc, req);

    return res.json({ timedMeal: doc });
  } catch (err) {
    console.error('[getById timed meal]', err);
    return res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
}

// PATCH /api/timed-meals/:id/add-user-meal
async function addUserMealToChosenCombo(req, res) {
  try {
    const { id } = req.params;
    const { userMealId, quantity } = req.body;

    if (!isObjectId(id)) return res.status(400).json({ error: 'Invalid timed meal id' });
    if (!isObjectId(userMealId)) return res.status(400).json({ error: 'Invalid userMealId' });

    const um = await UserMeal.findById(userMealId).select('_id user');
    if (!um) return res.status(404).json({ error: 'UserMeal not found' });
    if (req?.user?.id && String(um.user) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden: UserMeal not yours' });
    }

    const doc = await TimedMeal.findById(id);
    if (!doc) return res.status(404).json({ error: 'TimedMeal not found' });
    ensureOwner(doc, req);

    if (!doc.choosenCombo) doc.choosenCombo = { meals: [], cost: 0 };
    if (!Array.isArray(doc.choosenCombo.meals)) doc.choosenCombo.meals = [];

    const qty = Number.isFinite(Number(quantity)) ? Math.max(0.25, Number(quantity)) : 1;
    doc.choosenCombo.meals.push({
      source: 'user',
      userMeal: userMealId,
      quantity: qty,
    });

    await doc.save();
    await doc.populate(populateFull);
    return res.json({ message: 'Added', timedMeal: doc });
  } catch (err) {
    console.error('[addUserMealToChosenCombo]', err);
    return res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
}

// PUT /api/timed-meals/:id/replace-chosen
async function replaceChosenComboByOtherCombo(req, res) {
  try {
    const { id } = req.params;
    const { otherComboIndex, otherCombo } = req.body;

    if (!isObjectId(id)) return res.status(400).json({ error: 'Invalid timed meal id' });

    const doc = await TimedMeal.findById(id);
    if (!doc) return res.status(404).json({ error: 'TimedMeal not found' });
    ensureOwner(doc, req);

    if (Number.isInteger(otherComboIndex)) {
      const idx = Number(otherComboIndex);
      if (!Array.isArray(doc.mealCombos) || idx < 0 || idx >= doc.mealCombos.length) {
        return res.status(400).json({ error: 'otherComboIndex out of range' });
      }
      const src = doc.mealCombos[idx];
      doc.choosenCombo = {
        cost: Number.isFinite(Number(src?.cost)) ? Number(src.cost) : 0,
        meals: (src?.meals || []).map(m => ({
          source: m?.source === 'user' ? 'user' : 'system',
          quantity: Number.isFinite(Number(m?.quantity)) ? Math.max(0.25, Number(m.quantity)) : 1,
          meal: m?.meal,
          userMeal: m?.userMeal,
        })),
      };
    } else if (otherCombo && typeof otherCombo === 'object') {
      const normalizedMeals = Array.isArray(otherCombo.meals)
        ? otherCombo.meals.map(normalizeEmbeddedItem).filter(Boolean)
        : [];
      doc.choosenCombo = {
        cost: Number.isFinite(Number(otherCombo?.cost)) ? Number(otherCombo.cost) : 0,
        meals: normalizedMeals,
      };
    } else {
      return res.status(400).json({ error: 'Provide either otherComboIndex or otherCombo' });
    }

    await doc.save();
    await doc.populate(populateFull);
    return res.json({ message: 'Replaced', timedMeal: doc });
  } catch (err) {
    console.error('[replaceChosenComboByOtherCombo]', err);
    return res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
}

// PATCH /api/timed-meals/:id/remove-chosen-meal
// body: { itemIndex?: number, mealId?: string, removeAll?: boolean }
async function removeMealFromChosenCombo(req, res) {
  try {
    const { id } = req.params;
    const { itemIndex, mealId, removeAll } = req.body || {};

    if (!isObjectId(id)) return res.status(400).json({ error: 'Invalid timed meal id' });

    const doc = await TimedMeal.findById(id);
    if (!doc) return res.status(404).json({ error: 'TimedMeal not found' });
    ensureOwner(doc, req);

    if (!doc.choosenCombo || !Array.isArray(doc.choosenCombo.meals) || doc.choosenCombo.meals.length === 0) {
      return res.status(400).json({ error: 'No meals in chosen combo' });
    }

    const list = doc.choosenCombo.meals;

    const sameId = (val, target) => {
      if (!val) return false;
      const v = typeof val === 'object' && val._id ? val._id : val;
      return String(v) === String(target);
    };

    if (Number.isInteger(itemIndex)) {
      const idx = Number(itemIndex);
      if (idx < 0 || idx >= list.length) return res.status(400).json({ error: 'itemIndex out of range' });
      list.splice(idx, 1);
    } else {
      if (!mealId || !isObjectId(mealId)) {
        return res.status(400).json({ error: 'Provide a valid mealId (system meal _id or userMeal _id)' });
      }
      const target = String(mealId);

      const matches = (m) => sameId(m.meal, target) || sameId(m.userMeal, target);

      if (removeAll) {
        const before = list.length;
        doc.choosenCombo.meals = list.filter(m => !matches(m));
        if (doc.choosenCombo.meals.length === before) {
          return res.status(404).json({ error: 'Matching meal not found in chosen combo' });
        }
      } else {
        const idx = list.findIndex(matches);
        if (idx === -1) return res.status(404).json({ error: 'Matching meal not found in chosen combo' });
        list.splice(idx, 1);
      }
    }

    await doc.save();
    await doc.populate(populateFull);
    return res.json({ message: 'Removed', timedMeal: doc });
  } catch (err) {
    console.error('[removeMealFromChosenCombo]', err);
    return res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
}

async function validateAddQuantity(req, res) {
  try {
    const { id } = req.params;
    const { mealId } = req.body || {};
    if (!isObjectId(id))     return res.status(400).json({ error: 'Invalid timed meal id' });
    if (!isObjectId(mealId)) return res.status(400).json({ error: 'Invalid mealId' });

    // 1) Load timed meal (with chosen populated) and ensure ownership
    const tm = await TimedMeal.findById(id)
      .populate({ path: 'choosenCombo.meals.meal',     select: 'portionSize totalCalories totalProtein totalCarbs totalFat' })
      .populate({ path: 'choosenCombo.meals.userMeal', select: 'portionSize totalCalories totalProtein totalCarbs totalFat user' });
    if (!tm) return res.status(404).json({ error: 'TimedMeal not found' });
    ensureOwner(tm, req);

    // 2) Resolve candidate meal: prefer UserMeal (and ensure it belongs to the user)
    let candidateDoc = await UserMeal.findById(mealId)
      .select('portionSize totalCalories totalProtein totalCarbs totalFat user');
    let source = 'user';
    if (!candidateDoc) {
      candidateDoc = await Meal.findById(mealId)
        .select('portionSize totalCalories totalProtein totalCarbs totalFat');
      source = 'system';
    }
    if (!candidateDoc) return res.status(404).json({ error: 'Meal not found' });
    if (source === 'user' && req?.user?.id && String(candidateDoc.user) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden: UserMeal not yours' });
    }

    // 3) Build slot demand: NR × timedMealConfig[type]
    const user = await User.findById(tm.user).select('nutritionalRequirement timedMealConfig');
    if (!user?.nutritionalRequirement) return res.status(400).json({ error: 'User NR not found' });
    const tc = (user.timedMealConfig || []).find(x => x.type === tm.type);
    if (!tc) return res.status(400).json({ error: `No timedMealConfig entry for type ${tm.type}` });

    const slotDemand = calcDemand(user.nutritionalRequirement, tc); // { calories, protein, carbs, fats }

    // 4) Current chosen totals
    const current = chosenTotals(tm);

    // 5) Remaining demand = slotDemand - current
    const remain = {
      calories: Math.max(0, r2(slotDemand.calories - current.calories)),
      protein:  Math.max(0, r2(slotDemand.protein  - current.protein)),
      carbs:    Math.max(0, r2(slotDemand.carbs    - current.carbs)),
      fats:     Math.max(0, r2(slotDemand.fats     - current.fats)),
    };

    // 6) Determine quantity range [STEP .. fMax] based on remaining demand and per-portion macros
    const fMax = maxFactorToMeetRemaining(candidateDoc, remain, GLOBAL_MAX_FACTOR);
    // Build discrete choices in STEP increments
    const choices = [];
    for (let q = STEP; q <= fMax + 1e-9; q += STEP) {
      const m = macrosFromDoc(candidateDoc);
      const newTotals = {
        grams:    r2(current.grams    + m.grams    * q),
        calories: r2(current.calories + m.calories * q),
        protein:  r2(current.protein  + m.protein  * q),
        carbs:    r2(current.carbs    + m.carbs    * q),
        fats:     r2(current.fats     + m.fats     * q),
      };
      const cost = Number(planCost(
        { calories: newTotals.calories, protein: newTotals.protein, fat: newTotals.fats, carb: newTotals.carbs },
        slotDemand
      ).toFixed(4));
      const feasible = withinTolerance(
        { calories: newTotals.calories, protein: newTotals.protein, fat: newTotals.fats, carb: newTotals.carbs },
        {
          calorieDemand: slotDemand.calories,
          proteinDemand: slotDemand.protein,
          fatDemand:     slotDemand.fats,
          carbDemand:    slotDemand.carbs
        },
        TOL_PCT
      );
      choices.push({
        quantity: Number(q.toFixed(2)),
        totals: newTotals,
        cost,
        feasible
      });
      // early exit if we hit perfect zero cost (rare but nice)
      if (feasible && cost === 0) break;
    }

    if (!choices.length) {
      // edge case: no positive step fits (e.g., all remaining ≤0 or meal macros are 0)
      return res.json({
        source,
        minQty: STEP,
        maxQty: STEP,
        step: STEP,
        remainingDemand: remain,
        message: 'No positive beneficial quantity inferred; adding more will likely increase cost.',
      });
    }

    // 7) Pick the best (lowest cost), prefer feasible
    choices.sort((a, b) => {
      if (a.feasible && !b.feasible) return -1;
      if (!a.feasible && b.feasible) return 1;
      return a.cost - b.cost;
    });
    const best = choices[0];

    return res.json({
      source,
      step: STEP,
      minQty: STEP,
      maxQty: Number(fMax.toFixed(2)),
      remainingDemand: remain,
      slotDemand,
      currentTotals: current,
      best,
      // limit table length to avoid huge payloads
      table: choices.slice(0, 40)
    });
  } catch (err) {
    console.error('[validateAddQuantity]', err);
    return res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
}

module.exports = {
  create,
  remove,
  getAll,
  getById,
  addUserMealToChosenCombo,
  replaceChosenComboByOtherCombo,
  removeMealFromChosenCombo,
  validateAddQuantity,
};
