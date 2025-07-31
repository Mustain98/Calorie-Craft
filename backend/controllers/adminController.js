const Admin = require('../models/admin');
const Meal = require('../models/meal');
const FoodItem = require('../models/foodItem');
const PendingMeals = require('../models/pendingMeal'); 
const { cloudinary } = require('../utils/cloudinary');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

//create admin
const createAdmin = async (req, res) => {
  try {
    // req.admin is populated by your protectAdmin middleware
    if (!req.admin || req.admin.accessLevel !== 2) {
      return res.status(403).json({ message: 'Forbidden: Insufficient access level' });
    }

    const { name, email, password, accessLevel } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) return res.status(400).json({ message: 'Admin already exists' });

    const newAdmin = await Admin.create({ name, email, password, accessLevel });

    res.status(201).json({
      _id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      accessLevel: newAdmin.accessLevel,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Login admin
const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'wrong password' });

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get current admin
const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      accessLevel: admin.accessLevel,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve admin', error: err.message });
  }
};

// Get all pending meals
const showAllPendingMeals = async (req, res) => {
  try {
    const pendingMeals = await PendingMeals.find().populate('foodItems.food');
    res.status(200).json(pendingMeals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
};

// Add a pending meal to system meals
const addToSystemMeals = async (req, res) => {
  try {
    const { pendingMealId } = req.params;

    const pendingMeal = await PendingMeals.findById(pendingMealId);
    if (!pendingMeal) {
      return res.status(404).json({ error: 'Pending meal not found' });
    }

    const newFoodItems = await Promise.all(
      pendingMeal.foodItems.map(async (item) => {
        let food = item.food;

        if (typeof food === 'object' && food.name) {
          let existing = await FoodItem.findOne({ name: food.name });
          if (!existing) {
            existing = await FoodItem.create(food);
          }
          return { food: existing._id, quantity: item.quantity };
        } else {
          return item;
        }
      })
    );

    const newMeal = new Meal({
      name: pendingMeal.name,
      description: pendingMeal.description,
      imageUrl: pendingMeal.imageUrl,
      imageId: pendingMeal.imageId,
      foodItems: newFoodItems,
    });

    await newMeal.save();
    await PendingMeals.findByIdAndDelete(pendingMealId);

    res.status(201).json({ message: 'Meal added to system successfully', meal: newMeal });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add meal to system', details: err.message });
  }
};

// Delete a pending meal (admin rejection)
const deletePendingMeal = async (req, res) => {
  try {
    const { pendingMealId } = req.params;

    const meal = await PendingMeals.findById(pendingMealId);
    if (!meal) {
      return res.status(404).json({ error: 'Pending meal not found' });
    }

    if (meal.imageId) {
      await cloudinary.uploader.destroy(meal.imageId);
    }

    await PendingMeals.findByIdAndDelete(pendingMealId);

    res.status(200).json({ message: 'Pending meal deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete pending meal', details: err.message });
  }
};

const {createMeal,updateMeal,deleteMeal}=require('./mealController');
const {createFoodItem,deleteFoodItem}=require('./foodItemController');
module.exports = {
  createAdmin,
  adminLogin,
  showAllPendingMeals,
  addToSystemMeals,
  deletePendingMeal,
  createMeal,
  createFoodItem,
  updateMeal,
  deleteFoodItem,
  deleteMeal,
  getCurrentAdmin
};
