const moment = require('moment-timezone');

/**
 * Timezone utilities for order date calculation
 */

/**
 * Get the current date in YYYY-MM-DD format for a specific timezone
 * @param {string} timezone - IANA timezone string (e.g., 'Europe/Berlin', 'America/New_York')
 * @returns {string} Date in YYYY-MM-DD format
 */
const getOrderDate = (timezone) => {
    if (!timezone || !moment.tz.zone(timezone)) {
        // Fallback to UTC if timezone is invalid or not provided
        console.warn(`Invalid timezone: ${timezone}, falling back to UTC`);
        return moment.utc().format('YYYY-MM-DD');
    }

    return moment.tz(timezone).format('YYYY-MM-DD');
};

/**
 * Extract timezone from request header
 * @param {object} req - Express request object
 * @returns {string} Timezone string or null
 */
const getTimezoneFromRequest = (req) => {
    const timezone = req.headers['x-timezone'];

    if (!timezone) {
        return null;
    }

    // Validate timezone
    if (!moment.tz.zone(timezone)) {
        return null;
    }

    return timezone;
};

/**
 * Get timezone with fallback to UTC
 * @param {object} req - Express request object
 * @returns {string} Valid timezone string
 */
const getTimezoneOrDefault = (req) => {
    const timezone = getTimezoneFromRequest(req);
    return timezone || 'UTC';
};

/**
 * Validate if a timezone is valid
 * @param {string} timezone - Timezone to validate
 * @returns {boolean}
 */
const isValidTimezone = (timezone) => {
    return Boolean(timezone && moment.tz.zone(timezone));
};

module.exports = {
    getOrderDate,
    getTimezoneFromRequest,
    getTimezoneOrDefault,
    isValidTimezone
};
