// createFirstAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/admin'); 
require('dotenv').config();

async function createFirstAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await Admin.findOne({ email: 'admin@example.com' });
    if (existing) {
      console.log('Admin already exists');
      process.exit();
    }

    const password = 'MusTaj261';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new Admin({
      name: 'Super Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      accessLevel: 2, 
    });

    await admin.save();
    console.log('First admin created');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

createFirstAdmin();
