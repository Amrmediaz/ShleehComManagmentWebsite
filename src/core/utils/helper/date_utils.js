/**
 * dateUtils.js
 * Utility functions for handling date conversions
 * API Format: DD/MM/YYYY (e.g., "11/08/2026")
 * App Format: YYYY-MM-DD (e.g., "2026-08-11")
 */

/**
 * Convert from API format (DD/MM/YYYY) to app format (YYYY-MM-DD)
 * @param {string} dateString - Date in DD/MM/YYYY format
 * @returns {string} Date in YYYY-MM-DD format
 */
export function convertFromApiDate(dateString) {
    if (!dateString) return '';

    try {
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            // Validate numbers
            const d = parseInt(day, 10);
            const m = parseInt(month, 10);
            const y = parseInt(year, 10);

            if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 0) {
                return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            }
        }
    } catch (error) {
        console.error('[dateUtils.convertFromApiDate] Error:', error);
    }

    return '';
}

/**
 * Convert from app format (YYYY-MM-DD) to API format (DD/MM/YYYY)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Date in DD/MM/YYYY format
 */
export function convertToApiDate(dateString) {
    if (!dateString) return '';

    try {
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts;
            // Validate numbers
            const y = parseInt(year, 10);
            const m = parseInt(month, 10);
            const d = parseInt(day, 10);

            if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 0) {
                return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
            }
        }
    } catch (error) {
        console.error('[dateUtils.convertToApiDate] Error:', error);
    }

    return '';
}

/**
 * Convert API date (DD/MM/YYYY) to display format (locale-specific)
 * @param {string} dateString - Date in DD/MM/YYYY format
 * @param {string} locale - Locale string (default: en-US)
 * @returns {string} Formatted date string
 */
export function convertApiDateToDisplay(dateString, locale = 'en-US') {
    if (!dateString) return '';

    try {
        const appFormat = convertFromApiDate(dateString);
        if (!appFormat) return dateString;

        const date = new Date(appFormat + 'T00:00:00');
        if (isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('[dateUtils.convertApiDateToDisplay] Error:', error);
        return dateString;
    }
}

/**
 * Parse API date string safely
 * @param {string} dateString - Date in DD/MM/YYYY format
 * @returns {Date|null} JavaScript Date object or null if invalid
 */
export function parseApiDate(dateString) {
    if (!dateString) return null;

    try {
        const appFormat = convertFromApiDate(dateString);
        if (!appFormat) return null;

        const date = new Date(appFormat + 'T00:00:00');
        if (isNaN(date.getTime())) {
            return null;
        }

        return date;
    } catch (error) {
        console.error('[dateUtils.parseApiDate] Error:', error);
        return null;
    }
}

/**
 * Format date from app format to display
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {string} locale - Locale string (default: en-US)
 * @returns {string} Formatted date string
 */
export function formatAppDate(dateString, locale = 'en-US') {
    if (!dateString) return '';

    try {
        const date = new Date(dateString + 'T00:00:00');
        if (isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('[dateUtils.formatAppDate] Error:', error);
        return dateString;
    }
}

/**
 * Validate date string in DD/MM/YYYY format
 * @param {string} dateString - Date to validate
 * @returns {boolean} True if valid
 */
export function isValidApiDate(dateString) {
    if (!dateString) return false;

    try {
        const parts = dateString.split('/');
        if (parts.length !== 3) return false;

        const [day, month, year] = parts.map(p => parseInt(p, 10));

        // Check ranges
        if (day < 1 || day > 31) return false;
        if (month < 1 || month > 12) return false;
        if (year < 1900 || year > 2100) return false;

        // Check if date is valid
        const date = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`);
        return !isNaN(date.getTime());
    } catch (error) {
        return false;
    }
}

/**
 * Validate date string in YYYY-MM-DD format
 * @param {string} dateString - Date to validate
 * @returns {boolean} True if valid
 */
export function isValidAppDate(dateString) {
    if (!dateString) return false;

    try {
        const parts = dateString.split('-');
        if (parts.length !== 3) return false;

        const [year, month, day] = parts.map(p => parseInt(p, 10));

        // Check ranges
        if (day < 1 || day > 31) return false;
        if (month < 1 || month > 12) return false;
        if (year < 1900 || year > 2100) return false;

        // Check if date is valid
        const date = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`);
        return !isNaN(date.getTime());
    } catch (error) {
        return false;
    }
}

export default {
    convertFromApiDate,
    convertToApiDate,
    convertApiDateToDisplay,
    parseApiDate,
    formatAppDate,
    isValidApiDate,
    isValidAppDate,
};