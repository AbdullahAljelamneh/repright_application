// src/auth/AuthContext.js
// Authentication Context with Firebase

import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { saveData, getData, removeData } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';

// Create Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = await getUserData(firebaseUser.uid);
        const completeUserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          ...userData,
        };
        setUser(completeUserData);
        await saveData(STORAGE_KEYS.USER_DATA, completeUserData);
      } else {
        // User is signed out
        setUser(null);
        await removeData(STORAGE_KEYS.USER_DATA);
      }
      setLoading(false);
      setInitializing(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  // Get user data from Firestore
  const getUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return {};
    } catch (error) {
      console.error('Error getting user data:', error);
      return {};
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, name) => {
    try {
      setLoading(true);
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const { user: firebaseUser } = userCredential;

      // Update profile with name
      await updateProfile(firebaseUser, {
        displayName: name,
      });

      // Create user document in Firestore
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: name,
        displayName: name,
        createdAt: new Date().toISOString(),
        onboardingCompleted: false,
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: getErrorMessage(error.code) };
    } finally {
      setLoading(false);
    }
  };

 // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      
      // TEST ACCOUNT - Remove this in production
      if (email === 'test@repright.com' && password === 'test123') {
        const testUser = {
          uid: 'test-user-123',
          email: 'test@repright.com',
          displayName: 'Test User',
          name: 'Test User',
          photoURL: null,
          createdAt: new Date().toISOString(),
          onboardingCompleted: true,
        };
        setUser(testUser);
        await saveData(STORAGE_KEYS.USER_DATA, testUser);
        return { success: true, user: testUser };
      }
      
      // Regular Firebase sign in
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: getErrorMessage(error.code) };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      // Clear all local data
      await removeData(STORAGE_KEYS.USER_DATA);
      await removeData(STORAGE_KEYS.MEALS);
      await removeData(STORAGE_KEYS.CALORIES);
      await removeData(STORAGE_KEYS.STREAK);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };

      // Update Firestore
      await setDoc(doc(db, 'users', user.uid), updates, { merge: true });

      // Update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await saveData(STORAGE_KEYS.USER_DATA, updatedUser);

      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  // Convert Firebase error codes to user-friendly messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection';
      default:
        return 'An error occurred. Please try again';
    }
  };

  const value = {
    user,
    loading,
    initializing,
    signUp,
    signIn,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;