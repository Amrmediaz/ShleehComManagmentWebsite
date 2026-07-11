/**
 * SpecialPriceEntity
 * Domain model representing a special price range
 */

import {formatDateToDDMMYYYY} from "../utils/helper/Helpers.js";
export class SpecialPriceEntity {
    constructor(data = {}) {
        this.id = data.id || 0;
        this.type = data.type || 0;
        this.startDate = data.startDate || '';
        this.endDate = data.endDate || '';
        this.day = data.day || '';
        this.price = data.price || 0;
        this.flatID = data.flatID || 0; 
    }

    /**
     * Convert to API payload format
     */
    toApiPayload() {
        return {
            id: this.id,
            type: this.type,
            startDate: formatDateToDDMMYYYY( this.startDate),
            endDate: formatDateToDDMMYYYY(this.endDate),
            day: this.day,
            price: parseFloat(this.price),
            flatID: this.flatID,
        };
    }

    /**
     * Check if this is a new price (not saved yet)
     */
    isNew() {
        return this.id === 0 || this.id === null;
    }

    /**
     * Get human-readable date range
     */
    getDateRange() {
        return `${new Date(this.startDate).toLocaleDateString()} - ${new Date(this.endDate).toLocaleDateString()}`;
    }

    /**
     * Check if price is active (current date is within range)
     */
    isActive() {
        const now = new Date();
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        return now >= start && now <= end;
    }
}