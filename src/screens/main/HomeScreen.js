// src/screens/main/HomeScreen.js
// Complete Home Dashboard with calorie and meal tracking

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../auth/AuthContext';
import { getData, saveData } from '../../utils/storage';
import MealModal from '../../components/modals/MealModal';
import GoalModal from '../../components/modals/GoalModal';
import MacroGoalsModal from '../../components/modals/MacroGoalsModal';
import { STORAGE_KEYS, CALORIE_PRESETS, DEFAULT_MACRO_GOALS } from '../../constants';
import {
  calculateTotalCalories,
  calculateTotalMacros,
  calculateRemainingCalories,
  calculatePercentage,
  formatCalories,
  formatMacros,
} from '../../utils/calorieCalculations';
import { shouldResetDaily, formatTime, isToday } from '../../utils/dateHelpers';
import colors from '../../styles/colors';
import typography from '../../styles/typography';
import spacing from '../../styles/spacing';

const HomeScreen = () => {
  const { logout, user } = useAuth();
  
  // State
  const [meals, setMeals] = useState([]);
  const [dailyGoal, setDailyGoal] = useState(CALORIE_PRESETS.MAINTAIN);
  const [macroGoals, setMacroGoals] = useState(DEFAULT_MACRO_GOALS);
  const [streak, setStreak] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedMealId, setExpandedMealId] = useState(null);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
const [showMacroModal, setShowMacroModal] = useState(false);
const [editingMeal, setEditingMeal] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Load all data from storage
  const loadData = async () => {
    try {
      // Check if we need to reset daily data
      const lastActive = await getData(STORAGE_KEYS.LAST_ACTIVE);
      if (lastActive && shouldResetDaily(lastActive)) {
        await resetDailyData();
        return;
      }

      // Load existing data
      const savedMeals = await getData(STORAGE_KEYS.MEALS, []);
      const savedGoal = await getData(STORAGE_KEYS.DAILY_GOAL, CALORIE_PRESETS.MAINTAIN);
      const savedMacroGoals = await getData(STORAGE_KEYS.MACRO_GOALS, DEFAULT_MACRO_GOALS);
      const savedStreak = await getData(STORAGE_KEYS.STREAK, 0);

      setMeals(savedMeals);
      setDailyGoal(savedGoal);
      setMacroGoals(savedMacroGoals);
      setStreak(savedStreak);

      // Update last active date
      await saveData(STORAGE_KEYS.LAST_ACTIVE, new Date().toISOString());
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Reset daily data (called at midnight)
  const resetDailyData = async () => {
    try {
      // Increment streak if there were meals yesterday
      const savedMeals = await getData(STORAGE_KEYS.MEALS, []);
      const savedStreak = await getData(STORAGE_KEYS.STREAK, 0);
      
      if (savedMeals.length > 0) {
        await saveData(STORAGE_KEYS.STREAK, savedStreak + 1);
        setStreak(savedStreak + 1);
      } else {
        await saveData(STORAGE_KEYS.STREAK, 0);
        setStreak(0);
      }


      // Clear meals
      await saveData(STORAGE_KEYS.MEALS, []);
      setMeals([]);

      // Update last active
      await saveData(STORAGE_KEYS.LAST_ACTIVE, new Date().toISOString());
    } catch (error) {
      console.error('Error resetting daily data:', error);
    }
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (!result.success) {
              Alert.alert('Error', result.error);
            }
          },
        },
      ]
    );
  };

  // Delete meal
  const handleDeleteMeal = (mealId) => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedMeals = meals.filter(meal => meal.id !== mealId);
            setMeals(updatedMeals);
            await saveData(STORAGE_KEYS.MEALS, updatedMeals);
          },
        },
      ]
    );
  };
        // Handle saving meal
  const handleSaveMeal = async (meal) => {
    const updatedMeals = [...meals, meal];
    setMeals(updatedMeals);
    await saveData(STORAGE_KEYS.MEALS, updatedMeals);
  };
  // Handle updating calorie goal
  const handleUpdateGoal = async (newGoal) => {
    setDailyGoal(newGoal);
    await saveData(STORAGE_KEYS.DAILY_GOAL, newGoal);
  };

  // Handle updating macro goals
  const handleUpdateMacros = async (newMacros) => {
    setMacroGoals(newMacros);
    await saveData(STORAGE_KEYS.MACRO_GOALS, newMacros);
  };

  // Handle editing meal
  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setShowMealModal(true);
  };

  // Handle saving edited meal
  const handleSaveEditedMeal = async (updatedMeal) => {
    const updatedMeals = meals.map(m => 
      m.id === updatedMeal.id ? updatedMeal : m
    );
    setMeals(updatedMeals);
    await saveData(STORAGE_KEYS.MEALS, updatedMeals);
    setEditingMeal(null);
  };
  // Toggle meal expansion
  const toggleMealExpansion = (mealId) => {
    setExpandedMealId(expandedMealId === mealId ? null : mealId);
  };

  // Calculate totals
  const totalCalories = calculateTotalCalories(meals);
  const remainingCalories = calculateRemainingCalories(dailyGoal, totalCalories);
  const caloriePercentage = calculatePercentage(totalCalories, dailyGoal);
  const totalMacros = calculateTotalMacros(meals);

  // Calculate macro percentages
  const proteinPercentage = calculatePercentage(totalMacros.protein, macroGoals.protein);
  const carbsPercentage = calculatePercentage(totalMacros.carbs, macroGoals.carbs);
  const fatPercentage = calculatePercentage(totalMacros.fat, macroGoals.fat);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back! 👋</Text>
          <Text style={styles.username}>{user?.name || user?.displayName || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Streak Card */}
        <View style={styles.streakCard}>
          <Ionicons name="flame" size={32} color={colors.primary} />
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.streakLabel}>Day Streak 🔥</Text>
          </View>
        </View>

        {/* Calorie Tracking Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Today's Calories</Text>
            <TouchableOpacity onPress={() => setShowGoalModal(true)}>
  <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
</TouchableOpacity>
          </View>

          <View style={styles.calorieStats}>
            <View style={styles.calorieStat}>
              <Text style={styles.calorieNumber}>{formatCalories(totalCalories)}</Text>
              <Text style={styles.calorieLabel}>Consumed</Text>
            </View>
            <View style={styles.calorieDivider} />
            <View style={styles.calorieStat}>
              <Text style={styles.calorieNumber}>{formatCalories(remainingCalories)}</Text>
              <Text style={styles.calorieLabel}>Remaining</Text>
            </View>
            <View style={styles.calorieDivider} />
            <View style={styles.calorieStat}>
              <Text style={styles.calorieNumber}>{formatCalories(dailyGoal)}</Text>
              <Text style={styles.calorieLabel}>Goal</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(caloriePercentage, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{caloriePercentage}%</Text>
          </View>
        </View>

        {/* Macronutrients Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
  <Text style={styles.cardTitle}>Macros</Text>
  <TouchableOpacity onPress={() => setShowMacroModal(true)}>
    <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
  </TouchableOpacity>
</View>

          {/* Protein */}
          <View style={styles.macroRow}>
            <View style={styles.macroInfo}>
              <View style={[styles.macroIcon, { backgroundColor: colors.protein + '20' }]}>
                <Text style={styles.macroEmoji}>💪</Text>
              </View>
              <View style={styles.macroTextContainer}>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValues}>
                  {formatMacros(totalMacros.protein)} / {formatMacros(macroGoals.protein)}
                </Text>
              </View>
            </View>
            <View style={styles.macroProgressContainer}>
              <View style={styles.macroProgressBar}>
                <View
                  style={[
                    styles.macroProgressFill,
                    {
                      width: `${Math.min(proteinPercentage, 100)}%`,
                      backgroundColor: colors.protein,
                    },
                  ]}
                />
              </View>
              <Text style={styles.macroPercentage}>{proteinPercentage}%</Text>
            </View>
          </View>

          {/* Carbs */}
          <View style={styles.macroRow}>
            <View style={styles.macroInfo}>
              <View style={[styles.macroIcon, { backgroundColor: colors.carbs + '20' }]}>
                <Text style={styles.macroEmoji}>🍞</Text>
              </View>
              <View style={styles.macroTextContainer}>
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroValues}>
                  {formatMacros(totalMacros.carbs)} / {formatMacros(macroGoals.carbs)}
                </Text>
              </View>
            </View>
            <View style={styles.macroProgressContainer}>
              <View style={styles.macroProgressBar}>
                <View
                  style={[
                    styles.macroProgressFill,
                    {
                      width: `${Math.min(carbsPercentage, 100)}%`,
                      backgroundColor: colors.carbs,
                    },
                  ]}
                />
              </View>
              <Text style={styles.macroPercentage}>{carbsPercentage}%</Text>
            </View>
          </View>

          {/* Fat */}
          <View style={styles.macroRow}>
            <View style={styles.macroInfo}>
              <View style={[styles.macroIcon, { backgroundColor: colors.fat + '20' }]}>
                <Text style={styles.macroEmoji}>🥑</Text>
              </View>
              <View style={styles.macroTextContainer}>
                <Text style={styles.macroLabel}>Fat</Text>
                <Text style={styles.macroValues}>
                  {formatMacros(totalMacros.fat)} / {formatMacros(macroGoals.fat)}
                </Text>
              </View>
            </View>
            <View style={styles.macroProgressContainer}>
              <View style={styles.macroProgressBar}>
                <View
                  style={[
                    styles.macroProgressFill,
                    {
                      width: `${Math.min(fatPercentage, 100)}%`,
                      backgroundColor: colors.fat,
                    },
                  ]}
                />
              </View>
              <Text style={styles.macroPercentage}>{fatPercentage}%</Text>
            </View>
          </View>
        </View>

        {/* Today's Meals */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Today's Meals</Text>
            <Text style={styles.mealCount}>{meals.length} meals</Text>
          </View>

          {meals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyStateText}>No meals logged yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the + button below to add your first meal
              </Text>
            </View>
          ) : (
            <View style={styles.mealsList}>
              {meals.map((meal) => (
                <View key={meal.id} style={styles.mealItem}>
                  <TouchableOpacity
                    style={styles.mealHeader}
                    onPress={() => toggleMealExpansion(meal.id)}
                  >
                    <View style={styles.mealMainInfo}>
                      <View style={styles.mealTypeContainer}>
                        <Text style={styles.mealEmoji}>
                          {meal.mealType === 'Breakfast' ? '🍳' :
                           meal.mealType === 'Lunch' ? '🍽️' :
                           meal.mealType === 'Dinner' ? '🍕' : '🍎'}
                        </Text>
                        <View>
                          <Text style={styles.mealType}>{meal.mealType}</Text>
                          <Text style={styles.mealTime}>{formatTime(meal.timestamp)}</Text>
                        </View>
                      </View>
                      <Text style={styles.mealCalories}>{meal.calories} cal</Text>
                    </View>
                    <Ionicons
                      name={expandedMealId === meal.id ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {expandedMealId === meal.id && (
                    <View style={styles.mealDetails}>
                      <View style={styles.mealMacros}>
                        <View style={styles.mealMacroItem}>
                          <Text style={styles.mealMacroLabel}>Protein</Text>
                          <Text style={styles.mealMacroValue}>{formatMacros(meal.protein)}</Text>
                        </View>
                        <View style={styles.mealMacroItem}>
                          <Text style={styles.mealMacroLabel}>Carbs</Text>
                          <Text style={styles.mealMacroValue}>{formatMacros(meal.carbs)}</Text>
                        </View>
                        <View style={styles.mealMacroItem}>
                          <Text style={styles.mealMacroLabel}>Fat</Text>
                          <Text style={styles.mealMacroValue}>{formatMacros(meal.fat)}</Text>
                        </View>
                      </View>

                      {meal.selectedFoods && meal.selectedFoods.length > 0 && (
                        <View style={styles.foodsList}>
                          <Text style={styles.foodsListTitle}>Foods:</Text>
                          {meal.selectedFoods.map((food, index) => (
                            <Text key={index} style={styles.foodItem}>
                              • {food.name} ({food.serving})
                            </Text>
                          ))}
                        </View>
                      )}

                      <View style={styles.mealActions}>
                        <TouchableOpacity 
  style={styles.mealActionButton}
  onPress={() => handleEditMeal(meal)}
>
  <Ionicons name="pencil-outline" size={18} color={colors.primary} />
  <Text style={styles.mealActionText}>Edit</Text>
</TouchableOpacity>
                        <TouchableOpacity
                          style={styles.mealActionButton}
                          onPress={() => handleDeleteMeal(meal.id)}
                        >
                          <Ionicons name="trash-outline" size={18} color={colors.error} />
                          <Text style={[styles.mealActionText, { color: colors.error }]}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

       {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setShowMealModal(true)}
      >
        <Ionicons name="add" size={28} color={colors.textWhite} />
      </TouchableOpacity>

      {/* Meal Modal */}
      <MealModal
  visible={showMealModal}
  onClose={() => {
    setShowMealModal(false);
    setEditingMeal(null);
  }}
  onSave={editingMeal ? handleSaveEditedMeal : handleSaveMeal}
  editingMeal={editingMeal}
/>

{/* Goal Modals */}
<GoalModal
  visible={showGoalModal}
  onClose={() => setShowGoalModal(false)}
  onSave={handleUpdateGoal}
  currentGoal={dailyGoal}
/>

<MacroGoalsModal
  visible={showMacroModal}
  onClose={() => setShowMacroModal(false)}
  onSave={handleUpdateMacros}
  currentMacros={macroGoals}
/>
    </SafeAreaView>
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
  },
  greeting: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  username: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  logoutButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    borderRadius: spacing.borderRadius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  streakInfo: {
    marginLeft: spacing.md,
  },
  streakNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  streakLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  mealCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  calorieStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  calorieStat: {
    flex: 1,
    alignItems: 'center',
  },
  calorieNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  calorieLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  calorieDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    minWidth: 40,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  macroInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  macroIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  macroEmoji: {
    fontSize: 18,
  },
  macroTextContainer: {
    marginLeft: spacing.sm,
  },
  macroLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  macroValues: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  macroProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  macroProgressBar: {
    width: 80,
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroPercentage: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    minWidth: 35,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  mealsList: {
    marginTop: spacing.sm,
  },
  mealItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealMainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  mealType: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  mealTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  mealCalories: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  mealDetails: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  mealMacros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  mealMacroItem: {
    alignItems: 'center',
  },
  mealMacroLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  mealMacroValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  foodsList: {
    marginBottom: spacing.md,
  },
  foodsListTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  foodItem: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  mealActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  mealActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  mealActionText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeight.semiBold,
  },
  bottomSpacer: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: spacing.base,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default HomeScreen;