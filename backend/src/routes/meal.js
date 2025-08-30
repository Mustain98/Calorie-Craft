const express = require('express');
const {
  createMeal,
  updateMeal,
  deleteMeal,
  getAllMeals,
  getMealById,
  searchMeal,
  getMealsByCategories
} = require('../controllers/mealController');

const router = express.Router();

const { parser } = require('../utils/cloudinary'); // image upload parser
// Create meal with image
router.post('/', parser.single('image'), createMeal);
router.patch('/:id', updateMeal);  
router.delete('/:id', deleteMeal);
router.get('/search',searchMeal);
router.get('/by-categories',getMealsByCategories);
router.get('/', getAllMeals);
router.get('/:id', getMealById);

module.exports = router;
