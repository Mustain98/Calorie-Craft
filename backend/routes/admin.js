const express = require('express');
const router = express.Router();
const { adminLogin,showAllPendingMeals,deletePendingMeal,addToSystemMeals, createAdmin,createFoodItem,createMeal,deleteFoodItem,updateMeal,deleteMeal} = require('../controllers/adminController');
const protectAdmin = require('../middleware/authAdmin');


router.post('/create',protectAdmin, createAdmin);
router.post('/login', adminLogin);

router.get('/pending-meals', protectAdmin,showAllPendingMeals);
router.post('/pending-meals/:pendingMealId', protectAdmin,addToSystemMeals);
router.delete('/pending-meals/:pendingMealId', protectAdmin,deletePendingMeal);
router.post('/meal',protectAdmin,createMeal);
router.post('/foodItem',protectAdmin,createFoodItem);
router.patch('/meal/:id',protectAdmin,updateMeal);
router.delete('/meal/:id',protectAdmin,deleteMeal);
router.delete('/foodItem/:id',protectAdmin,deleteFoodItem);
module.exports = router;
