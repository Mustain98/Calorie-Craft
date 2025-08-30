const { json } = require('express');
const Meal = require('../models/meal');
const {prepareMealData}=require('../service/mealService');
const foodItem=require('../models/foodItem')
const {cloudinary}=require('../utils/cloudinary');

// @desc    Create a new meal
const createMeal = async (req, res) => {
  try {
    const mealData = await prepareMealData({ ...req.body, file: req.file });
    const newMeal = new Meal(mealData);
    await newMeal.save();
    res.status(201).json(newMeal);
  } catch (err) {
    if (req.file?.filename) await cloudinary.uploader.destroy(req.file.filename);
    res.status(400).json({ error: err.message });
  }
};


// @desc    Update an existing meal
const updateMeal = async (req, res) => {
  try {
    const { name, description, foodItems } = req.body;

    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    if (name) meal.name = name;
    if (req.file) {
      meal.imageUrl = req.file.path;
      meal.imageId = req.file.filename;
    }
    if(description){
      meal.description=description;
    }
    if (category) {
    let parsedCategory = category;
      if (typeof category === 'string') {
        try {
          parsedCategory = JSON.parse(category);
        } catch {
          parsedCategory = [category];
        }
      }
      meal.categories = parsedCategory;
    }
    if (Array.isArray(foodItems)) meal.foodItems = foodItems;
    await meal.save();
    res.status(200).json(meal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update meal', details: err.message });
  }
};

// @desc    Delete a meal
const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
  if (!meal) {
    return res.status(404).json({ error: 'Meal not found' });
  }

  if (meal.imageId) {
    await cloudinary.uploader.destroy(meal.imageId);
  }

    await meal.deleteOne(); 

    res.status(200).json({ message: 'Meal deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete meal', details: err.message });
  }
};

//  Get all meals
const getAllMeals = async (req, res) => {
  try {
    const meals = await Meal.find().populate('foodItems.food');
    res.status(200).json(meals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
};

//  Get single meal
const getMealById = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id).populate('foodItems.food');
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    res.status(200).json(meal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meal' });
  }
};

// search meal 
const searchMeal =async(req,res)=>{ 
    try {
      const query = req.query.q;
      if(!query || query.trim() === '')
         { return res.status(400).json({ error: 'Missing search query' });
      } 
    const regex = new RegExp(query.trim(), 'i');
    const items = await Meal.find({ name: regex }).limit(10).sort({ name: 1 });
    res.status(200).json(items);
    }
    catch (err) { res.status(500).json({ error: 'Search failed' });
   } 
  }
//get meal category wise
const allowedMealCategories =
  (Meal.schema.path('categories').caster && Meal.schema.path('categories').caster.enumValues) || [
    'breakfast', 'lunch', 'dinner', 'snack', 'main dish', 'side dish', 'dessert', 'drink'
  ];

const getMealsByCategories = async (req, res) => {
  try {
    // categories may come as ?categories=breakfast,lunch
    const raw = (req.query.categories || '').trim();
    if (!raw) {
      return res.status(400).json({ error: 'Query parameter "categories" is required.' });
    }

    const requested = raw
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    // map to canonical enum values
    const valid = requested
      .map(r => allowedMealCategories.find(c => c.toLowerCase() === r))
      .filter(Boolean);

    if (!valid.length) {
      return res.status(400).json({
        error: `No valid categories provided.`,
        allowed: allowedMealCategories
      });
    }

    // find meals that contain ANY of the categories
    const meals = await Meal.find({ categories: { $all: valid } })
      .populate('foodItems.food');

    return res.status(200).json({
      meals
    });
  } catch (err) {
    console.error('[getMealsByCategories] error:', err);
    return res.status(500).json({ error: 'Failed to fetch meals by categories' });
  }
};

module.exports = {
  createMeal,
  updateMeal,
  deleteMeal,
  getAllMeals,
  getMealById,
  searchMeal,
  getMealsByCategories
};