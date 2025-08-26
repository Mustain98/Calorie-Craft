const express = require('express');
const {
  getAllFoodItems,
  getFoodItemByName,
  getFoodItemByCategory,
  deleteFoodItem,
  createFoodItem,
  searchFoodItems
} = require('../controllers/foodItemController');

const router = express.Router();

// Route setup
router.get('/search', searchFoodItems);               // /fooditems/search?q=apple
router.get('/', getAllFoodItems);                     // /fooditems/
router.get('/category/:category', getFoodItemByCategory); // /fooditems/category/Fruit
router.get('/name/:name', getFoodItemByName);         // /fooditems/name/Apple
router.delete('/:id', deleteFoodItem);                // /fooditems/123
router.post('/', createFoodItem);                     // /fooditems/

module.exports = router;
