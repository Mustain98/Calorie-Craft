const express = require('express');
const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUser,
  addMealToMyMeals,
  deleteMealFromMyMeals,
  showMeals,
  getMyMealById,
  updatePassword,
  shareMeal,
  showTimedMealConfiguration,
  updateTimedMealConfiguration,
  resetTimedMealConfiguration
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware.js');
const {parser} =require('../utils/cloudinary');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.put('/me', protect, updateUser);
router.post('/me/myMeals',protect,parser.single('image'),addMealToMyMeals);
router.get('/me/myMeals/:id', protect, getMyMealById);
router.delete('/me/myMeals/:id',protect,deleteMealFromMyMeals);
router.get('/me/myMeals/',protect,showMeals);
router.put('/me/password',protect,updatePassword);
router.post('/me/shareMeal/:id',protect,shareMeal);
router.get('/me/myMealPlanSetting',protect,showTimedMealConfiguration);
router.put('/me/updateMealPlanSetting',protect,updateTimedMealConfiguration);
router.put("/me/resetMealPlanSetting",protect, resetTimedMealConfiguration);
module.exports = router;
