// src/utils/validation.js
// Form validation utility functions

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} - {isValid: boolean, error: string}
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - {isValid: boolean, error: string}
 */
export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }

  // Optional: Add more strict requirements
  // if (!/[A-Z]/.test(password)) {
  //   return { isValid: false, error: 'Password must contain an uppercase letter' };
  // }
  // if (!/[a-z]/.test(password)) {
  //   return { isValid: false, error: 'Password must contain a lowercase letter' };
  // }
  // if (!/[0-9]/.test(password)) {
  //   return { isValid: false, error: 'Password must contain a number' };
  // }

  return { isValid: true, error: '' };
};

/**
 * Validate name
 * @param {string} name - Name to validate
 * @returns {Object} - {isValid: boolean, error: string}
 */
export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate passwords match
 * @param {string} password - Password
 * @param {string} confirmPassword - Confirm password
 * @returns {Object} - {isValid: boolean, error: string}
 */
export const validatePasswordsMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate number input
 * @param {string|number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Name of field for error message
 * @returns {Object} - {isValid: boolean, error: string}
 */
export const validateNumber = (value, min = 0, max = Infinity, fieldName = 'Value') => {
  const num = Number(value);

  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }

  if (num < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (num > max) {
    return { isValid: false, error: `${fieldName} must be at most ${max}` };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of field for error message
 * @returns {Object} - {isValid: boolean, error: string}
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate registration form
 * @param {Object} formData - {name, email, password, confirmPassword}
 * @returns {Object} - {isValid: boolean, errors: Object}
 */
export const validateRegistrationForm = (formData) => {
  const { name, email, password, confirmPassword } = formData;
  const errors = {};

  const nameValidation = validateName(name);
  if (!nameValidation.isValid) errors.name = nameValidation.error;

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) errors.email = emailValidation.error;

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) errors.password = passwordValidation.error;

  if (confirmPassword !== undefined) {
    const matchValidation = validatePasswordsMatch(password, confirmPassword);
    if (!matchValidation.isValid) errors.confirmPassword = matchValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate login form
 * @param {Object} formData - {email, password}
 * @returns {Object} - {isValid: boolean, errors: Object}
 */
export const validateLoginForm = (formData) => {
  const { email, password } = formData;
  const errors = {};

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) errors.email = emailValidation.error;

  const passwordValidation = validateRequired(password, 'Password');
  if (!passwordValidation.isValid) errors.password = passwordValidation.error;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateEmail,
  validatePassword,
  validateName,
  validatePasswordsMatch,
  validateNumber,
  validateRequired,
  validateRegistrationForm,
  validateLoginForm,
};