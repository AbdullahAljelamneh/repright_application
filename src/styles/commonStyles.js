// src/styles/commonStyles.js
// Reusable style combinations

import { StyleSheet, Platform } from 'react-native';
import colors from './colors';
import spacing from './spacing';
import typography from './typography';

export const commonStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  screenPadding: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.screenVertical,
  },

  // Card Styles
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  cardNoBorder: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.cardPadding,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  // Layout Helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Text Styles
  textPrimary: {
    color: colors.textPrimary,
    ...typography.styles.body,
  },

  textSecondary: {
    color: colors.textSecondary,
    ...typography.styles.bodySmall,
  },

  textBold: {
    fontWeight: typography.fontWeight.bold,
  },

  // Shadow Styles
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  shadowLarge: {
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  // Input Styles
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.inputPadding,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },

  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },

  // Button Styles
  button: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.buttonPadding,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: colors.textWhite,
    ...typography.styles.button,
  },

  buttonDisabled: {
    backgroundColor: colors.inactive,
    opacity: 0.6,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 400,
  },
});

export default commonStyles;