const express = require('express');
const router = express.Router();

const {
  createTimedMeal,
  getAllTimedMeals,
  getTimedMealById,
  updateTimedMeal,
  deleteTimedMeal
} = require('../controllers/timedMealController');

// Create a new timed meal (e.g., breakfast)
router.post('/', createTimedMeal);

// Get all timed meals
router.get('/', getAllTimedMeals);

// Get a timed meal by ID
router.get('/:id', getTimedMealById);

// Update a timed meal by ID
router.put('/:id', updateTimedMeal);

// Delete a timed meal by ID
router.delete('/:id', deleteTimedMeal);

module.exports = router;
