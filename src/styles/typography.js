// src/styles/typography.js
// Typography styles for RepRight

import { Platform } from 'react-native';

export const typography = {
  // Font Families
  fontFamily: {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
  },

  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 32,
    massive: 40,
  },

  // Font Weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Text Styles (Common combinations)
  styles: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
    },
    h6: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    },
  },
};

export default typography;