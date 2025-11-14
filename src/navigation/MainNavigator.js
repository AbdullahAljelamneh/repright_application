// src/navigation/MainNavigator.js
// Bottom tab navigator for main app screens

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

// Import screens (we'll create these next)
import HomeScreen from '../screens/main/HomeScreen';
import DietScreen from '../screens/main/DietScreen';
import WorkoutScreen from '../screens/main/WorkoutScreen';
import AIAssistantScreen from '../screens/main/AIAssistantScreen';
import LeaderboardScreen from '../screens/main/LeaderboardScreen';
import CommunityScreen from '../screens/main/CommunityScreen';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Diet':
              iconName = focused ? 'restaurant' : 'restaurant-outline';
              break;
            case 'Workout':
              iconName = focused ? 'barbell' : 'barbell-outline';
              break;
            case 'AI Coach':
              iconName = focused ? 'sparkles' : 'sparkles-outline';
              break;
            case 'Ranks':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Community':
              iconName = focused ? 'people' : 'people-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Diet" component={DietScreen} />
      <Tab.Screen name="Workout" component={WorkoutScreen} />
      <Tab.Screen name="AI Coach" component={AIAssistantScreen} />
      <Tab.Screen name="Ranks" component={LeaderboardScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
    </Tab.Navigator>
  );
};

export default MainNavigator;