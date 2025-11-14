// src/components/modals/MealModal.js
// Modal for adding/editing meals with food search

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';
import { MEAL_TYPE_OPTIONS } from '../../constants';

const MealModal = ({ visible, onClose, onSave, editingMeal = null }) => {
  const [mealType, setMealType] = useState(editingMeal?.mealType || 'Breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState(editingMeal?.selectedFoods || []);
  const [isSearching, setIsSearching] = useState(false);
  const [servingSizes, setServingSizes] = useState({});

  // Search for foods using OpenFoodFacts API (free, with images)
  // Search for foods using Spoonacular API (best quality)
  const searchFoods = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }
  
    setIsSearching(true);
    try {
      // Try Spoonacular first (best quality with real images). Replace the placeholder with your key.
      const SPOONACULAR_KEY = '77632797ef4f47298cd76836fafad903';
      if (SPOONACULAR_KEY) {
        try {
          const resp = await axios.get(`https://api.spoonacular.com/food/ingredients/search`, {
            params: {
              query: searchQuery,
              number: 20,
              metaInformation: true,
              apiKey: SPOONACULAR_KEY,
            },
          });
  
          const ingredients = resp.data.results || [];
  
          const formattedResults = await Promise.all(
            ingredients.slice(0, 10).map(async (ingredient) => {
              try {
                const nutritionResponse = await axios.get(
                  `https://api.spoonacular.com/food/ingredients/${ingredient.id}/information`,
                  {
                    params: {
                      amount: 100,
                      unit: 'grams',
                      apiKey: SPOONACULAR_KEY,
                    },
                  }
                );
  
                const nutrition = nutritionResponse.data.nutrition?.nutrients || [];
                const getN = (name) => nutrition.find(n => n.name === name)?.amount || 0;
  
                return {
                  id: ingredient.id.toString(),
                  name: ingredient.name,
                  brand: 'Generic',
                  image: ingredient.image
                    ? `https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`
                    : 'https://via.placeholder.com/100x100?text=No+Image',
                  servingSize: '100g',
                  calories: Math.round(getN('Calories')),
                  protein: Math.round(getN('Protein')),
                  carbs: Math.round(getN('Carbohydrates')),
                  fat: Math.round(getN('Fat')),
                };
              } catch (err) {
                console.error('Error fetching nutrition for ingredient:', err);
                return null;
              }
            })
          );
  
          const validResults = formattedResults.filter(r => r && r.calories > 0);
          if (validResults.length > 0) {
            setSearchResults(validResults);
            return; // found results via Spoonacular, no need to fallback
          }
        } catch (err) {
          console.warn('Spoonacular search failed, falling back to OpenFoodFacts', err);
        }
      }
  
      // Fallback to OpenFoodFacts API (free, no API key)
      const response = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl`, {
        params: {
          search_terms: searchQuery,
          search_simple: 1,
          action: 'process',
          json: 1,
          page_size: 20,
          fields: 'product_name,brands,image_url,nutriments,serving_size,quantity',
        },
      });
  
      const products = response.data.products || [];
  
      // Filter and format results
      const formattedResults = products
        .filter(product => product.product_name && product.nutriments)
        .map(product => ({
          id: product._id || Math.random().toString(),
          name: product.product_name,
          brand: product.brands || 'Generic',
          image: product.image_url || 'https://via.placeholder.com/100x100?text=No+Image',
          servingSize: product.serving_size || '100g',
          quantity: product.quantity || '',
          // Nutritional info per 100g
          calories: Math.round(
            product.nutriments['energy-kcal_100g'] ||
              (product.nutriments.energy_100g ? product.nutriments.energy_100g / 4.184 : 0) ||
              0
          ),
          protein: Math.round(product.nutriments.proteins_100g || 0),
          carbs: Math.round(product.nutriments.carbohydrates_100g || 0),
          fat: Math.round(product.nutriments.fat_100g || 0),
        }));
  
      if (formattedResults.length === 0) {
        Alert.alert('No Results', 'No foods found. Try a different search term.');
      }
      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Error searching foods:', error);
      Alert.alert('Error', 'Failed to search foods. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Add food to selected foods
  const addFood = (food) => {
    const servingMultiplier = servingSizes[food.id] || 1;
    
    const foodToAdd = {
      ...food,
      servingMultiplier,
      serving: `${servingMultiplier * 100}g`,
      totalCalories: Math.round(food.calories * servingMultiplier),
      totalProtein: Math.round(food.protein * servingMultiplier),
      totalCarbs: Math.round(food.carbs * servingMultiplier),
      totalFat: Math.round(food.fat * servingMultiplier),
    };

    setSelectedFoods([...selectedFoods, foodToAdd]);
    setSearchQuery('');
    setSearchResults([]);
    setServingSizes({});
  };

  // Remove food from selected foods
  const removeFood = (index) => {
    const updated = selectedFoods.filter((_, i) => i !== index);
    setSelectedFoods(updated);
  };

  // Calculate total nutrition
  const calculateTotals = () => {
    return selectedFoods.reduce(
      (totals, food) => ({
        calories: totals.calories + (food.totalCalories || 0),
        protein: totals.protein + (food.totalProtein || 0),
        carbs: totals.carbs + (food.totalCarbs || 0),
        fat: totals.fat + (food.totalFat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  // Save meal
  const handleSave = () => {
    if (selectedFoods.length === 0) {
      Alert.alert('Error', 'Please add at least one food item');
      return;
    }

    const totals = calculateTotals();
    const meal = {
      id: editingMeal?.id || Date.now(),
      mealType,
      selectedFoods,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
      timestamp: editingMeal?.timestamp || new Date().toISOString(),
    };

    onSave(meal);
    handleClose();
  };

  // Close modal and reset
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFoods([]);
    setServingSizes({});
    setMealType('Breakfast');
    onClose();
  };

  const totals = calculateTotals();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {editingMeal ? 'Edit Meal' : 'Add Meal'}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Meal Type Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meal Type</Text>
            <View style={styles.mealTypeContainer}>
              {MEAL_TYPE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.mealTypeButton,
                    mealType === option.value && styles.mealTypeButtonActive,
                  ]}
                  onPress={() => setMealType(option.value)}
                >
                  <Text
                    style={[
                      styles.mealTypeText,
                      mealType === option.value && styles.mealTypeTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Food Search */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Food</Text>
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color={colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for food (e.g., chicken breast)"
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={searchFoods}
                returnKeyType="search"
              />
              <TouchableOpacity onPress={searchFoods} style={styles.searchButton}>
                {isSearching ? (
                  <ActivityIndicator size="small" color={colors.textWhite} />
                ) : (
                  <Ionicons name="arrow-forward" size={20} color={colors.textWhite} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              {searchResults.map((food) => (
                <View key={food.id} style={styles.foodResultCard}>
                  <Image
                    source={{ uri: food.image }}
                    style={styles.foodImage}
                    resizeMode="cover"
                  />
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName} numberOfLines={2}>
                      {food.name}
                    </Text>
                    <Text style={styles.foodBrand} numberOfLines={1}>
                      {food.brand}
                    </Text>
                    <View style={styles.foodNutrition}>
                      <Text style={styles.foodNutritionText}>
                        {food.calories} cal
                      </Text>
                      <Text style={styles.foodNutritionDivider}>•</Text>
                      <Text style={styles.foodNutritionText}>
                        P: {food.protein}g
                      </Text>
                      <Text style={styles.foodNutritionDivider}>•</Text>
                      <Text style={styles.foodNutritionText}>
                        C: {food.carbs}g
                      </Text>
                      <Text style={styles.foodNutritionDivider}>•</Text>
                      <Text style={styles.foodNutritionText}>
                        F: {food.fat}g
                      </Text>
                    </View>
                    <View style={styles.servingSizeContainer}>
                      <Text style={styles.servingSizeLabel}>Serving:</Text>
                      <View style={styles.servingSizeButtons}>
                        <TouchableOpacity
                          style={styles.servingSizeButton}
                          onPress={() =>
                            setServingSizes({
                              ...servingSizes,
                              [food.id]: Math.max(0.5, (servingSizes[food.id] || 1) - 0.5),
                            })
                          }
                        >
                          <Ionicons name="remove" size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.servingSizeValue}>
                          {((servingSizes[food.id] || 1) * 100).toFixed(0)}g
                        </Text>
                        <TouchableOpacity
                          style={styles.servingSizeButton}
                          onPress={() =>
                            setServingSizes({
                              ...servingSizes,
                              [food.id]: (servingSizes[food.id] || 1) + 0.5,
                            })
                          }
                        >
                          <Ionicons name="add" size={16} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.addFoodButton}
                    onPress={() => addFood(food)}
                  >
                    <Ionicons name="add-circle" size={32} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Selected Foods */}
          {selectedFoods.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Selected Foods ({selectedFoods.length})
              </Text>
              {selectedFoods.map((food, index) => (
                <View key={index} style={styles.selectedFoodCard}>
                  <Image
                    source={{ uri: food.image }}
                    style={styles.selectedFoodImage}
                    resizeMode="cover"
                  />
                  <View style={styles.selectedFoodInfo}>
                    <Text style={styles.selectedFoodName} numberOfLines={1}>
                      {food.name}
                    </Text>
                    <Text style={styles.selectedFoodServing}>{food.serving}</Text>
                    <Text style={styles.selectedFoodCalories}>
                      {food.totalCalories} cal
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeFoodButton}
                    onPress={() => removeFood(index)}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Total Nutrition Summary */}
          {selectedFoods.length > 0 && (
            <View style={styles.totalsCard}>
              <Text style={styles.totalsTitle}>Total Nutrition</Text>
              <View style={styles.totalsGrid}>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Calories</Text>
                  <Text style={styles.totalValue}>{totals.calories}</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Protein</Text>
                  <Text style={styles.totalValue}>{totals.protein}g</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Carbs</Text>
                  <Text style={styles.totalValue}>{totals.carbs}g</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Fat</Text>
                  <Text style={styles.totalValue}>{totals.fat}g</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: spacing.xxxl,
  },
  closeButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  saveButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
  },
  saveButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  content: {
    flex: 1,
    padding: spacing.base,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mealTypeButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  mealTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mealTypeText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  mealTypeTextActive: {
    color: colors.textWhite,
    fontWeight: typography.fontWeight.semiBold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.base,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: spacing.borderRadius.md,
    borderBottomRightRadius: spacing.borderRadius.md,
    minWidth: 60,
  },
  foodResultCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: spacing.borderRadius.sm,
    backgroundColor: colors.borderLight,
  },
  foodInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  foodName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  foodBrand: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  foodNutrition: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  foodNutritionText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  foodNutritionDivider: {
    marginHorizontal: spacing.xs,
    color: colors.textTertiary,
  },
  servingSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  servingSizeLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  servingSizeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.xs,
  },
  servingSizeButton: {
    padding: spacing.xs,
  },
  servingSizeValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    minWidth: 50,
    textAlign: 'center',
  },
  addFoodButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  selectedFoodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    borderRadius: spacing.borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  selectedFoodImage: {
    width: 50,
    height: 50,
    borderRadius: spacing.borderRadius.sm,
    backgroundColor: colors.borderLight,
  },
  selectedFoodInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  selectedFoodName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  selectedFoodServing: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  selectedFoodCalories: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  removeFoodButton: {
    padding: spacing.xs,
  },
  totalsCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: spacing.borderRadius.md,
    padding: spacing.base,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.xl,
  },
  totalsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  totalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  totalItem: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  totalValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
});

export default MealModal;