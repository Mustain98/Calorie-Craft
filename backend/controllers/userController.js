const User = require('../models/user');
const jwt = require('jsonwebtoken');
const calculateMealMacros=require('../utils/calculateMealMacros');
const Meal = require('../models/meal');         
const FoodItem = require('../models/foodItem'); 
// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, gender, weight, height, activityLevel, nutritionalRequirement } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'User already exists' });

    const user = await User.create({
      name, email, password, age, gender, weight, height, activityLevel,
      manualNutrition: !!nutritionalRequirement,
      nutritionalRequirement
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id)
  });
};

// Get current user (me)
const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.id).populate('weekPlan').select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};

// Update user
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updates = req.body;
    const merged = { ...user.toObject(), ...updates };

    // Only auto-update nutrition if manual mode is OFF and no custom data given
    if (user.manualNutrition) {
      if (updates.nutritionalRequirement) {
        user.nutritionalRequirement = updates.nutritionalRequirement;
      } // else do nothing
    } else {
      user.nutritionalRequirement = User.calculateNutrition(merged);
    }

    Object.assign(user, updates);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add meal to user's meals
const addMealToMyMeals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, foodItems, share = false } = req.body;

    let parsedItems = typeof foodItems === 'string' ? JSON.parse(foodItems) : foodItems;

    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      return res.status(400).json({ error: 'Invalid or missing food items' });
    }

    for (const item of parsedItems) {
      if (!item.food || !item.quantity) {
        return res.status(400).json({ error: 'Each food item must have a food ID and quantity' });
      }
    }

    // Accept imageUrl from req.body (not just req.file)
    const imageUrl = req.body.imageUrl || req.file?.path || '';

    // Embed food names inside items (you can skip if you just store IDs)
    const populatedItems = parsedItems.map(item => ({
      food: item.food,
      quantity: item.quantity
    }));

    // Calculate nutrition
    const totals = await calculateMealMacros(parsedItems);

    const newEmbeddedMeal = {
      name,
      imageUrl,
      foodItems: populatedItems,
      ...totals
    };

    // Save to user
    const user = await User.findById(userId);
    user.myMeals.push(newEmbeddedMeal);
    await user.save();

    // Populate food names in embedded meal before returning
    await user.populate('myMeals.foodItems.food', 'name');
    const savedMeal = user.myMeals[user.myMeals.length - 1];

    // Optional: Also save to global collection if shared
    if (share === true || share === 'true') {
      const sharedMeal = new Meal({
        name,
        imageUrl,
        foodItems: parsedItems
      });
      await sharedMeal.save();
    }

    res.status(201).json({ message: 'Meal saved to your profile', meal: savedMeal });

  } catch (err) {
    console.error('Error adding meal:', err);
    res.status(500).json({ error: 'Server error: failed to save meal' });
  }
};


// Delete meal from user's meals
const deleteMealFromMyMeals = async (req, res) => {
  try {
    const userId = req.user.id;
    const mealId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const beforeCount = user.myMeals.length;
    user.myMeals = user.myMeals.filter(meal => meal._id.toString() !== mealId);

    if (user.myMeals.length === beforeCount) {
      return res.status(404).json({ error: 'Meal not found in your meals' });
    }

    await user.save();
    res.json({ message: 'Meal deleted from your meals' });
  } catch (err) {
    console.error('Failed to delete meal:', err);
    res.status(500).json({ error: 'Server error: failed to delete meal' });
  }
};

// Show user's meals
const showMeals = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('myMeals')
      .populate('myMeals.foodItems.food', 'name'); // populate only name field

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user.myMeals);
  } catch (err) {
    console.error('Error fetching user meals:', err);
    res.status(500).json({ error: 'Failed to fetch user meals' });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUser,
  addMealToMyMeals,
  deleteMealFromMyMeals,
  showMeals
};
