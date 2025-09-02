const express = require('express');
const {
  getAllFoodItems,
  deleteFoodItem,
  createFoodItem,
  searchFoodItems,
  getFoodItemByCategory
} = require('../controllers/foodItemController');

const router = express.Router();

// Route setup
router.get('/search', searchFoodItems);
router.get('/', getAllFoodItems);
// router.get('/:name', getFoodItemByName);
router.delete('/:id', deleteFoodItem);
router.post('/', createFoodItem);
router.get('/by_category/:category',getFoodItemByCategory);

module.exports = router;
