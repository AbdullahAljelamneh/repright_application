// src/utils/storage.js
// AsyncStorage helper functions

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Save data to AsyncStorage
 * @param {string} key - Storage key
 * @param {any} value - Data to store (will be JSON stringified)
 * @returns {Promise<boolean>} - Success status
 */
export const saveData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error(`Error saving data for key "${key}":`, error);
    return false;
  }
};

/**
 * Get data from AsyncStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {Promise<any>} - Retrieved data or default value
 */
export const getData = async (key, defaultValue = null) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
  } catch (error) {
    console.error(`Error getting data for key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Remove data from AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} - Success status
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing data for key "${key}":`, error);
    return false;
  }
};

/**
 * Clear all data from AsyncStorage
 * @returns {Promise<boolean>} - Success status
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};

/**
 * Get multiple values from AsyncStorage
 * @param {string[]} keys - Array of storage keys
 * @returns {Promise<Object>} - Object with key-value pairs
 */
export const getMultipleData = async (keys) => {
  try {
    const values = await AsyncStorage.multiGet(keys);
    const result = {};
    values.forEach(([key, value]) => {
      result[key] = value != null ? JSON.parse(value) : null;
    });
    return result;
  } catch (error) {
    console.error('Error getting multiple data:', error);
    return {};
  }
};

/**
 * Save multiple values to AsyncStorage
 * @param {Object} keyValuePairs - Object with key-value pairs
 * @returns {Promise<boolean>} - Success status
 */
export const saveMultipleData = async (keyValuePairs) => {
  try {
    const pairs = Object.entries(keyValuePairs).map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]);
    await AsyncStorage.multiSet(pairs);
    return true;
  } catch (error) {
    console.error('Error saving multiple data:', error);
    return false;
  }
};

export default {
  saveData,
  getData,
  removeData,
  clearAllData,
  getMultipleData,
  saveMultipleData,
};