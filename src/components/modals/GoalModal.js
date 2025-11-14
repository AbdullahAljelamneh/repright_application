// src/components/modals/GoalModal.js
// Modal for setting daily calorie goal

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
import { CALORIE_PRESETS } from '../../constants';

const GoalModal = ({ visible, onClose, onSave, currentGoal }) => {
  const [goal, setGoal] = useState(currentGoal?.toString() || '2000');

  const handleSave = () => {
    const numGoal = parseInt(goal);
    
    if (isNaN(numGoal) || numGoal < 500 || numGoal > 10000) {
      Alert.alert('Invalid Goal', 'Please enter a goal between 500 and 10,000 calories');
      return;
    }

    onSave(numGoal);
    onClose();
  };

  const setPreset = (preset) => {
    setGoal(preset.toString());
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
            <Text style={styles.title}>Daily Calorie Goal</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.label}>Set your daily calorie target</Text>

            {/* Quick Presets */}
            <View style={styles.presetsContainer}>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => setPreset(CALORIE_PRESETS.LOSS)}
              >
                <Text style={styles.presetLabel}>Weight Loss</Text>
                <Text style={styles.presetValue}>{CALORIE_PRESETS.LOSS}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => setPreset(CALORIE_PRESETS.MAINTAIN)}
              >
                <Text style={styles.presetLabel}>Maintain</Text>
                <Text style={styles.presetValue}>{CALORIE_PRESETS.MAINTAIN}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => setPreset(CALORIE_PRESETS.GAIN)}
              >
                <Text style={styles.presetLabel}>Muscle Gain</Text>
                <Text style={styles.presetValue}>{CALORIE_PRESETS.GAIN}</Text>
              </TouchableOpacity>
            </View>

            {/* Custom Input */}
            <Text style={styles.orText}>or enter custom amount</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={goal}
                onChangeText={setGoal}
                keyboardType="numeric"
                placeholder="2000"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.inputSuffix}>calories</Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Goal</Text>
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
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  presetButton: {
    flex: 1,
    backgroundColor: colors.borderLight,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  presetValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  orText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  inputSuffix: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
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

export default GoalModal;