const WeekPlan = require('../models/weekPlan');
const DayPlan = require('../models/dayPlan');

// @desc Create a new WeekPlan
const createWeekPlan = async (req, res) => {
  try {
    const { days } = req.body;

    if (!Array.isArray(days)) {
      return res.status(400).json({ error: 'Invalid or missing days array' });
    }

    const newWeekPlan = new WeekPlan({ days });
    await newWeekPlan.save();

    res.status(201).json(newWeekPlan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create week plan', details: err.message });
  }
};

// @desc Get all WeekPlans
const getAllWeekPlans = async (req, res) => {
  try {
    const plans = await WeekPlan.find().populate({
      path: 'days',
      populate: {
        path: 'timedMeals',
        populate: {
          path: 'meals',
          populate: 'foodItems.food'
        }
      }
    });

    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch week plans', details: err.message });
  }
};

// @desc Get a single WeekPlan by ID
const getWeekPlanById = async (req, res) => {
  try {
    const plan = await WeekPlan.findById(req.params.id).populate({
      path: 'days',
      populate: {
        path: 'timedMeals',
        populate: {
          path: 'meals',
          populate: 'foodItems.food'
        }
      }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Week plan not found' });
    }

    res.status(200).json(plan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch week plan', details: err.message });
  }
};

// @desc Delete a WeekPlan
const deleteWeekPlan = async (req, res) => {
  try {
    const plan = await WeekPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Week plan not found' });
    }

    res.status(200).json({ message: 'Week plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete week plan', details: err.message });
  }
};

module.exports = {
  createWeekPlan,
  getAllWeekPlans,
  getWeekPlanById,
  deleteWeekPlan
};
