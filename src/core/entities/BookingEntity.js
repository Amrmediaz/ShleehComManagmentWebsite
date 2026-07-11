/**
 * BookingEntity
 * Domain model representing a booking
 */
export class BookingEntity {
    constructor(data = {}) {
        this.id = data.id || 0;
        this.name = data.name || '';
        this.phone = data.phone || '';
        this.state = data.state || '';
        this.gouvernate = data.gouvernate || '';
        this.coast = data.coast || 0;
        this.noOFDays = data.noOFDays || 0;
        this.note = data.note || '';
        this.crreatedDate = data.crreatedDate || new Date().toISOString();
        this.bookingstatus = data.bookingstatus || 0;
        this.hotelbuildingBookingDays = data.hotelbuildingBookingDays || [];
        this.flatID = data.flatID || 0;
        this.customerId = data.customerId || 0;
    }

    /**
     * Get all booked dates from hotelbuildingBookingDays
     */
    getBookedDates() {
        return this.hotelbuildingBookingDays.map(day => day.day);
    }

    /**
     * Check if a specific date is booked
     */
    isDateBooked(dateString) {
        return this.hotelbuildingBookingDays.some(day => day.day === dateString);
    }

    /**
     * Get booking status label
     */
    getStatusLabel() {
        const statuses = {
            0: 'Pending',
            1: 'Confirmed',
            2: 'Cancelled',
            3: 'Completed'
        };
        return statuses[this.bookingstatus] || 'Unknown';
    }

    /**
     * Get booking date range
     */
    getDateRange() {
        if (this.hotelbuildingBookingDays.length === 0) return '';
        const dates = this.hotelbuildingBookingDays.map(d => d.day).sort();
        const start = new Date(dates[0]).toLocaleDateString();
        const end = new Date(dates[dates.length - 1]).toLocaleDateString();
        return `${start} - ${end}`;
    }

    /**
     * Convert to API payload
     */
    toApiPayload() {
        return {
            id: this.id,
            name: this.name,
            phone: this.phone,
            state: this.state,
            gouvernate: this.gouvernate,
            coast: this.coast,
            noOFDays: this.noOFDays,
            note: this.note,
            crreatedDate: this.crreatedDate,
            bookingstatus: this.bookingstatus,
            hotelbuildingBookingDays: this.hotelbuildingBookingDays,
            flatID: this.flatID,
            customerId: this.customerId,
        };
    }
}