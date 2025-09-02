// backend/src/routes/weekPlan.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware.js');
const c = require('../controllers/weekPlanController');

// Generate a fresh week plan (deletes previous if any)
router.post('/', protect, c.generateForCurrentUser);

// Get my current week plan (populated)
router.get('/me', protect, c.getMyCurrentWeekPlan);

// Delete my current week plan (cascade)
router.delete('/me', protect, c.deleteMyCurrentWeekPlan);

// Regenerate a single timed meal
router.post('/timed-meal/:tmId/regenerate', protect, c.regenerateTimedMeal);

// Delete a single timed meal from the plan
router.delete('/timed-meal/:tmId', protect, c.deleteTimedMeal);

module.exports = router;
