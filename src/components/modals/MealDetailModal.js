// src/components/modals/MealDetailModal.js
// Modal showing meal details, recipe, and nutrition

import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';

const MealDetailModal = ({ visible, onClose, meal }) => {
  if (!meal) return null;

  const handleAddToToday = () => {
    // TODO: Add functionality to add meal to today's log
    alert('This will add the meal to your Home screen!');
    onClose();
  };

  const openRecipeLink = () => {
    if (meal.recipeUrl && meal.recipeUrl.startsWith('http')) {
      Linking.openURL(meal.recipeUrl);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: meal.image }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.imageGradient}
            />
            
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <View style={styles.closeButtonCircle}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </View>
            </TouchableOpacity>

            {/* Meal Type Badge */}
            <View style={styles.mealTypeBadge}>
              <Text style={styles.mealTypeBadgeText}>{meal.mealType}</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>{meal.title}</Text>

            {/* Meta Info */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={styles.metaText}>{meal.readyInMinutes} min</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
                <Text style={styles.metaText}>{meal.servings} serving</Text>
              </View>
            </View>

            {/* Nutrition Card */}
            <View style={styles.nutritionCard}>
              <Text style={styles.sectionTitle}>Nutrition Facts</Text>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{meal.calories}</Text>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
                <View style={styles.nutritionDivider} />
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{meal.protein}g</Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
                <View style={styles.nutritionDivider} />
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{meal.carbs}g</Text>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
                <View style={styles.nutritionDivider} />
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{meal.fat}g</Text>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                </View>
              </View>
            </View>

            {/* Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About This Meal</Text>
              <Text style={styles.summaryText}>{meal.summary}</Text>
            </View>
{/* Ingredients */}
            {meal.ingredients && meal.ingredients.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
                {meal.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Instructions */}
            {meal.instructions && meal.instructions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Instructions</Text>
                {meal.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recipe Link */}
            {meal.recipeUrl && meal.recipeUrl.startsWith('http') && (
              <TouchableOpacity style={styles.recipeButton} onPress={openRecipeLink}>
                <Ionicons name="book-outline" size={20} color={colors.primary} />
                <Text style={styles.recipeButtonText}>View Full Recipe</Text>
                <Ionicons name="open-outline" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Bottom Action Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddToToday}>
            <Ionicons name="add-circle" size={24} color={colors.textWhite} />
            <Text style={styles.addButtonText}>Add to Today</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  ingredientText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.base,
    gap: spacing.md,
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionNumberText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
  },
  instructionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.xxxl,
    right: spacing.base,
  },
  closeButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealTypeBadge: {
    position: 'absolute',
    top: spacing.xxxl,
    left: spacing.base,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.md,
  },
  mealTypeBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    textTransform: 'uppercase',
  },
  content: {
    padding: spacing.base,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  nutritionCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  nutritionLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  nutritionDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  section: {
    marginBottom: spacing.xl,
  },
  summaryText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  recipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  recipeButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  footer: {
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.base,
    gap: spacing.sm,
  },
  addButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
  },
});

export default MealDetailModal;