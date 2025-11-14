// src/config/firebase.js
// Firebase configuration and initialization

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your Firebase project credentials
// Get these from: Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyDummy_Key_Replace_This",
  authDomain: "repright-app.firebaseapp.com",
  projectId: "repright-app",
  storageBucket: "repright-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore Database
export const db = getFirestore(app);

export default app;