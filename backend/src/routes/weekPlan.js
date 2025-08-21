const express = require('express');
const router = express.Router();

const {
  createWeekPlan,
  getAllWeekPlans,
  getWeekPlanById,
  deleteWeekPlan
} = require('../controllers/weekPlanController');

router.post('/', createWeekPlan);
router.get('/', getAllWeekPlans);
router.get('/:id', getWeekPlanById);
router.delete('/:id', deleteWeekPlan);

module.exports = router;
