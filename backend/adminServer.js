require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.ADMIN_PORT;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`[ADMIN SERVER] ${req.method} ${req.originalUrl}`);
  next();
});
app.use('/api/admin', adminRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB (admin)');
    app.listen(PORT, () => console.log(`🚀 Admin server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error (admin):', err.message);
  });
