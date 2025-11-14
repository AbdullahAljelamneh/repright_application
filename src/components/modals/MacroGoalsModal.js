// src/components/modals/MacroGoalsModal.js
// Modal for setting macro goals

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';

const MacroGoalsModal = ({ visible, onClose, onSave, currentMacros }) => {
  const [protein, setProtein] = useState(currentMacros?.protein?.toString() || '150');
  const [carbs, setCarbs] = useState(currentMacros?.carbs?.toString() || '200');
  const [fat, setFat] = useState(currentMacros?.fat?.toString() || '65');

  const handleSave = () => {
    const numProtein = parseInt(protein);
    const numCarbs = parseInt(carbs);
    const numFat = parseInt(fat);
    
    if (isNaN(numProtein) || isNaN(numCarbs) || isNaN(numFat)) {
      Alert.alert('Invalid Input', 'Please enter valid numbers for all macros');
      return;
    }

    if (numProtein < 0 || numCarbs < 0 || numFat < 0) {
      Alert.alert('Invalid Input', 'Macro values cannot be negative');
      return;
    }

    onSave({
      protein: numProtein,
      carbs: numCarbs,
      fat: numFat,
    });
    onClose();
  };

  const setBalancedMacros = () => {
    // 40% carbs, 30% protein, 30% fat (based on 2000 cal goal)
    setProtein('150');
    setCarbs('200');
    setFat('65');
  };

  const setHighProtein = () => {
    // High protein for muscle building
    setProtein('200');
    setCarbs('150');
    setFat('55');
  };

  const setLowCarb = () => {
    // Low carb / keto-ish
    setProtein('150');
    setCarbs('50');
    setFat('100');
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Macro Goals</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.label}>Set your daily macro targets (grams)</Text>

            {/* Quick Presets */}
            <View style={styles.presetsContainer}>
              <TouchableOpacity style={styles.presetButton} onPress={setBalancedMacros}>
                <Text style={styles.presetText}>Balanced</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.presetButton} onPress={setHighProtein}>
                <Text style={styles.presetText}>High Protein</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.presetButton} onPress={setLowCarb}>
                <Text style={styles.presetText}>Low Carb</Text>
              </TouchableOpacity>
            </View>

            {/* Protein Input */}
            <View style={styles.macroInputContainer}>
              <View style={styles.macroIconContainer} style={{backgroundColor: colors.protein + '20'}}>
                <Text style={styles.macroEmoji}>💪</Text>
              </View>
              <View style={styles.macroInfo}>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroSubtext}>4 cal per gram</Text>
              </View>
              <TextInput
                style={styles.macroInput}
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
                placeholder="150"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.inputUnit}>g</Text>
            </View>

            {/* Carbs Input */}
            <View style={styles.macroInputContainer}>
              <View style={[styles.macroIconContainer, {backgroundColor: colors.carbs + '20'}]}>
                <Text style={styles.macroEmoji}>🍞</Text>
              </View>
              <View style={styles.macroInfo}>
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroSubtext}>4 cal per gram</Text>
              </View>
              <TextInput
                style={styles.macroInput}
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
                placeholder="200"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.inputUnit}>g</Text>
            </View>

            {/* Fat Input */}
            <View style={styles.macroInputContainer}>
              <View style={[styles.macroIconContainer, {backgroundColor: colors.fat + '20'}]}>
                <Text style={styles.macroEmoji}>🥑</Text>
              </View>
              <View style={styles.macroInfo}>
                <Text style={styles.macroLabel}>Fat</Text>
                <Text style={styles.macroSubtext}>9 cal per gram</Text>
              </View>
              <TextInput
                style={styles.macroInput}
                value={fat}
                onChangeText={setFat}
                keyboardType="numeric"
                placeholder="65"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.inputUnit}>g</Text>
            </View>

            {/* Total Calories Display */}
            <View style={styles.totalCaloriesContainer}>
              <Text style={styles.totalCaloriesLabel}>Estimated Total:</Text>
              <Text style={styles.totalCaloriesValue}>
                {parseInt(protein || 0) * 4 + parseInt(carbs || 0) * 4 + parseInt(fat || 0) * 9} cal
              </Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Macro Goals</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.xl,
  },
  label: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  presetsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  presetButton: {
    flex: 1,
    backgroundColor: colors.borderLight,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  macroInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  macroIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  macroEmoji: {
    fontSize: 20,
  },
  macroInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  macroLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  macroSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  macroInput: {
    width: 60,
    height: 40,
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.sm,
    textAlign: 'center',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputUnit: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  totalCaloriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    borderRadius: spacing.borderRadius.md,
    padding: spacing.base,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  totalCaloriesLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  totalCaloriesValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.base,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
  },
});

export default MacroGoalsModal;