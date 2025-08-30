// service/mealService.js
const FoodItem = require('../models/foodItem');

const prepareMealData = async ({
  name,
  description,
  categories,
  foodItems,
  imageUrl,
  imageId,
  file
}) => {
  if (!name) throw new Error('Meal must have a name');

  // categories can be string / array
  let parsedCategory = categories;
  if (typeof parsedCategory === 'string') {
    try { parsedCategory = JSON.parse(parsedCategory); }
    catch { parsedCategory = [parsedCategory]; }
  }
  if (!Array.isArray(parsedCategory)) parsedCategory = [];

  // foodItems can be stringified
  let parsedItems = typeof foodItems === 'string' ? JSON.parse(foodItems) : foodItems;
  if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
    throw new Error('Invalid or missing food items');
  }

  for (const item of parsedItems) {
    if (!item.food || item.quantity == null) {
      throw new Error('Each food item must have a food ID and quantity');
    }
  }

  // fetch food docs to compute totals/portion
  const populated = await Promise.all(
    parsedItems.map(async (it) => {
      const doc = await FoodItem.findById(it.food);
      if (!doc) throw new Error(`Food item ${it.food} not found`);
      return { doc, quantity: Number(it.quantity || 1) };
    })
  );

  // compute totals & portion
  const totals = populated.reduce((a, { doc, quantity }) => ({
    calories: a.calories + Number(doc.calories || 0) * quantity,
    protein:  a.protein  + Number(doc.protein  || 0) * quantity,
    carbs:    a.carbs    + Number(doc.carbs    || 0) * quantity,
    fat:      a.fat      + Number(doc.fat      || 0) * quantity,
    portion:  a.portion  + Number(doc.totalunitweight || 0) * quantity,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, portion: 0 });

  return {
    name,
    description: description || '',
    categories: parsedCategory,
    foodItems: parsedItems.map(it => ({
      food: it.food,                          // store ObjectId
      quantity: Number(it.quantity || 1),
    })),
    portionSize: Number(totals.portion.toFixed(2)),
    totalCalories: Number(totals.calories.toFixed(2)),
    totalProtein:  Number(totals.protein.toFixed(2)),
    totalCarbs:    Number(totals.carbs.toFixed(2)),
    totalFat:      Number(totals.fat.toFixed(2)),
    imageUrl: imageUrl || file?.path || '',
    imageId:  imageId  || file?.filename || '',
  };
};

module.exports = { prepareMealData };
