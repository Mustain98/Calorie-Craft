const DayPlan = require('../models/dayPlan');
const TimedMeal = require('../models/timedMeal');

// @desc Create a new DayPlan
const createDayPlan = async (req, res) => {
  try {
    const { day, timedMeals } = req.body;

    if (!day || !Array.isArray(timedMeals)) {
      return res.status(400).json({ error: 'Invalid day plan data' });
    }

    // Optional: Fetch and sum all macros from timed meals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const timedMealDocs = await TimedMeal.find({ _id: { $in: timedMeals } });
    timedMealDocs.forEach(tm => {
      totalCalories += tm.totalCalories || 0;
      totalProtein += tm.totalProtein || 0;
      totalCarbs += tm.totalCarbs || 0;
      totalFat += tm.totalFat || 0;
    });

    const newDayPlan = new DayPlan({
      day,
      timedMeals,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    });

    await newDayPlan.save();
    res.status(201).json(newDayPlan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create day plan', details: err.message });
  }
};

// @desc Get all DayPlans
const getAllDayPlans = async (req, res) => {
  try {
    const plans = await DayPlan.find().populate({
      path: 'timedMeals',
      populate: {
        path: 'meals',
        populate: 'foodItems.food'
      }
    });
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch day plans', details: err.message });
  }
};

// @desc Get a single DayPlan by ID
const getDayPlanById = async (req, res) => {
  try {
    const plan = await DayPlan.findById(req.params.id).populate({
      path: 'timedMeals',
      populate: {
        path: 'meals',
        populate: 'foodItems.food'
      }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Day plan not found' });
    }

    res.status(200).json(plan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch day plan', details: err.message });
  }
};

// @desc Delete a DayPlan
const deleteDayPlan = async (req, res) => {
  try {
    const plan = await DayPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Day plan not found' });
    }

    res.status(200).json({ message: 'Day plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete day plan', details: err.message });
  }
};

module.exports = {
  createDayPlan,
  getAllDayPlans,
  getDayPlanById,
  deleteDayPlan
};
