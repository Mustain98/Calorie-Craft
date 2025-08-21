const { json } = require('express');
const Meal = require('../models/meal');
const {prepareMealData}=require('../service/mealService');
const foodItem=require('../models/foodItem')
const {cloudinary}=require('../utils/cloudinary');

// @desc    Create a new meal
const createMeal = async (req, res) => {
  try {
    const mealData = await prepareMealData({ ...req.body, file: req.file });
    console.log(mealData);
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

module.exports = {
  createMeal,
  updateMeal,
  deleteMeal,
  getAllMeals,
  getMealById
};