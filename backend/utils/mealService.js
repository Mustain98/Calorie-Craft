const FoodItem = require('../models/foodItem');


const prepareMealData = async ({ name, description, category, foodItems, imageUrl, file }) => {
    
  let parsedCategory = category;
  if (typeof category === 'string') {
    try { parsedCategory = JSON.parse(category); } 
    catch { parsedCategory = [category]; }
  }

  let parsedItems = typeof foodItems === 'string' ? JSON.parse(foodItems) : foodItems;
  if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
    throw new Error('Invalid or missing food items');
  }

  for (const item of parsedItems) {
    if (!item.food || !item.quantity) {
      throw new Error('Each food item must have a food ID and quantity');
    }
  }
  const populatedItems = await Promise.all(
    parsedItems.map(async (item) => {
      const foodDoc = await FoodItem.findById(item.food);
      if (!foodDoc) throw new Error(`Food item ${item.food} not found`);
      return { ...item, food: foodDoc };
    })
  );

  let portionSize = 0;
  for (const item of populatedItems) {
    portionSize += (item.food?.totalunitweight || 0) * item.quantity;
  }

  return {
    name,
    description,
    categories: parsedCategory,
    foodItems: parsedItems,
    portionSize,
    imageUrl: imageUrl || file?.path || '',
    imageId: file?.filename || ''
  };
};

module.exports = { prepareMealData };
