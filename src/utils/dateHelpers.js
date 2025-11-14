// src/utils/dateHelpers.js
// Date and time utility functions

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string (e.g., "Nov 14, 2025")
 */
export const formatDate = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Format time to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted time string (e.g., "2:30 PM")
 */
export const formatTime = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const options = { hour: 'numeric', minute: '2-digit', hour12: true };
  return dateObj.toLocaleTimeString('en-US', options);
};

/**
 * Format date and time together
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted datetime string
 */
export const formatDateTime = (date) => {
  return `${formatDate(date)} at ${formatTime(date)}`;
};

/**
 * Get start of day (midnight)
 * @param {Date} date - Date object
 * @returns {Date} - Date set to 00:00:00
 */
export const getStartOfDay = (date = new Date()) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

/**
 * Get end of day (23:59:59)
 * @param {Date} date - Date object
 * @returns {Date} - Date set to 23:59:59
 */
export const getEndOfDay = (date = new Date()) => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
};

/**
 * Check if two dates are on the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} - True if same day
 */
export const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if today
 */
export const isToday = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return isSameDay(dateObj, today);
};

/**
 * Get days between two dates
 * @param {Date} date1 - Start date
 * @param {Date} date2 - End date
 * @returns {number} - Number of days between dates
 */
export const getDaysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  const diffInMs = Math.abs(date2 - date1);
  return Math.floor(diffInMs / oneDay);
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date|string} date - Date to compare
 * @returns {string} - Relative time string
 */
export const getRelativeTime = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now - dateObj;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  return formatDate(dateObj);
};

/**
 * Get current date in ISO format
 * @returns {string} - ISO date string
 */
export const getCurrentDateISO = () => {
  return new Date().toISOString();
};

/**
 * Check if should reset daily data (past midnight)
 * @param {string} lastActiveDate - Last active date ISO string
 * @returns {boolean} - True if should reset
 */
export const shouldResetDaily = (lastActiveDate) => {
  if (!lastActiveDate) return false;
  
  const lastActive = new Date(lastActiveDate);
  const today = new Date();
  
  return !isSameDay(lastActive, today);
};

export default {
  formatDate,
  formatTime,
  formatDateTime,
  getStartOfDay,
  getEndOfDay,
  isSameDay,
  isToday,
  getDaysBetween,
  getRelativeTime,
  getCurrentDateISO,
  shouldResetDaily,
};