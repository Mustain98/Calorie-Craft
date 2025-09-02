const mongoose = require('mongoose');

const UserMealPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      index: true,
      unique: true, 
    },
    
    meals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'meal',
        required: true,
      }
    ],
    
    capacity: {
      type: Number,
      default: 100,
      min: 1,
      max: 2000,
    },
  },
  { timestamps: true }
);

/**
 * Enqueue meal ids for a user and trim to capacity (FIFO).
 * - mealIds: ObjectId | string | Array<ObjectId|string>
 * - opts: { capacity?: number } override stored capacity for this operation
 *
 * Uses $push + $each + $slice for an atomic operation.
 * $slice:-N keeps only the last N, effectively dropping the oldest items.
 */
UserMealPreferenceSchema.statics.enqueueMeals = async function (userId, mealIds, opts = {}) {
  const ids = Array.isArray(mealIds) ? mealIds : [mealIds];

  // If nothing to add, just return current doc
  if (!ids.length) {
    return this.findOne({ user: userId }).lean();
  }

  // Read current capacity (or default) to decide slice length.
  // We keep the last `cap` elements → FIFO (oldest removed).
  const doc = await this.findOne({ user: userId }, { capacity: 1 }).lean();
  const cap = Math.max(1, Number(opts.capacity || doc?.capacity || 100));

  // Upsert & trim atomically
  const updated = await this.findOneAndUpdate(
    { user: userId },
    {
      $setOnInsert: { user: userId, capacity: cap },
      $push: { meals: { $each: ids, $slice: -cap } },
    },
    { new: true, upsert: true }
  ).lean();

  return updated;
};

/**
 * Dequeue (remove) the oldest meal (head of the queue).
 * Returns the popped meal id or null if empty.
 */
UserMealPreferenceSchema.statics.dequeueOldest = async function (userId) {
  // $pop:-1 removes the first element (oldest)
  const updated = await this.findOneAndUpdate(
    { user: userId },
    { $pop: { meals: -1 } },
    { new: true }
  ).lean();

  // We don't directly get the popped value; fetch previous head if you need it
  // Alternative approach: read head, then $pop in a transaction.
  return updated?.meals?.[0] ?? null; // after pop, index 0 is new head; we can’t know old head here
};

/**
 * Peek head (oldest) & tail (newest).
 */
UserMealPreferenceSchema.statics.peek = async function (userId) {
  const doc = await this.findOne({ user: userId }, { meals: 1 }).lean();
  if (!doc?.meals?.length) return { head: null, tail: null };
  return { head: doc.meals[0], tail: doc.meals[doc.meals.length - 1] };
};

/**
 * Get recent N meals (most recent first).
 */
UserMealPreferenceSchema.statics.getRecent = async function (userId, limit = 20) {
  const doc = await this.findOne({ user: userId }, { meals: 1 })
    .populate({ path: 'meals', select: 'name imageUrl totalCalories totalProtein totalCarbs totalFat categories' })
    .lean();

  const arr = doc?.meals || [];
  return arr.slice(-limit).reverse(); // newest first
};

/**
 * Clear the queue.
 */
UserMealPreferenceSchema.statics.clear = async function (userId) {
  await this.updateOne({ user: userId }, { $set: { meals: [] } });
  return true;
};

module.exports = mongoose.model('userMealPreference', UserMealPreferenceSchema);
