// src/screens/main/DietScreen.js
// Weekly meal planning with AI-generated suggestions

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import colors from '../../styles/colors';
import typography from '../../styles/typography';
import spacing from '../../styles/spacing';
import { API_KEYS } from '../../constants';
import { getData, saveData } from '../../utils/storage';
import MealPreferencesModal from '../../components/modals/MealPreferencesModal';
import GroceryListModal from '../../components/modals/GroceryListModal';
import MealDetailModal from '../../components/modals/MealDetailModal';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const DietScreen = () => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [weeklyMealPlan, setWeeklyMealPlan] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showMealDetail, setShowMealDetail] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showGroceryModal, setShowGroceryModal] = useState(false);
  const [preferences, setPreferences] = useState(null);
   const viewMealDetails = (meal, mealType) => {
    setSelectedMeal({ ...meal, mealType });
    setShowMealDetail(true);
  };

  useEffect(() => {
    loadMealPlan();
  }, []);

  const loadMealPlan = async () => {
    try {
      const saved = await getData('repright_weekly_meal_plan', {});
      setWeeklyMealPlan(saved);
    } catch (error) {
      console.error('Error loading meal plan:', error);
    }
  };

  const generateWeeklyMealPlan = async () => {
    const savedPrefs = await getData('repright_meal_preferences');
    if (!savedPrefs) {
      Alert.alert(
        'Set Preferences First',
        'Please set your meal preferences before generating a plan',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Set Preferences', onPress: () => setShowPreferencesModal(true) },
        ]
      );
      return;
    }

    setLoading(true);
    
    try {
      const calorieTarget = await getData('repright_daily_goal', 2000);
      const prefs = savedPrefs;
      
      const mealCalories = {
        'Breakfast': Math.round(calorieTarget * 0.25),
        'Lunch': Math.round(calorieTarget * 0.35),
        'Dinner': Math.round(calorieTarget * 0.30),
        'Snacks': Math.round(calorieTarget * 0.10),
      };
      
      // Generate meals using AI for the entire week
      const newMealPlan = {};
      
      for (let day = 0; day < 7; day++) {
        newMealPlan[day] = {};
        
        for (const mealType of MEAL_TYPES) {
          const calories = mealCalories[mealType];
          
          try {
            // Generate meal using Claude AI
            const aiMeal = await generateMealWithClaude(
              mealType,
              calories,
              prefs.diet,
              prefs.cuisines,
              prefs.allergies,
              prefs.budget,
              day
            );
            newMealPlan[day][mealType] = aiMeal;
          } catch (error) {
            console.error(`Error generating ${mealType} for day ${day}:`, error);
            // Fallback to varied meals if AI fails
            newMealPlan[day][mealType] = generateVariedMeal(mealType, calories, day);
          }
        }
      }

      setWeeklyMealPlan(newMealPlan);
      await saveData('repright_weekly_meal_plan', newMealPlan);
      Alert.alert('Success! 🎉', 'Your AI-powered weekly meal plan is ready!');
    } catch (error) {
      console.error('Error generating meal plan:', error);
      Alert.alert('Error', 'Failed to generate meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

 // Generate meal using Claude AI
  const generateMealWithClaude = async (mealType, targetCalories, diet, cuisines, allergies, budget, dayIndex) => {
    try {
      // Pick a random cuisine
      const cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
      
      // Build the prompt for Claude
      const prompt = `Generate a healthy ${mealType.toLowerCase()} recipe with these requirements:

- Cuisine: ${cuisine}
- Diet type: ${diet}
- Target calories: ${targetCalories}
- Budget: ${budget}
- Allergies to avoid: ${allergies.length > 0 ? allergies.join(', ') : 'none'}
- Make it different from typical ${mealType.toLowerCase()} meals

Return ONLY valid JSON in this exact format (no markdown, no explanations):
{
  "title": "Recipe name",
  "calories": ${targetCalories},
  "protein": 25,
  "carbs": 45,
  "fat": 15,
  "servings": 1,
  "readyInMinutes": 30,
  "summary": "Brief description of the dish",
  "ingredients": [
    "ingredient 1 with amount",
    "ingredient 2 with amount"
  ],
  "instructions": [
    "Step 1",
    "Step 2"
  ]
}`;

      // Call Claude API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEYS.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const contentText = data.content[0].text;
      
      // Parse the JSON response
      let recipeData;
      try {
        // Remove markdown code blocks if present
        const cleanedText = contentText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        recipeData = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Error parsing Claude response:', parseError);
        console.error('Raw response:', contentText);
        throw new Error('Invalid JSON from AI');
      }

      // Get appropriate image for the meal type
      const mealImages = {
        'Breakfast': [
          'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400',
          'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
          'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400',
        ],
        'Lunch': [
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
          'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
        ],
        'Dinner': [
          'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
          'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400',
        ],
        'Snacks': [
          'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
          'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400',
          'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400',
        ],
      };

      const imageOptions = mealImages[mealType] || mealImages['Lunch'];
      const selectedImage = imageOptions[dayIndex % imageOptions.length];

      return {
        id: `claude-${mealType.toLowerCase()}-day${dayIndex}-${Date.now()}`,
        title: recipeData.title,
        image: selectedImage,
        calories: recipeData.calories || targetCalories,
        protein: recipeData.protein || Math.round(targetCalories * 0.25 / 4),
        carbs: recipeData.carbs || Math.round(targetCalories * 0.50 / 4),
        fat: recipeData.fat || Math.round(targetCalories * 0.25 / 9),
        servings: recipeData.servings || 1,
        readyInMinutes: recipeData.readyInMinutes || 30,
        summary: recipeData.summary || 'Delicious and nutritious meal.',
        ingredients: recipeData.ingredients || [],
        instructions: recipeData.instructions || [],
        recipeUrl: null,
      };
    } catch (error) {
      console.error('Error generating meal with Claude:', error);
      throw error;
    }
  };

  // Generate varied meals for different days
  const generateVariedMeal = (mealType, calories, dayIndex) => {
    const mealVariations = {
      'Breakfast': [
        {
          title: 'Oatmeal with Berries',
          image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400',
          summary: 'Warm oatmeal topped with fresh berries, honey, and almonds.',
        },
        {
          title: 'Scrambled Eggs & Toast',
          image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
          summary: 'Fluffy scrambled eggs with whole wheat toast and avocado.',
        },
        {
          title: 'Greek Yogurt Parfait',
          image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
          summary: 'Creamy Greek yogurt layered with granola and fresh fruit.',
        },
        {
          title: 'Protein Pancakes',
          image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
          summary: 'Fluffy protein pancakes topped with banana and maple syrup.',
        },
        {
          title: 'Avocado Toast',
          image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',
          summary: 'Smashed avocado on sourdough with poached eggs.',
        },
        {
          title: 'Smoothie Bowl',
          image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400',
          summary: 'Thick smoothie bowl topped with granola, coconut, and berries.',
        },
        {
          title: 'French Toast',
          image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400',
          summary: 'Classic French toast with cinnamon and fresh strawberries.',
        },
      ],
      'Lunch': [
        {
          title: 'Grilled Chicken Salad',
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
          summary: 'Fresh grilled chicken breast over mixed greens with vinaigrette.',
        },
        {
          title: 'Turkey & Cheese Wrap',
          image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400',
          summary: 'Whole wheat wrap with turkey, cheese, lettuce, and tomato.',
        },
        {
          title: 'Quinoa Buddha Bowl',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
          summary: 'Quinoa bowl with roasted vegetables, chickpeas, and tahini.',
        },
        {
          title: 'Chicken Caesar Salad',
          image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400',
          summary: 'Crisp romaine with grilled chicken, parmesan, and Caesar dressing.',
        },
        {
          title: 'Tuna Sandwich',
          image: 'https://images.unsplash.com/photo-1619740455993-557d41f24f44?w=400',
          summary: 'Tuna salad sandwich on whole grain bread with lettuce.',
        },
        {
          title: 'Veggie Stir-Fry',
          image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
          summary: 'Colorful vegetable stir-fry with tofu over brown rice.',
        },
        {
          title: 'Chicken Burrito Bowl',
          image: 'https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=400',
          summary: 'Grilled chicken with rice, beans, salsa, and guacamole.',
        },
      ],
      'Dinner': [
        {
          title: 'Baked Salmon with Vegetables',
          image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
          summary: 'Perfectly baked salmon fillet with roasted seasonal vegetables.',
        },
        {
          title: 'Grilled Steak & Potatoes',
          image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400',
          summary: 'Juicy grilled steak with roasted potatoes and asparagus.',
        },
        {
          title: 'Chicken Pasta Primavera',
          image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
          summary: 'Whole wheat pasta with grilled chicken and fresh vegetables.',
        },
        {
          title: 'Shrimp Tacos',
          image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
          summary: 'Grilled shrimp tacos with cabbage slaw and avocado.',
        },
        {
          title: 'Turkey Meatballs & Zoodles',
          image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400',
          summary: 'Lean turkey meatballs with zucchini noodles and marinara.',
        },
        {
          title: 'Grilled Chicken & Rice',
          image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
          summary: 'Marinated grilled chicken breast with brown rice and broccoli.',
        },
        {
          title: 'Beef Stir-Fry',
          image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400',
          summary: 'Tender beef strips with mixed vegetables in savory sauce.',
        },
      ],
      'Snacks': [
        {
          title: 'Greek Yogurt with Nuts',
          image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
          summary: 'Protein-rich Greek yogurt topped with mixed nuts and honey.',
        },
        {
          title: 'Apple & Peanut Butter',
          image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400',
          summary: 'Fresh apple slices with natural peanut butter.',
        },
        {
          title: 'Protein Shake',
          image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400',
          summary: 'Chocolate protein shake with banana and almond milk.',
        },
        {
          title: 'Trail Mix',
          image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400',
          summary: 'Healthy mix of nuts, seeds, and dried fruits.',
        },
        {
          title: 'Cottage Cheese & Fruit',
          image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400',
          summary: 'Low-fat cottage cheese with fresh pineapple chunks.',
        },
        {
          title: 'Hummus & Veggies',
          image: 'https://images.unsplash.com/photo-1621340635223-9b8f5f9b6440?w=400',
          summary: 'Creamy hummus with carrot sticks and bell peppers.',
        },
        {
          title: 'Protein Bar',
          image: 'https://images.unsplash.com/photo-1582033712908-32d7c6c8e8f0?w=400',
          summary: 'High-protein energy bar with nuts and chocolate.',
        },
      ],
    };

    const variations = mealVariations[mealType] || mealVariations['Lunch'];
    const selectedVariation = variations[dayIndex % variations.length];

    return {
      id: `${mealType.toLowerCase()}-day${dayIndex}-${Date.now()}`,
      title: selectedVariation.title,
      image: selectedVariation.image,
      calories: calories,
      protein: Math.round(calories * 0.25 / 4),
      carbs: Math.round(calories * 0.50 / 4),
      fat: Math.round(calories * 0.25 / 9),
      servings: 1,
      readyInMinutes: getFallbackCookTime(mealType),
      summary: selectedVariation.summary,
      recipeUrl: `#recipe-${mealType.toLowerCase()}`,
    };
  };

  const getFallbackMealTitle = (mealType) => {
    const titles = {
      'Breakfast': 'Oatmeal with Berries',
      'Lunch': 'Grilled Chicken Salad',
      'Dinner': 'Baked Salmon with Vegetables',
      'Snacks': 'Greek Yogurt with Nuts',
    };
    return titles[mealType];
  };

  const getFallbackMealImage = (mealType) => {
    const images = {
      'Breakfast': 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400',
      'Lunch': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      'Dinner': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
      'Snacks': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    };
    return images[mealType];
  };

  const getFallbackCookTime = (mealType) => {
    const times = {
      'Breakfast': 10,
      'Lunch': 20,
      'Dinner': 30,
      'Snacks': 5,
    };
    return times[mealType];
  };

  const getFallbackSummary = (mealType) => {
    const summaries = {
      'Breakfast': 'A healthy and delicious breakfast bowl with oats, fresh berries, and honey.',
      'Lunch': 'Fresh grilled chicken breast served over mixed greens with vinaigrette.',
      'Dinner': 'Perfectly baked salmon fillet with roasted seasonal vegetables.',
      'Snacks': 'Protein-rich Greek yogurt topped with mixed nuts and honey.',
    };
    return summaries[mealType];
  };



  const getMealEmoji = (mealType) => {
    const emojis = {
      'Breakfast': '🍳',
      'Lunch': '🍽️',
      'Dinner': '🍕',
      'Snacks': '🍎',
    };
    return emojis[mealType] || '🍴';
  };

  const currentDayMeals = weeklyMealPlan[selectedDay] || {};
  const hasMealPlan = Object.keys(weeklyMealPlan).length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Meal Plan</Text>
          <Text style={styles.headerSubtitle}>
            AI-powered weekly nutrition
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowPreferencesModal(true)}
          >
            <Ionicons name="settings-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowGroceryModal(true)}
          >
            <Ionicons name="cart-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateWeeklyMealPlan}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.textWhite} />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color={colors.textWhite} />
                <Text style={styles.generateButtonText}>Generate</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daysScroll}
        contentContainerStyle={styles.daysScrollContent}
      >
        {DAYS_OF_WEEK.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              selectedDay === index && styles.dayButtonActive,
            ]}
            onPress={() => setSelectedDay(index)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDay === index && styles.dayTextActive,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.mealsScroll}
        contentContainerStyle={styles.mealsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!hasMealPlan ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Meal Plan Yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap "Generate" to create a{'\n'}
              weekly meal plan tailored to your goals
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={generateWeeklyMealPlan}
            >
              <Ionicons name="sparkles" size={20} color={colors.textWhite} />
              <Text style={styles.emptyButtonText}>Generate Meal Plan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          MEAL_TYPES.map((mealType) => {
            const meal = currentDayMeals[mealType];
            
            if (!meal) return null;

            return (
              <TouchableOpacity
                key={mealType}
                style={styles.mealCard}
                onPress={() => viewMealDetails(meal, mealType)}
              >
                <Image
                  source={{ uri: meal.image }}
                  style={styles.mealImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.mealGradient}
                />
                
                <View style={styles.mealContent}>
                  <View style={styles.mealHeader}>
                    <Text style={styles.mealEmoji}>{getMealEmoji(mealType)}</Text>
                    <View style={styles.mealTypeContainer}>
                      <Text style={styles.mealTypeLabel}>{mealType}</Text>
                      <Text style={styles.mealTime}>
                        {meal.readyInMinutes} min
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.mealTitle} numberOfLines={2}>
                    {meal.title}
                  </Text>

                  <View style={styles.mealMacros}>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{meal.calories}</Text>
                      <Text style={styles.macroLabel}>cal</Text>
                    </View>
                    <View style={styles.macroDivider} />
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{meal.protein}g</Text>
                      <Text style={styles.macroLabel}>protein</Text>
                    </View>
                    <View style={styles.macroDivider} />
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{meal.carbs}g</Text>
                      <Text style={styles.macroLabel}>carbs</Text>
                    </View>
                    <View style={styles.macroDivider} />
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{meal.fat}g</Text>
                      <Text style={styles.macroLabel}>fat</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.mealBadge}>
                  <Ionicons name="chevron-forward" size={20} color={colors.textWhite} />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              Generating your personalized{'\n'}meal plan...
            </Text>
          </View>
        </View>
      )}

      <MealPreferencesModal
        visible={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onSave={(prefs) => {
          setPreferences(prefs);
          Alert.alert('Saved!', 'Your preferences have been saved. Tap Generate to create your meal plan.');
        }}
      />

      <GroceryListModal
        visible={showGroceryModal}
        onClose={() => setShowGroceryModal(false)}
        weeklyMealPlan={weeklyMealPlan}
      />
   <MealDetailModal
        visible={showMealDetail}
        onClose={() => setShowMealDetail(false)}
        meal={selectedMeal}
      />
    </SafeAreaView>
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
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.md,
    gap: spacing.xs,
  },
  generateButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
  },
  daysScroll: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  daysScrollContent: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  dayButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.md,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 60,
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textSecondary,
  },
  dayTextActive: {
    color: colors.textWhite,
  },
  mealsScroll: {
    flex: 1,
  },
  mealsScrollContent: {
    padding: spacing.base,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.massive,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.md,
    gap: spacing.sm,
  },
  emptyButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
  },
  mealCard: {
    height: 200,
    borderRadius: spacing.borderRadius.lg,
    marginBottom: spacing.base,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mealImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  mealGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  mealContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.base,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  mealEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  mealTypeContainer: {
    flex: 1,
  },
  mealTypeLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textWhite,
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mealTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textWhite,
    opacity: 0.6,
  },
  mealTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  mealMacros: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
  },
  macroLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textWhite,
    opacity: 0.7,
  },
  macroDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.textWhite,
    opacity: 0.3,
  },
  mealBadge: {
    position: 'absolute',
    top: spacing.base,
    right: spacing.base,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});

export default DietScreen;