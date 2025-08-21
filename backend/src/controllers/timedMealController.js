const TimedMeal = require('../models/timedMeal');

// @desc    Create a new TimedMeal (e.g., breakfast)
const createTimedMeal = async (req, res) => {
  try {
    const { name, meals } = req.body;

    if (!name || !Array.isArray(meals)) {
      return res.status(400).json({ error: 'Invalid timed meal data' });
    }

    const newTimedMeal = new TimedMeal({ name, meals });
    await newTimedMeal.save();

    res.status(201).json(newTimedMeal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create timed meal', details: err.message });
  }
};

// @desc    Get all TimedMeals
const getAllTimedMeals = async (req, res) => {
  try {
    const timedMeals = await TimedMeal.find().populate('meals');
    res.status(200).json(timedMeals);
  } catch (err) {
    console.error('Error fetching timed meals:', err);  // <-- log full error to console
    res.status(500).json({ error: 'Failed to fetch timed meals', details: err.message });
  }
};


// @desc    Get a TimedMeal by ID
const getTimedMealById = async (req, res) => {
  try {
    const timedMeal = await TimedMeal.findById(req.params.id).populate('meals');
    if (!timedMeal) {
      return res.status(404).json({ error: 'Timed meal not found' });
    }
    res.status(200).json(timedMeal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch timed meal' });
  }
};

// @desc    Update a TimedMeal
const updateTimedMeal = async (req, res) => {
  try {
    const { name, meals } = req.body;

    const timedMeal = await TimedMeal.findById(req.params.id);
    if (!timedMeal) {
      return res.status(404).json({ error: 'Timed meal not found' });
    }

    if (name) timedMeal.name = name;
    if (Array.isArray(meals)) timedMeal.meals = meals;

    await timedMeal.save();
    res.status(200).json(timedMeal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update timed meal', details: err.message });
  }
};

// @desc    Delete a TimedMeal
const deleteTimedMeal = async (req, res) => {
  try {
    const timedMeal = await TimedMeal.findByIdAndDelete(req.params.id);
    if (!timedMeal) {
      return res.status(404).json({ error: 'Timed meal not found' });
    }

    res.status(200).json({ message: 'Timed meal deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete timed meal', details: err.message });
  }
};

module.exports = {
  createTimedMeal,
  getAllTimedMeals,
  getTimedMealById,
  updateTimedMeal,
  deleteTimedMeal
};
