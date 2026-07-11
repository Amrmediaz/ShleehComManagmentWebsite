/**
 * BlockedDaysEntity
 * Domain model representing blocked days for a flat
 */
export class BlockedDaysEntity {
    constructor(data = {}) {
        this.flatId = data.flatId || 0;
        this.buildingId = data.buildingId || 0;
        this.days = Array.isArray(data.days) ? data.days : [];
    }

    /**
     * Check if a specific date is blocked
     */
    isDateBlocked(dateString) {
        return this.days.includes(dateString);
    }

    /**
     * Add a day to blocked days
     */
    addDay(dateString) {
        if (!this.days.includes(dateString)) {
            this.days.push(dateString);
        }
    }

    /**
     * Remove a day from blocked days
     */
    removeDay(dateString) {
        this.days = this.days.filter(d => d !== dateString);
    }

    /**
     * Get all blocked dates sorted
     */
    getSortedDays() {
        return this.days.sort();
    }

    /**
     * Get blocked dates for a date range
     */
    getDaysInRange(startDate, endDate) {
        return this.days.filter(d => d >= startDate && d <= endDate);
    }

    /**
     * Convert to API payload
     */
    toApiPayload() {
        return {
            buildingID: this.buildingId,
            days: this.days,
        };
    }
}