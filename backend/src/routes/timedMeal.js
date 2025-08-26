// backend/src/routes/timedMeal.js
const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const c = require('../controllers/timedMealController');

router.post('/', protect, c.createTimedMeal);
router.get('/', protect, c.getAllTimedMeals);
router.get('/:id', protect, c.getTimedMealById);
router.patch('/:id', protect, c.updateTimedMeal);
router.delete('/:id', protect, c.deleteTimedMeal);

module.exports = router;
