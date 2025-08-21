const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  protein: {
    type: Number,
    required: true,
  },
  carbs: {
    type: Number,
    required: true,
  },
  fat: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['protein', 'carb', 'fat', 'vegetable', 'fruit', 'nut', 'dairy', 'other'],
    default: 'other',
  },
  measuringUnit:{
    type: String,
    enum: ['ml','gm','pcs','tbsp'],
    default: 'gm',
  },
  totalunitweight:{
    type:Number,
    required:true,
    default:100,
  },
}, { timestamps: true });

module.exports = mongoose.model('fooditem', FoodItemSchema);
