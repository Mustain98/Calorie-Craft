const express = require('express');
const {
  getAllFoodItems,
  getFoodItemByName,
  deleteFoodItem,
  createFoodItem,
  searchFoodItems
} = require('../controllers/foodItemController');

const router = express.Router();

// Route setup
router.get('/search', searchFoodItems);
router.get('/', getAllFoodItems);
router.get('/:name', getFoodItemByName);
router.delete('/:id', deleteFoodItem);
router.post('/', createFoodItem);

module.exports = router;
