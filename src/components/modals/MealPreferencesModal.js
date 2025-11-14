// src/components/modals/MealPreferencesModal.js
// Modal for setting meal plan preferences

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';
import { getData, saveData } from '../../utils/storage';

const DIET_OPTIONS = [
  { id: 'balanced', label: 'Balanced', icon: '⚖️', description: 'Equal mix of all nutrients' },
  { id: 'high-protein', label: 'High Protein', icon: '💪', description: 'Muscle building focus' },
  { id: 'low-carb', label: 'Low Carb', icon: '🥑', description: 'Keto-friendly meals' },
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥗', description: 'No meat' },
  { id: 'vegan', label: 'Vegan', icon: '🌱', description: 'Plant-based only' },
  { id: 'paleo', label: 'Paleo', icon: '🥩', description: 'Whole foods focus' },
];

const BUDGET_OPTIONS = [
  { id: 'budget', label: 'Budget', icon: '💵', description: 'Simple, affordable meals', color: '#4CAF50' },
  { id: 'moderate', label: 'Moderate', icon: '💰', description: 'Balanced quality & cost', color: colors.primary },
  { id: 'premium', label: 'Premium', icon: '💎', description: 'High-end ingredients', color: '#9C27B0' },
];

const CUISINE_OPTIONS = [
  { id: 'american', label: 'American', flag: '🇺🇸' },
  { id: 'italian', label: 'Italian', flag: '🇮🇹' },
  { id: 'mexican', label: 'Mexican', flag: '🇲🇽' },
  { id: 'chinese', label: 'Chinese', flag: '🇨🇳' },
  { id: 'japanese', label: 'Japanese', flag: '🇯🇵' },
  { id: 'mediterranean', label: 'Mediterranean', flag: '🇬🇷' },
  { id: 'indian', label: 'Indian', flag: '🇮🇳' },
  { id: 'thai', label: 'Thai', flag: '🇹🇭' },
];

const ALLERGY_OPTIONS = [
  { id: 'dairy', label: 'Dairy', icon: '🥛' },
  { id: 'gluten', label: 'Gluten', icon: '🌾' },
  { id: 'nuts', label: 'Nuts', icon: '🥜' },
  { id: 'soy', label: 'Soy', icon: '🫘' },
  { id: 'seafood', label: 'Seafood', icon: '🦐' },
  { id: 'eggs', label: 'Eggs', icon: '🥚' },
];

const MealPreferencesModal = ({ visible, onClose, onSave }) => {
  const [selectedDiet, setSelectedDiet] = useState('balanced');
  const [selectedBudget, setSelectedBudget] = useState('moderate');
  const [selectedCuisines, setSelectedCuisines] = useState(['american', 'italian', 'mexican']);
  const [selectedAllergies, setSelectedAllergies] = useState([]);

  useEffect(() => {
    if (visible) {
      loadPreferences();
    }
  }, [visible]);

  const loadPreferences = async () => {
    try {
      const prefs = await getData('repright_meal_preferences', {
        diet: 'balanced',
        budget: 'moderate',
        cuisines: ['american', 'italian', 'mexican'],
        allergies: [],
      });
      setSelectedDiet(prefs.diet);
      setSelectedBudget(prefs.budget);
      setSelectedCuisines(prefs.cuisines);
      setSelectedAllergies(prefs.allergies);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const toggleCuisine = (cuisineId) => {
    if (selectedCuisines.includes(cuisineId)) {
      setSelectedCuisines(selectedCuisines.filter(id => id !== cuisineId));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisineId]);
    }
  };

  const toggleAllergy = (allergyId) => {
    if (selectedAllergies.includes(allergyId)) {
      setSelectedAllergies(selectedAllergies.filter(id => id !== allergyId));
    } else {
      setSelectedAllergies([...selectedAllergies, allergyId]);
    }
  };

  const handleSave = async () => {
    if (selectedCuisines.length === 0) {
      Alert.alert('Select Cuisines', 'Please select at least one cuisine preference');
      return;
    }

    const preferences = {
      diet: selectedDiet,
      budget: selectedBudget,
      cuisines: selectedCuisines,
      allergies: selectedAllergies,
    };

    await saveData('repright_meal_preferences', preferences);
    onSave(preferences);
    onClose();
  };

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
          <Text style={styles.title}>Meal Preferences</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Diet Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Diet Type</Text>
            <Text style={styles.sectionSubtitle}>Choose your dietary preference</Text>
            <View style={styles.optionsGrid}>
              {DIET_OPTIONS.map((diet) => (
                <TouchableOpacity
                  key={diet.id}
                  style={[
                    styles.dietOption,
                    selectedDiet === diet.id && styles.dietOptionActive,
                  ]}
                  onPress={() => setSelectedDiet(diet.id)}
                >
                  <Text style={styles.dietIcon}>{diet.icon}</Text>
                  <Text style={[
                    styles.dietLabel,
                    selectedDiet === diet.id && styles.dietLabelActive,
                  ]}>
                    {diet.label}
                  </Text>
                  <Text style={styles.dietDescription}>{diet.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Budget */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget</Text>
            <Text style={styles.sectionSubtitle}>Select your meal budget range</Text>
            <View style={styles.budgetContainer}>
              {BUDGET_OPTIONS.map((budget) => (
                <TouchableOpacity
                  key={budget.id}
                  style={[
                    styles.budgetOption,
                    selectedBudget === budget.id && styles.budgetOptionActive,
                  ]}
                  onPress={() => setSelectedBudget(budget.id)}
                >
                  <Text style={styles.budgetIcon}>{budget.icon}</Text>
                  <Text style={[
                    styles.budgetLabel,
                    selectedBudget === budget.id && styles.budgetLabelActive,
                  ]}>
                    {budget.label}
                  </Text>
                  <Text style={styles.budgetDescription}>{budget.description}</Text>
                  {selectedBudget === budget.id && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cuisines */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorite Cuisines</Text>
            <Text style={styles.sectionSubtitle}>Select cuisines you enjoy (multiple allowed)</Text>
            <View style={styles.cuisineGrid}>
              {CUISINE_OPTIONS.map((cuisine) => (
                <TouchableOpacity
                  key={cuisine.id}
                  style={[
                    styles.cuisineChip,
                    selectedCuisines.includes(cuisine.id) && styles.cuisineChipActive,
                  ]}
                  onPress={() => toggleCuisine(cuisine.id)}
                >
                  <Text style={styles.cuisineFlag}>{cuisine.flag}</Text>
                  <Text style={[
                    styles.cuisineLabel,
                    selectedCuisines.includes(cuisine.id) && styles.cuisineLabelActive,
                  ]}>
                    {cuisine.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Allergies */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Allergies & Restrictions</Text>
            <Text style={styles.sectionSubtitle}>Select any dietary restrictions</Text>
            <View style={styles.allergyGrid}>
              {ALLERGY_OPTIONS.map((allergy) => (
                <TouchableOpacity
                  key={allergy.id}
                  style={[
                    styles.allergyChip,
                    selectedAllergies.includes(allergy.id) && styles.allergyChipActive,
                  ]}
                  onPress={() => toggleAllergy(allergy.id)}
                >
                  <Text style={styles.allergyIcon}>{allergy.icon}</Text>
                  <Text style={[
                    styles.allergyLabel,
                    selectedAllergies.includes(allergy.id) && styles.allergyLabelActive,
                  ]}>
                    {allergy.label}
                  </Text>
                  {selectedAllergies.includes(allergy.id) && (
                    <Ionicons name="close-circle" size={18} color={colors.error} style={styles.allergyRemove} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.bottomSpacer} />
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
  },
  section: {
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dietOption: {
    width: '48%',
    backgroundColor: colors.borderLight,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  dietOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  dietIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  dietLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  dietLabelActive: {
    color: colors.primary,
  },
  dietDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  budgetContainer: {
    gap: spacing.sm,
  },
  budgetOption: {
    backgroundColor: colors.borderLight,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.base,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  budgetIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  budgetLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  budgetLabelActive: {
    color: colors.primary,
  },
  budgetDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    flex: 2,
  },
  checkmark: {
    marginLeft: spacing.sm,
  },
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cuisineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: spacing.borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cuisineChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cuisineFlag: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  cuisineLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  cuisineLabelActive: {
    color: colors.textWhite,
    fontWeight: typography.fontWeight.semiBold,
  },
  allergyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  allergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: spacing.borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  allergyChipActive: {
    backgroundColor: colors.error + '20',
    borderColor: colors.error,
  },
  allergyIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  allergyLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  allergyLabelActive: {
    color: colors.error,
    fontWeight: typography.fontWeight.semiBold,
  },
  allergyRemove: {
    marginLeft: spacing.xs,
  },
  bottomSpacer: {
    height: spacing.xxxl,
  },
});

export default MealPreferencesModal;