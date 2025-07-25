const Meal = require('../models/meal');
const {cloudinary}=require('../utils/cloudinary');

// @desc    Create a new meal
const createMeal = async (req, res) => {
  try {
    const { name, imageUrl, foodItems } = req.body;

    // Parse foodItems if it's a string (multipart/form-data case)
    if (typeof foodItems === 'string') {
      try {
        foodItems = JSON.parse(foodItems);
      } catch (err) {
        return res.status(400).json({ error: 'Invalid JSON format for foodItems' });
      }
    }

    const imageUrl = req.file?.path || '';

    if (!name || !foodItems || !Array.isArray(foodItems) || foodItems.length === 0) {
      return res.status(400).json({ error: 'Invalid meal data' });
    }

    const newMeal = new Meal({
      name,
      description,
      imageUrl,
      imageId,
      foodItems
    });

    await newMeal.save();
    res.status(201).json(newMeal);
  } catch (err) {
    // Handle other failures: e.g., MongoDB errors
    if (imageId) await cloudinary.uploader.destroy(imageId);
    res.status(500).json({ error: 'Failed to create meal', details: err.message });
  }
};

// @desc    Update an existing meal
const updateMeal = async (req, res) => {
  try {
    const { name, imageUrl, foodItems } = req.body;

    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    if (name) meal.name = name;
    if (imageUrl !== undefined) meal.imageUrl = imageUrl;
    if (imageId !== undefined) meal.imageId= imageId;
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

// (Optional) Get all meals
const getAllMeals = async (req, res) => {
  try {
    const meals = await Meal.find().populate('foodItems.food');
    res.status(200).json(meals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
};

// (Optional) Get single meal
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
