/**
 * BookingDetailsEntity - ABSOLUTELY CORRECT ✅
 *
 * ✅ CORRECT UNDERSTANDING:
 *
 * coast: 170 = TOTAL COST (final total)
 * insurance: 30 = Part of the total
 * days_cost: 170 - 30 = 140 (remaining after insurance)
 *
 * Formula:
 * coast (total) = 170
 * insurance = 30 (part of 170)
 * days_cost = coast - insurance = 170 - 30 = 140
 *
 * BREAKDOWN:
 * - Days (2 × 70): 140 OMR
 * - Insurance: 30 OMR
 * - Total: 170 OMR
 * - Paid: 170 OMR
 * - Remaining: 0 OMR
 * - Payment %: 100% FULLY PAID ✓
 */

class BookingDetailsEntity {
    constructor(data = {}) {
        // Required fields
        this.id = data.id;
        this.name = data.name;
        this.phone = data.phone;

        // Additional info
        this.note = data.note || '';
        this.state = data.state || '';
        this.gouvernate = data.gouvernate || '';
        this.createdDate = data.crreatedDate || data.createdDate || '';
        this.flatID = data.flatID;
        this.customerId = data.customerId;

        // ✅ coast = TOTAL COST (final)
        this.coast = this._parseNumber(data.coast) || 0;

        // Number of days
        this.daysCount = this._parseNumber(data.noOFDays) || 0;

        // insurance = Insurance cost (part of coast)
        this.insurance = this._parseNumber(data.insuranceamount) || 0;

        // ✅ cost = Days cost (coast - insurance)
        // This is what displays in modal as "Cost"
        this.cost = this.coast - this.insurance;

        // Paid amount
        this.paidAmount = this._parsePaidAmount(data.paidamount) || 0;

        // Booked Days
        this.bookedDays = Array.isArray(data.hotelbuildingBookingDays)
            ? data.hotelbuildingBookingDays
            : [];

        console.log('[BookingDetailsEntity] ✅ CORRECT:', {
            id: this.id,
            customer: this.name,
            totalCoast: this.coast,
            insurance: this.insurance,
            cost: this.cost,
            daysCount: this.daysCount,
            costPerDay: this.getCostPerDay(),
            paidAmount: this.paidAmount,
            remainingAmount: this.getRemainingAmount(),
            paymentPercentage: this.getPaymentPercentage() + '%'
        });
    }

    /**
     * Parse number from string or number
     * @private
     */
    _parseNumber(value) {
        if (value === null || value === undefined || value === '') {
            return 0;
        }

        if (typeof value === 'number') {
            return value;
        }

        if (typeof value === 'string') {
            const cleaned = value.replace(/[^\d.]/g, '');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? 0 : parsed;
        }

        return 0;
    }

    /**
     * Parse paid amount from API format "170 من 0"
     * @private
     */
    _parsePaidAmount(value) {
        if (!value) {
            return 0;
        }

        if (typeof value === 'number') {
            return value;
        }

        if (typeof value === 'string') {
            const match = value.match(/\d+\.?\d*/);
            return match ? parseFloat(match[0]) : 0;
        }

        return 0;
    }

    /**
     * ✅ GET DAYS COST
     * Days Cost = coast - insurance
     * Example: 170 - 30 = 140
     * This is the same as this.cost property
     * @returns {number} Days cost only
     */
    getDaysCost() {
        return this.cost;
    }

    /**
     * ✅ GET COST PER DAY
     * Cost Per Day = Days Cost ÷ Days Count
     * Example: 140 ÷ 2 = 70
     * @returns {number} Cost per day
     */
    getCostPerDay() {
        if (this.daysCount === 0) return 0;
        return this.getDaysCost() / this.daysCount;
    }

    /**
     * ✅ GET TOTAL COST
     * Total Cost = coast (it's already the total)
     * @returns {number} Total cost
     */
    getTotalCost() {
        return this.coast;
    }

    /**
     * ✅ GET REMAINING AMOUNT
     * Remaining = coast - paid
     * @returns {number} Remaining to pay
     */
    getRemainingAmount() {
        return this.getTotalCost() - this.paidAmount;
    }

    /**
     * Check if fully paid
     * @returns {boolean}
     */
    isFullyPaid() {
        return this.getRemainingAmount() <= 0;
    }

    /**
     * ✅ GET PAYMENT PERCENTAGE
     * Percentage = (Paid ÷ Total) × 100
     * Example: (170 ÷ 170) × 100 = 100%
     * @returns {number} 0-100
     */
    getPaymentPercentage() {
        const total = this.getTotalCost();
        if (total === 0) return 0;
        return Math.round((this.paidAmount / total) * 100);
    }

    /**
     * Get payment status
     * @returns {string}
     */
    getPaymentStatus() {
        const remaining = this.getRemainingAmount();
        if (remaining <= 0) {
            return 'Fully Paid';
        }
        if (this.paidAmount === 0) {
            return 'Not Paid';
        }
        return 'Partially Paid';
    }

    // ========== FORMATTING METHODS ==========

    /**
     * Format days cost
     */
    formatDaysCost(currency = 'OMR') {
        return `${this.getDaysCost().toFixed(2)} ${currency}`;
    }

    /**
     * Format cost per day
     */
    formatCostPerDay(currency = 'OMR') {
        return `${this.getCostPerDay().toFixed(2)} ${currency}`;
    }

    /**
     * Format insurance
     */
    formatInsurance(currency = 'OMR') {
        return `${this.insurance.toFixed(2)} ${currency}`;
    }

    /**
     * Format total cost
     */
    formatTotalCost(currency = 'OMR') {
        return `${this.getTotalCost().toFixed(2)} ${currency}`;
    }

    /**
     * Format paid amount
     */
    formatPaidAmount(currency = 'OMR') {
        return `${this.paidAmount.toFixed(2)} ${currency}`;
    }

    /**
     * Format remaining amount
     */
    formatRemainingAmount(currency = 'OMR') {
        return `${this.getRemainingAmount().toFixed(2)} ${currency}`;
    }

    // ========== BREAKDOWN METHODS ==========

    /**
     * Get cost breakdown
     */
    getCostBreakdown() {
        return {
            daysCount: this.daysCount,
            costPerDay: this.getCostPerDay(),
            daysCost: this.getDaysCost(),
            insurance: this.insurance,
            totalCoast: this.getTotalCost(),
            paidAmount: this.paidAmount,
            remainingAmount: this.getRemainingAmount(),
            paymentPercentage: this.getPaymentPercentage(),
            isFullyPaid: this.isFullyPaid(),
            paymentStatus: this.getPaymentStatus()
        };
    }

    /**
     * Get formatted breakdown
     */
    getFormattedCostBreakdown(currency = 'OMR') {
        return {
            daysCount: this.daysCount,
            costPerDay: this.formatCostPerDay(currency),
            daysCost: this.formatDaysCost(currency),
            insurance: this.formatInsurance(currency),
            totalCoast: this.formatTotalCost(currency),
            paidAmount: this.formatPaidAmount(currency),
            remainingAmount: this.formatRemainingAmount(currency),
            paymentPercentage: `${this.getPaymentPercentage()}%`,
            paymentStatus: this.getPaymentStatus()
        };
    }

    // ========== BOOKED DAYS ==========

    /**
     * Get booked days
     */
    getBookedDays() {
        return this.bookedDays;
    }

    /**
     * Get booked days as string
     */
    getBookedDaysAsString() {
        return this.bookedDays
            .map(d => d.day || d)
            .join(', ');
    }

    /**
     * Get full days count
     */
    getFullDaysCount() {
        return this.bookedDays.filter(d => d.isFullDay).length;
    }

    // ========== SERIALIZATION ==========

    /**
     * Convert to plain object
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            phone: this.phone,
            daysCount: this.daysCount,
            cost: this.cost,
            costPerDay: this.getCostPerDay(),
            insurance: this.insurance,
            totalCoast: this.getTotalCost(),
            paidAmount: this.paidAmount,
            remainingAmount: this.getRemainingAmount(),
            paymentPercentage: this.getPaymentPercentage(),
            paymentStatus: this.getPaymentStatus(),
            isFullyPaid: this.isFullyPaid(),
            bookedDays: this.bookedDays,
            note: this.note,
            createdDate: this.createdDate,
            flatID: this.flatID,
            customerId: this.customerId
        };
    }

    // ========== VALIDATION ==========

    /**
     * Validate booking
     */
    validate() {
        const errors = [];

        if (!this.id) errors.push('Booking ID is required');
        if (!this.name) errors.push('Customer name is required');
        if (!this.phone) errors.push('Phone is required');
        if (this.coast < 0) errors.push('Coast cannot be negative');
        if (this.daysCount <= 0) errors.push('Days count must be greater than 0');

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // ========== COMPLETE DETAILS ==========

    /**
     * Get all details for modal display
     */
    getAllDetails() {
        return {
            // Customer info
            id: this.id,
            name: this.name,
            phone: this.phone,

            // Days info
            daysCount: this.daysCount,
            costPerDay: {
                raw: this.getCostPerDay(),
                formatted: this.formatCostPerDay()
            },

            // Cost breakdown
            cost: {
                raw: this.cost,
                formatted: this.formatDaysCost()
            },
            insurance: {
                raw: this.insurance,
                formatted: this.formatInsurance()
            },
            totalCost: {
                raw: this.getTotalCost(),
                formatted: this.formatTotalCost()
            },

            // Payment info
            paidAmount: {
                raw: this.paidAmount,
                formatted: this.formatPaidAmount()
            },
            remainingAmount: {
                raw: this.getRemainingAmount(),
                formatted: this.formatRemainingAmount()
            },
            paymentPercentage: this.getPaymentPercentage(),
            paymentStatus: this.getPaymentStatus(),
            isFullyPaid: this.isFullyPaid(),

            // Booked days
            bookedDays: this.bookedDays,
            bookedDaysCount: this.bookedDays.length,
            fullDaysCount: this.getFullDaysCount(),
            bookedDaysString: this.getBookedDaysAsString(),

            // Additional info
            note: this.note,
            createdDate: this.createdDate,
            flatID: this.flatID,
            customerId: this.customerId
        };
    }
}

export { BookingDetailsEntity };
export default BookingDetailsEntity;