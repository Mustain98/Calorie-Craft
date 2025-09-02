// backend/src/controllers/weekPlanController.js
const WeekPlan = require('../models/weekPlan');
const User = require('../models/user');
const {
  createWeekPlan,
  deleteWeekPlanByIdInternal,
  regenerateTimedMealById,
  deleteTimedMealFromWeek,
} = require('../service/weekPlanService');

// POST /api/weekPlans
exports.generateForCurrentUser = async (req, res) => {
  try {
    const uid = req.user.id;

    // If user already has a weekPlan, delete it (and children) first
    const snapBefore = await User.findById(uid).select('weekPlan').lean();
    if (snapBefore?.weekPlan) {
      await deleteWeekPlanByIdInternal(snapBefore.weekPlan);
      await User.updateOne({ _id: uid }, { $unset: { weekPlan: 1 } });
    }

    // createWeekPlan MUST attach a user to every TimedMeal it creates
    const wp = await createWeekPlan(uid);
    return res.status(201).json({ message: 'Generated', weekPlan: wp });
  } catch (err) {
    console.error('[generateForCurrentUser]', err);
    return res.status(500).json({ error: err.message || 'Failed to generate' });
  }
};

// GET /api/weekPlans/me
exports.getMyCurrentWeekPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('weekPlan');
    if (!user?.weekPlan) return res.json({ weekPlan: null });

    // Populate system + user meals, and their foodItems->food
    const wp = await WeekPlan.findById(user.weekPlan).populate({
      path: 'days',
      populate: {
        path: 'timedMeals',
        populate: [
          // system meals (plus nested food items)
          {
            path: 'mealCombos.meals.meal',
            populate: { path: 'foodItems.food' },
          },
          {
            path: 'choosenCombo.meals.meal',
            populate: { path: 'foodItems.food' },
          },
          // user meals (plus nested food items)
          {
            path: 'mealCombos.meals.userMeal',
            populate: { path: 'foodItems.food' },
          },
          {
            path: 'choosenCombo.meals.userMeal',
            populate: { path: 'foodItems.food' },
          },
        ],
      },
    });

    if (!wp) return res.json({ weekPlan: null });
    return res.json({ weekPlan: wp });
  } catch (err) {
    console.error('[getMyCurrentWeekPlan]', err);
    return res.status(500).json({ error: 'Failed to load week plan' });
  }
};

// DELETE /api/weekPlans/me
exports.deleteMyCurrentWeekPlan = async (req, res) => {
  try {
    const uid = req.user.id;
    const snapBefore = await User.findById(uid).select('weekPlan').lean();

    if (!snapBefore?.weekPlan) return res.json({ message: 'No plan to delete' });

    await deleteWeekPlanByIdInternal(snapBefore.weekPlan);
    await User.updateOne({ _id: uid }, { $unset: { weekPlan: 1 } });

    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('[deleteMyCurrentWeekPlan]', err);
    return res.status(500).json({ error: 'Failed to delete' });
  }
};

// POST /api/weekPlans/timed-meal/:tmId/regenerate
exports.regenerateTimedMeal = async (req, res) => {
  try {
    // Ensure the service receives the user id so it sets TimedMeal.user
    const payload = { ...req.body, user: req.user.id };
    const tm = await regenerateTimedMealById(req.user.id, req.params.tmId, payload);

    return res.status(200).json({ message: 'Regenerated', timedMeal: tm });
  } catch (err) {
    console.error('[regenerateTimedMeal]', err);
    return res.status(500).json({ error: err.message || 'Failed to regenerate timed meal' });
  }
};

// DELETE /api/weekPlans/timed-meal/:tmId
exports.deleteTimedMeal = async (req, res) => {
  try {
    const result = await deleteTimedMealFromWeek(req.params.tmId);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[deleteTimedMeal]', err);
    return res.status(500).json({ error: 'Failed to delete timed meal' });
  }
};
