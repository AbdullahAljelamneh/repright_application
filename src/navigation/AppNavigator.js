// src/navigation/AppNavigator.js
// Root navigator that handles auth/main flow switching

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { navigationRef } from './navigationRef';
import colors from '../styles/colors';

// Import navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, initializing } = useAuth();

  // Show loading screen while checking auth state
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // User is signed in - show main app
          <Stack.Screen name="MainApp" component={MainNavigator} />
        ) : (
          // User is not signed in - show auth screens
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default AppNavigator;