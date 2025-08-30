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
    // if user already has a weekPlan, delete it (and children) first
    const user = await User.findById(req.user.id).select('weekPlan');
    if (user?.weekPlan) {
      await deleteWeekPlanByIdInternal(user.weekPlan);
      user.weekPlan = undefined;
      await user.save();
    }

    const wp = await createWeekPlan(req.user.id); // attaches weekPlan to user AFTER creation
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

    const wp = await WeekPlan.findById(user.weekPlan).populate({
      path: 'days',
      populate: {
        path: 'timedMeals',
        populate: [
          { path: 'mealCombos.meals.meal' },
          { path: 'choosenCombo.meals.meal' },
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
    const user = await User.findById(req.user.id).select('weekPlan');
    if (!user?.weekPlan) return res.json({ message: 'No plan to delete' });

    await deleteWeekPlanByIdInternal(user.weekPlan);
    user.weekPlan = undefined;
    await user.save();

    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('[deleteMyCurrentWeekPlan]', err);
    return res.status(500).json({ error: 'Failed to delete' });
  }
};

// POST /api/weekPlans/timed-meal/:tmId/regenerate
exports.regenerateTimedMeal = async (req, res) => {
  try {
    const tm = await regenerateTimedMealById(req.user.id, req.params.tmId, req.body || {});
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
