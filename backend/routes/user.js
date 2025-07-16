const express = require('express');
const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUser,
  addMealToMyMeals,
  deleteMealFromMyMeals,
  showMeals,
  updatePassword
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const {parser} =require('../utils/cloudinary');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.put('/me', protect, updateUser);
router.post('/me/myMeals',protect,parser.single('image'),addMealToMyMeals);
router.delete('/me/myMeals/:id',protect,deleteMealFromMyMeals);
router.get('/me/myMeals/',protect,showMeals);
router.put('/me/password',protect,updatePassword);
module.exports = router;
