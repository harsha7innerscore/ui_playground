import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";
import copy from "copy-to-clipboard";

/**
 * Format a date using moment.js
 * @param {string|Date} date - The date to format
 * @param {string} format - The format string (default: 'MMMM D, YYYY')
 * @returns {string} The formatted date string
 */
export function formatDate(date, format = "MMMM D, YYYY") {
  return moment(date).format(format);
}

/**
 * Generate a unique ID using UUID
 * @returns {string} A unique UUID
 */
export function generateUniqueId() {
  return uuidv4();
}

/**
 * Encrypt sensitive data
 * @param {string} data - The data to encrypt
 * @param {string} secretKey - The secret key for encryption
 * @returns {string} The encrypted data
 */
export function encryptData(data, secretKey) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
}

/**
 * Decrypt encrypted data
 * @param {string} encryptedData - The encrypted data
 * @param {string} secretKey - The secret key for decryption
 * @returns {any} The decrypted data
 */
export function decryptData(encryptedData, secretKey) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

/**
 * Copy text to clipboard
 * @param {string} text - The text to copy
 * @returns {boolean} True if successful, false otherwise
 */
export function copyToClipboard(text) {
  return copy(text);
}

/**
 * Truncate text to a specific length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - The maximum length
 * @returns {string} The truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Debounce function to limit the rate at which a function can fire
 * @param {Function} func - The function to debounce
 * @param {number} wait - The time to wait in milliseconds
 * @returns {Function} The debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}