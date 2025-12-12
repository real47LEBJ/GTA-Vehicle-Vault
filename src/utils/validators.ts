/**
 * Validators utility functions
 */

/**
 * Checks if a string is empty
 * @param str - The string to check
 * @returns True if the string is empty, false otherwise
 */
export const isEmpty = (str: string): boolean => {
  return str.trim() === '';
};

/**
 * Validates an email address format
 * @param email - The email address to validate
 * @returns True if the email format is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a phone number format (basic international format)
 * @param phone - The phone number to validate
 * @returns True if the phone format is valid, false otherwise
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates a password based on specified criteria
 * @param password - The password to validate
 * @param options - Password validation options
 * @returns True if the password meets the criteria, false otherwise
 */
export const isValidPassword = (
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecialChar?: boolean;
  } = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: false,
  }
): boolean => {
  const { minLength, requireUppercase, requireLowercase, requireNumber, requireSpecialChar } =
    options;

  if (password.length < (minLength ?? 8)) return false;
  if (requireUppercase && !/[A-Z]/.test(password)) return false;
  if (requireLowercase && !/[a-z]/.test(password)) return false;
  if (requireNumber && !/[0-9]/.test(password)) return false;
  if (requireSpecialChar && !/[^A-Za-z0-9]/.test(password)) return false;

  return true;
};

/**
 * Validates a URL format
 * @param url - The URL to validate
 * @returns True if the URL format is valid, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates that a value is within a specified range
 * @param value - The number to validate
 * @param min - The minimum allowed value
 * @param max - The maximum allowed value
 * @returns True if the value is within range, false otherwise
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};
