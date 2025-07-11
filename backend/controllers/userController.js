const User = require('../models/user');
const jwt = require('jsonwebtoken');

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

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUser
};
