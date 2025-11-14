// src/utils/calorieCalculations.js
// Calorie and macronutrient calculation utilities

/**
 * Calculate total calories from macros
 * @param {number} protein - Protein in grams
 * @param {number} carbs - Carbs in grams
 * @param {number} fat - Fat in grams
 * @returns {number} - Total calories
 */
export const calculateCaloriesFromMacros = (protein, carbs, fat) => {
  // Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
  return (protein * 4) + (carbs * 4) + (fat * 9);
};

/**
 * Calculate macros from meals array
 * @param {Array} meals - Array of meal objects
 * @returns {Object} - Total macros {protein, carbs, fat}
 */
export const calculateTotalMacros = (meals) => {
  if (!Array.isArray(meals) || meals.length === 0) {
    return { protein: 0, carbs: 0, fat: 0 };
  }

  return meals.reduce(
    (totals, meal) => ({
      protein: totals.protein + (meal.protein || 0),
      carbs: totals.carbs + (meal.carbs || 0),
      fat: totals.fat + (meal.fat || 0),
    }),
    { protein: 0, carbs: 0, fat: 0 }
  );
};

/**
 * Calculate total calories from meals array
 * @param {Array} meals - Array of meal objects
 * @returns {number} - Total calories
 */
export const calculateTotalCalories = (meals) => {
  if (!Array.isArray(meals) || meals.length === 0) {
    return 0;
  }

  return meals.reduce((total, meal) => total + (meal.calories || 0), 0);
};

/**
 * Calculate remaining calories
 * @param {number} dailyGoal - Daily calorie goal
 * @param {number} consumed - Calories consumed
 * @returns {number} - Remaining calories
 */
export const calculateRemainingCalories = (dailyGoal, consumed) => {
  return Math.max(0, dailyGoal - consumed);
};

/**
 * Calculate percentage of goal achieved
 * @param {number} current - Current value
 * @param {number} goal - Goal value
 * @returns {number} - Percentage (0-100)
 */
export const calculatePercentage = (current, goal) => {
  if (goal === 0) return 0;
  return Math.min(100, Math.round((current / goal) * 100));
};

/**
 * Calculate macro percentages from totals
 * @param {number} protein - Protein in grams
 * @param {number} carbs - Carbs in grams
 * @param {number} fat - Fat in grams
 * @returns {Object} - Macro percentages {protein, carbs, fat}
 */
export const calculateMacroPercentages = (protein, carbs, fat) => {
  const totalCalories = calculateCaloriesFromMacros(protein, carbs, fat);
  
  if (totalCalories === 0) {
    return { protein: 0, carbs: 0, fat: 0 };
  }

  return {
    protein: Math.round(((protein * 4) / totalCalories) * 100),
    carbs: Math.round(((carbs * 4) / totalCalories) * 100),
    fat: Math.round(((fat * 9) / totalCalories) * 100),
  };
};

/**
 * Estimate daily calorie needs (BMR calculation)
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @param {string} activityLevel - Activity level ('sedentary', 'light', 'moderate', 'active', 'very_active')
 * @returns {number} - Estimated daily calories
 */
export const estimateDailyCalories = (weight, height, age, gender, activityLevel = 'moderate') => {
  // Mifflin-St Jeor Equation
  let bmr;
  if (gender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,        // Light exercise 1-3 days/week
    moderate: 1.55,      // Moderate exercise 3-5 days/week
    active: 1.725,       // Hard exercise 6-7 days/week
    very_active: 1.9,    // Very hard exercise, physical job
  };

  const multiplier = activityMultipliers[activityLevel] || 1.55;
  return Math.round(bmr * multiplier);
};

/**
 * Format calories for display
 * @param {number} calories - Calories value
 * @returns {string} - Formatted string with commas
 */
export const formatCalories = (calories) => {
  return calories.toLocaleString('en-US');
};

/**
 * Format macros for display
 * @param {number} value - Macro value in grams
 * @returns {string} - Formatted string with 'g' suffix
 */
export const formatMacros = (value) => {
  return `${Math.round(value)}g`;
};

export default {
  calculateCaloriesFromMacros,
  calculateTotalMacros,
  calculateTotalCalories,
  calculateRemainingCalories,
  calculatePercentage,
  calculateMacroPercentages,
  estimateDailyCalories,
  formatCalories,
  formatMacros,
};