// src/screens/auth/LoginScreen.js
// Login screen with gradient background and social auth options

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
import { validateLoginForm } from '../../utils/validation';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';

const LoginScreen = ({ navigation }) => {
  const { signIn, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle login
  const handleLogin = async () => {
    // Validate form
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    
    // Attempt sign in
    const result = await signIn(formData.email, formData.password);
    
    if (!result.success) {
      Alert.alert('Login Failed', result.error);
    }
    
    setIsSubmitting(false);
  };

  // Handle social login (placeholder for now)
  const handleGoogleLogin = () => {
    Alert.alert('Coming Soon', 'Google Sign-In will be available soon!');
  };

  const handleAppleLogin = () => {
    Alert.alert('Coming Soon', 'Apple Sign-In will be available soon!');
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
            {/* Logo/Title Section */}
            <View style={styles.header}>
              <Text style={styles.logo}>RepRight</Text>
              <Text style={styles.tagline}>
                Stay consistent, stay free 💪
              </Text>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Welcome Back</Text>
              <Text style={styles.formSubtitle}>
                Sign in to continue your fitness journey
              </Text>

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

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isSubmitting && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <ActivityIndicator color={colors.textWhite} />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login Buttons */}
              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleGoogleLogin}
                >
                  <Ionicons name="logo-google" size={24} color={colors.error} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleAppleLogin}
                >
                  <Ionicons name="logo-apple" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Sign Up Link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                  <Text style={styles.signupLink}>Sign Up</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.md,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.base,
    marginBottom: spacing.lg,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: spacing.borderRadius.md,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  signupLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
});

export default LoginScreen;