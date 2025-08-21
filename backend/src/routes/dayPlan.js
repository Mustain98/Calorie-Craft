const express = require('express');
const router = express.Router();
const {
  createDayPlan,
  getAllDayPlans,
  getDayPlanById,
  deleteDayPlan
} = require('../controllers/dayPlanController');

router.post('/', createDayPlan);
router.get('/', getAllDayPlans);
router.get('/:id', getDayPlanById);
router.delete('/:id', deleteDayPlan);

module.exports = router;
