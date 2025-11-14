// src/screens/auth/SignupScreen.js
// Signup screen with form validation

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../auth/AuthContext';
import { validateRegistrationForm } from '../../utils/validation';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';

const SignupScreen = ({ navigation }) => {
  const { signUp, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle signup
  const handleSignup = async () => {
    // Validate form
    const validation = validateRegistrationForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    
    // Attempt sign up
    const result = await signUp(
      formData.email,
      formData.password,
      formData.name
    );
    
    if (!result.success) {
      Alert.alert('Signup Failed', result.error);
    }
    
    setIsSubmitting(false);
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={colors.textWhite}
                />
              </TouchableOpacity>
              <Text style={styles.logo}>RepRight</Text>
              <Text style={styles.tagline}>
                Start your fitness journey today 🚀
              </Text>
            </View>

            {/* Signup Form */}
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Create Account</Text>
              <Text style={styles.formSubtitle}>
                Sign up to get started with RepRight
              </Text>

              {/* Name Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.name}
                    onChangeText={(text) => handleChange('name', text)}
                    autoCapitalize="words"
                  />
                </View>
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.email}
                    onChangeText={(text) => handleChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.inputPassword]}
                    placeholder="Password"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.password}
                    onChangeText={(text) => handleChange('password', text)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.inputPassword]}
                    placeholder="Confirm Password"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleChange('confirmPassword', text)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              {/* Signup Button */}
              <TouchableOpacity
                style={[
                  styles.signupButton,
                  isSubmitting && styles.signupButtonDisabled,
                ]}
                onPress={handleSignup}
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <ActivityIndicator color={colors.textWhite} />
                ) : (
                  <Text style={styles.signupButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Terms Text */}
              <Text style={styles.termsText}>
                By signing up, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: spacing.sm,
  },
  logo: {
    fontSize: typography.fontSize.massive,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: typography.fontSize.base,
    color: colors.textWhite,
    opacity: 0.9,
  },
  formContainer: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  formTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.base,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  inputPassword: {
    paddingRight: spacing.xxxl,
  },
  eyeIcon: {
    position: 'absolute',
    right: spacing.md,
    padding: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  signupButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.md,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.base,
    marginBottom: spacing.md,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
  },
  termsText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
});

export default SignupScreen;