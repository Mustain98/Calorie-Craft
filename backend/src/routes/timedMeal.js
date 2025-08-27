// backend/src/routes/timedMeal.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware.js');
const{create,remove, getAll,getById,addUserMealToChosenCombo,
replaceChosenComboByOtherCombo, removeMealFromChosenCombo,validateAddQuantity }
= require('../controllers/timedMealController');

// all endpoints require auth
router.post('/', protect, create);                             
router.get('/', protect, getAll);                               
router.get('/:id', protect, getById);                           
router.delete('/:id', protect, remove);                         
router.patch('/:id/add-user-meal', protect, addUserMealToChosenCombo);
router.patch('/:id/remove-chosen-meal', protect, removeMealFromChosenCombo);
router.put('/:id/replace-chosen', protect, replaceChosenComboByOtherCombo);
router.post('/:id/validate-quantity', protect, validateAddQuantity);
module.exports = router;
