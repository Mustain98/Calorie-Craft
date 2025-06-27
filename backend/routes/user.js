const express = require('express');
const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.put('/me', protect, updateUser);

module.exports = router;
