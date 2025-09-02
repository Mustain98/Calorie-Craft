// src/services/foodItem.service.js
const FoodItem = require('../models/foodItem');

// helpers kept private to the service
const escapeRegex = (s = '') => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeCategories = (raw) => {
  if (!raw) return [];
  const allowed = FoodItem.schema.path('category').enumValues; // from schema enum
  const reqCats = raw
    .split(',')
    .map(c => c.trim().toLowerCase())
    .filter(Boolean);

  // map input to the canonical enum values (case-insensitive)
  const valid = reqCats
    .map(c => allowed.find(x => x.toLowerCase() === c))
    .filter(Boolean);

  return [...new Set(valid)];
};

async function listFoodItems({ category, page = 1, limit = 20, sort = 'name' }) {
  const cats = normalizeCategories(category);
  const filter = {};
  if (cats.length) filter.category = { $in: cats };

  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    FoodItem.find(filter).sort(sort).skip(skip).limit(safeLimit).lean(),
    FoodItem.countDocuments(filter),
  ]);

  return { items, total, page: safePage, limit: safeLimit };
}

async function searchFoodItems({ q, category, limit = 10 }) {
  const regex = new RegExp(escapeRegex(q), 'i');
  const cats = normalizeCategories(category);

  const filter = { name: regex };
  if (cats.length) filter.category = { $in: cats };

  const items = await FoodItem.find(filter)
    .sort({ name: 1 })
    .limit(Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50))
    .lean();

  return items;
}

async function getFoodItemByName(name) {
  const regex = new RegExp(`^${escapeRegex(name.trim())}$`, 'i');
  return FoodItem.findOne({ name: regex }).lean(); // returns null if not found
}

async function createFoodItem(data) {
  // enforce unique friendly error before unique index kicks in
  const exists = await FoodItem.findOne({ name: data.name }).lean();
  if (exists) {
    const err = new Error('Food item already exists');
    err.code = 'DUPLICATE_NAME';
    throw err;
  }
  const created = await FoodItem.create(data);
  return created.toObject();
}

async function deleteFoodItemById(id) {
  // returns the deleted doc or null
  return FoodItem.findByIdAndDelete(id);
}

module.exports = {
  listFoodItems,
  searchFoodItems,
  getFoodItemByName,
  createFoodItem,
  deleteFoodItemById,
};
