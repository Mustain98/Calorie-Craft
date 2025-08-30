const foodItem = require('../models/foodItem');

// Get all food items
const getAllFoodItems = async (req, res) => {
  try {
    const items = await foodItem.find().sort({ name: 1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch food items' });
  }
};

// Get a food item by its name (case-insensitive exact match)
const getFoodItemByName = async (req, res) => {
  try {
    const nameParam = req.params.name.trim();
    const regex = new RegExp(`^${nameParam}$`, 'i'); // exact case-insensitive

    const item = await foodItem.findOne({ name: regex });

    if (!item) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get food items by category
const getFoodItemByCategory = async (req, res) => {
  try {
    const categoryParam = req.params.category.trim();
    const regex = new RegExp(`^${categoryParam}$`, "i");

    const items = await foodItem.find({ category: regex });

    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a food item by ID
const deleteFoodItem = async (req, res) => {
  try {
    const item = await foodItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    res.status(200).json({ message: 'Deleted successfully', item });
  } catch (err) {
    res.status(400).json({ error: 'Invalid food item ID' });
  }
};

// Create a new food item
const createFoodItem = async (req, res) => {
  const { name, calories, protein, carbs, fat, category, measuringUnit, totalunitweight } = req.body;

  try {
    const existing = await foodItem.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: 'Food item already exists' });
    }

    const newItem = await foodItem.create({
      name, calories, protein, carbs, fat, category, measuringUnit, totalunitweight
    });

    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: 'Invalid input or missing field' });
  }
};

// Fuzzy search for food items by partial name (case-insensitive)
const searchFoodItems = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Missing search query' });
    }

    const regex = new RegExp(query.trim(), 'i'); 
    const items = await foodItem.find({ name: regex }).limit(10).sort({ name: 1 });

    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
};

module.exports = {
  getAllFoodItems,
  getFoodItemByName,
  getFoodItemByCategory,
  deleteFoodItem,
  createFoodItem,
  searchFoodItems,
};
