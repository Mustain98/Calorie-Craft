const User = require('../models/user');
const jwt = require('jsonwebtoken');
const Meal = require('../models/meal'); 
const {prepareMealData}=require('../service/mealService');    
const pendingMeal=require('../models/pendingMeal');
const UserMeal=require('../models/userMeal');
const {cloneImage,cloudinary}=require('../utils/cloudinary');
const {isDuplicateInMyMeals,isDuplicateInPendingMeals,isDuplicateForSharing} = require('../utils/isDuplicateMeal');

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

const addMealToMyMeals = async (req, res) => {
  try {
    const userId = req.user._id;
    const mealData = await prepareMealData({ ...req.body, file: req.file });

    const duplicateCheck = await isDuplicateInMyMeals(userId, mealData.name);
    if (duplicateCheck.isDuplicate) {
      return res.status(400).json({ error: "Meal already exists" });
    }

    if (mealData.imageUrl) {
      const cloned = await cloneImage(mealData.imageUrl);
      mealData.imageUrl = cloned.url;
      mealData.imageId = cloned.id;
    }

    const newUserMeal = new UserMeal({
      ...mealData,
      user: userId
    });

    const savedMeal = await newUserMeal.save();

    await User.findByIdAndUpdate(userId, {
      $push: { myMeals: savedMeal._id }
    });

    const populatedMeal = await UserMeal.findById(savedMeal._id)
      .populate('foodItems.food', 'name measuringUnit totalunitweight calories protein carbs fat');

    res.status(201).json({
      message: "Meal saved to your profile",
      meal: populatedMeal,
    });
  } catch (err) {
    if (req.file?.filename) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    res.status(400).json({ error: err.message });
  }
};

const deleteMealFromMyMeals = async (req, res) => {
  try {
    const userId = req.user.id;
    const mealId = req.params.id;

    const meal = await UserMeal.findById(mealId);
    if (!meal || meal.user.toString() !== userId) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    if (meal.imageId) {
      await cloudinary.uploader.destroy(meal.imageId);
    }

    await UserMeal.findByIdAndDelete(mealId);
    await User.findByIdAndUpdate(userId, {
      $pull: { myMeals: mealId }
    });

    res.json({ message: 'Meal deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete meal' });
  }
};

const showMeals = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: 'myMeals',
      populate: {
        path: 'foodItems.food',
        select: 'name measuringUnit totalunitweight calories protein carbs fat'
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user.myMeals || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user meals' });
  }
};

const getMyMealById = async (req, res) => {
  try {
    const userId = req.user.id;
    const mealId = req.params.id;

    const meal = await UserMeal.findOne({ _id: mealId, user: userId })
      .populate('foodItems.food', 'name measuringUnit totalunitweight calories protein carbs fat');

    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    res.status(200).json(meal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meal' });
  }
};

const shareMeal = async (req, res) => {
  try {
    const mealId = req.params.id;
    const userId = req.user._id;

    const meal = await UserMeal.findOne({ _id: mealId, user: userId });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });

    const duplicateCheck = await isDuplicateForSharing(userId, meal.name);
    if (duplicateCheck.isDuplicate) {
      return res.status(400).json({ message: 'Meal already shared' });
    }

    const newPending = new pendingMeal({
      name: meal.name,
      description: meal.description,
      imageUrl: meal.imageUrl,
      imageId: meal.imageId,
      foodItems: meal.foodItems,
      categories: meal.categories,
      submittedBy: userId
    });

    await newPending.save();
    res.status(201).json({
      message: 'Meal shared successfully',
      pendingMeal: newPending
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePassword =async (req,res) =>{
  try{
    const user = await User.findById(req.user.id).select('+password');
    const {currentPassword,newPassword}=req.body;
    const isMatch = await user.matchPassword(currentPassword);
    if(!isMatch)return res.status(401).json({error: 'Current Password is incorrect'});
    user.password=newPassword;
    await user.save();
    return res.status(200).json({message:'Password updated successfully'});

  }catch(err){
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
};

//show timed meal configuration
const showTimedMealConfiguration =async (req,res)=>{
  try{
    const user =await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const timedMealConfiguration=user.timedMealConfig;

    if(timedMealConfiguration){
      return res.json({timedMealConfiguration});
    }
      return res.json({ message: 'No meal configuration found' });
  }catch(err){
    res.status(500).json({ error: 'Failed to fetch user meal configuration' });
  }
}
// Update user timed meal configuration
const updateTimedMealConfiguration = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { timedMealConfig } = req.body;

    if (!timedMealConfig || !Array.isArray(timedMealConfig)) {
      return res.status(400).json({ error: "Invalid meal configuration data" });
    }

    user.timedMealConfig = timedMealConfig;

    // Save user
    await user.save();

    res.json({
      message: "Meal configuration updated successfully",
    });
  } catch (err) {
    console.error("Error updating meal config:", err);
    res.status(500).json({ error: "Failed to update meal configuration" });
  }
};

module.exports = {
  registerUser,
  getMyMealById,
  loginUser,
  getCurrentUser,
  updateUser,
  addMealToMyMeals,
  deleteMealFromMyMeals,
  showMeals,
  updatePassword,
  shareMeal,
  showTimedMealConfiguration,
  updateTimedMealConfiguration
};
