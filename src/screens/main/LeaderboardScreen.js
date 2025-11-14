// src/screens/main/LeaderboardScreen.js
// Leaderboard screen - placeholder

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../styles/colors';
import typography from '../../styles/typography';

const LeaderboardScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        <Text style={styles.subtitle}>Rankings coming soon...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
});

export default LeaderboardScreen;