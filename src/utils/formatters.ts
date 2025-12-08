/**
 * Formatters utility functions
 */

/**
 * Formats a string to title case
 * @param str - The string to format
 * @returns The formatted string in title case
 */
export const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

/**
 * Formats a date to a human-readable string
 * @param date - The date to format (Date object or timestamp)
 * @param options - Date formatting options
 * @returns The formatted date string
 */
export const formatDate = (
  date: Date | number | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  return dateObj.toLocaleDateString(undefined, options);
};

/**
 * Formats a number with commas as thousands separators
 * @param num - The number to format
 * @returns The formatted number string
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Formats a file size to a human-readable string
 * @param bytes - The file size in bytes
 * @returns The formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Truncates a string to a specified length and adds ellipsis if needed
 * @param str - The string to truncate
 * @param maxLength - The maximum length before truncation
 * @returns The truncated string
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

/**
 * Formats a price with commas as thousands separators and adds currency symbol
 * @param price - The price to format
 * @param currency - The currency symbol to use (default: $)
 * @returns The formatted price string
 */
export const formatPrice = (price: number, currency: string = '$'): string => {
  return `${currency}${formatNumber(price)}`;
};