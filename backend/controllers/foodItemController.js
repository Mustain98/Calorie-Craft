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

// Get a food item by its name
const getFoodItemByName = async (req, res) => {
  try {
    const item = await foodItem.findOne({ name: req.params.name.trim() });

    if (!item) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    res.status(200).json(item); // contains the _id, name, macros etc.
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
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
  const { name, calories, protein, carbs, fat, category, image } = req.body;

  try {
    const existing = await foodItem.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: 'Food item already exists' });
    }

    const newItem = await foodItem.create({
      name, calories, protein, carbs, fat, category, image
    });

    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: 'Invalid input or missing field' });
  }
};

module.exports = {
  getAllFoodItems,
  getFoodItemByName,
  deleteFoodItem,
  createFoodItem
};
