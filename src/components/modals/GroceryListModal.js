// src/components/modals/GroceryListModal.js
// Weekly grocery list based on meal plan

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';
import { API_KEYS } from '../../constants';

const GroceryListModal = ({ visible, onClose, weeklyMealPlan }) => {
  const [groceryList, setGroceryList] = useState({});
  const [loading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    if (visible && Object.keys(weeklyMealPlan).length > 0) {
      generateGroceryList();
    }
  }, [visible, weeklyMealPlan]);
const generateGroceryList = async () => {
    setLoading(true);
    try {
      // Extract ingredients from all meals in the week
      const allIngredients = [];
      
      Object.values(weeklyMealPlan).forEach(day => {
        Object.values(day).forEach(meal => {
          if (meal && meal.ingredients && meal.ingredients.length > 0) {
            allIngredients.push(...meal.ingredients);
          }
        });
      });

      if (allIngredients.length === 0) {
        setGroceryList({});
        setLoading(false);
        return;
      }

      // Categorize ingredients by type
      const categorized = {
        'Proteins': [],
        'Vegetables': [],
        'Fruits': [],
        'Grains & Carbs': [],
        'Dairy & Eggs': [],
        'Pantry Staples': [],
        'Other': [],
      };

      allIngredients.forEach(ingredient => {
        const lower = ingredient.toLowerCase();
        
        // Categorize based on keywords
        if (lower.includes('chicken') || lower.includes('beef') || lower.includes('pork') || 
            lower.includes('fish') || lower.includes('salmon') || lower.includes('turkey') || 
            lower.includes('tofu') || lower.includes('meat')) {
          categorized['Proteins'].push(ingredient);
        } else if (lower.includes('lettuce') || lower.includes('tomato') || lower.includes('onion') || 
                   lower.includes('carrot') || lower.includes('broccoli') || lower.includes('spinach') || 
                   lower.includes('pepper') || lower.includes('cucumber') || lower.includes('vegetable') ||
                   lower.includes('celery') || lower.includes('zucchini') || lower.includes('kale')) {
          categorized['Vegetables'].push(ingredient);
        } else if (lower.includes('apple') || lower.includes('banana') || lower.includes('orange') || 
                   lower.includes('berry') || lower.includes('strawberry') || lower.includes('blueberry') ||
                   lower.includes('grape') || lower.includes('fruit') || lower.includes('lemon') ||
                   lower.includes('lime') || lower.includes('avocado')) {
          categorized['Fruits'].push(ingredient);
        } else if (lower.includes('rice') || lower.includes('pasta') || lower.includes('bread') || 
                   lower.includes('oats') || lower.includes('quinoa') || lower.includes('flour') ||
                   lower.includes('tortilla') || lower.includes('noodle') || lower.includes('cereal')) {
          categorized['Grains & Carbs'].push(ingredient);
        } else if (lower.includes('milk') || lower.includes('cheese') || lower.includes('yogurt') || 
                   lower.includes('butter') || lower.includes('cream') || lower.includes('egg')) {
          categorized['Dairy & Eggs'].push(ingredient);
        } else if (lower.includes('oil') || lower.includes('salt') || lower.includes('pepper') || 
                   lower.includes('spice') || lower.includes('sauce') || lower.includes('vinegar') ||
                   lower.includes('sugar') || lower.includes('honey') || lower.includes('garlic') ||
                   lower.includes('seasoning')) {
          categorized['Pantry Staples'].push(ingredient);
        } else {
          categorized['Other'].push(ingredient);
        }
      });

      // Remove duplicates from each category
      const deduped = {};
      Object.keys(categorized).forEach(category => {
        const unique = [...new Set(categorized[category])];
        if (unique.length > 0) {
          deduped[category] = unique;
        }
      });

      setGroceryList(deduped);
    } catch (error) {
      console.error('Error generating grocery list:', error);
      setGroceryList({
        'Error': ['Could not generate grocery list. Please try again.'],
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (category, item) => {
    const key = `${category}-${item}`;
    setCheckedItems({
      ...checkedItems,
      [key]: !checkedItems[key],
    });
  };

  const shareList = async () => {
    let listText = '🛒 RepRight Weekly Grocery List\n\n';
    
    Object.keys(groceryList).forEach(category => {
      listText += `${category}:\n`;
      groceryList[category].forEach(item => {
        const key = `${category}-${item}`;
        const checked = checkedItems[key] ? '✓' : '☐';
        listText += `${checked} ${item}\n`;
      });
      listText += '\n';
    });

    try {
      await Share.share({
        message: listText,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const totalItems = Object.values(groceryList).reduce((sum, items) => sum + items.length, 0);
  const checkedCount = Object.keys(checkedItems).filter(key => checkedItems[key]).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Grocery List</Text>
            <Text style={styles.subtitle}>
              {checkedCount} of {totalItems} items
            </Text>
          </View>
          <TouchableOpacity onPress={shareList} style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Generating your grocery list...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {Object.keys(groceryList).length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="cart-outline" size={64} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No items in grocery list</Text>
                <Text style={styles.emptySubtext}>Generate a meal plan first</Text>
              </View>
            ) : (
              Object.keys(groceryList).map((category) => (
                <View key={category} style={styles.categorySection}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryTitle}>{category}</Text>
                    <Text style={styles.categoryCount}>
                      {groceryList[category].length} items
                    </Text>
                  </View>
                  
                  {groceryList[category].map((item, index) => {
                    const key = `${category}-${item}`;
                    const isChecked = checkedItems[key];
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.groceryItem}
                        onPress={() => toggleItem(category, item)}
                      >
                        <View style={[
                          styles.checkbox,
                          isChecked && styles.checkboxChecked,
                        ]}>
                          {isChecked && (
                            <Ionicons name="checkmark" size={18} color={colors.textWhite} />
                          )}
                        </View>
                        <Text style={[
                          styles.itemText,
                          isChecked && styles.itemTextChecked,
                        ]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))
            )}
            
            <View style={styles.bottomSpacer} />
          </ScrollView>
        )}

        {/* Share Button Fixed */}
        {!loading && totalItems > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.shareListButton} onPress={shareList}>
              <Ionicons name="share-social" size={20} color={colors.textWhite} />
              <Text style={styles.shareListText}>Share List</Text>
            </TouchableOpacity>
          </View>
        )}
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  shareButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.massive,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  categorySection: {
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  categoryCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  groceryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  itemText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    flex: 1,
  },
  itemTextChecked: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  bottomSpacer: {
    height: spacing.massive,
  },
  footer: {
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  shareListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.base,
    gap: spacing.sm,
  },
  shareListText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
  },
});

export default GroceryListModal;