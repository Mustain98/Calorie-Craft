const express = require('express');
const {
  createMeal,
  updateMeal,
  deleteMeal,
  getAllMeals,
  getMealById
} = require('../controllers/mealController');

const router = express.Router();

router.post('/', createMeal);
router.patch('/:id', updateMeal);  
router.delete('/:id', deleteMeal);
router.get('/', getAllMeals);
router.get('/:id', getMealById);

module.exports = router;
