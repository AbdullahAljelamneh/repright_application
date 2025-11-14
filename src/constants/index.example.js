// src/constants/index.js
// App-wide constants

export const MEAL_TYPES = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
};

export const MEAL_TYPE_OPTIONS = [
  { label: '🍳 Breakfast', value: 'Breakfast' },
  { label: '🍽️ Lunch', value: 'Lunch' },
  { label: '🍕 Dinner', value: 'Dinner' },
  { label: '🍎 Snack', value: 'Snack' },
];

export const CALORIE_PRESETS = {
  LOSS: 1500,
  MAINTAIN: 2000,
  GAIN: 2500,
};

export const DEFAULT_MACRO_GOALS = {
  protein: 150,  // grams
  carbs: 200,    // grams
  fat: 65,       // grams
};

export const STORAGE_KEYS = {
  MEALS: 'repright_meals',
  CALORIES: 'repright_calories',
  DAILY_GOAL: 'repright_daily_goal',
  MACRO_GOALS: 'repright_macro_goals',
  STREAK: 'repright_streak',
  LAST_ACTIVE: 'repright_last_active',
  USER_DATA: 'repright_user_data',
};

export const WORKOUT_CATEGORIES = [
  'Strength',
  'Cardio',
  'Flexibility',
  'Sports',
  'Other',
];

export const API_ENDPOINTS = {
  SPOONACULAR_BASE: 'https://api.spoonacular.com',
};

// Add your API keys here
export const API_KEYS = {
  SPOONACULAR_API_KEY: 'YOUR_KEY_HERE'//
CLAUDE_API_KEY: 'YOUR_KEY_HERE'//'
};
export default {
  MEAL_TYPES,
  MEAL_TYPE_OPTIONS,
  CALORIE_PRESETS,
  DEFAULT_MACRO_GOALS,
  STORAGE_KEYS,
  WORKOUT_CATEGORIES,
  API_ENDPOINTS,
  API_KEYS,
};