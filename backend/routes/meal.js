const express = require('express');
const {
  createMeal,
  updateMeal,
  deleteMeal,
  getAllMeals,
  getMealById
} = require('../controllers/mealController');

const router = express.Router();

const { parser } = require('../utils/cloudinary'); // image upload parser
// Create meal with image
router.post('/', parser.single('image'), createMeal);
<<<<<<< HEAD

=======
>>>>>>> 2672b9a82cac937c216008e8f790e678d4b87372
router.patch('/:id', updateMeal);  
router.delete('/:id', deleteMeal);
router.get('/', getAllMeals);
router.get('/:id', getMealById);

module.exports = router;
