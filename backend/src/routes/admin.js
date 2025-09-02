const express = require('express');
const router = express.Router();
const { adminLogin,getCurrentAdmin,showAllPendingMeals,deletePendingMeal,addToSystemMeals, createAdmin,createFoodItem,
    createMeal,deleteFoodItem,updateMeal,deleteMeal,updatePassword} = require('../controllers/adminController');
const protectAdmin = require('../middleware/authAdmin');
const {parser}=require('../utils/cloudinary');

router.post('/create',protectAdmin, createAdmin);
router.post('/login', adminLogin);
router.get('/me',protectAdmin,getCurrentAdmin);
router.get('/pending-meals', protectAdmin,showAllPendingMeals);
router.post('/pending-meals/:pendingMealId', protectAdmin,addToSystemMeals);
router.delete('/pending-meals/:pendingMealId', protectAdmin,deletePendingMeal);
router.post('/meal',protectAdmin,parser.single('image'),createMeal);
router.post('/foodItem',protectAdmin,createFoodItem);
router.put('/meal/:id',protectAdmin,updateMeal);
router.delete('/meal/:id',protectAdmin,deleteMeal);
router.delete('/foodItem/:id',protectAdmin,deleteFoodItem);
router.put('/me/password',protectAdmin,updatePassword);
module.exports = router;
