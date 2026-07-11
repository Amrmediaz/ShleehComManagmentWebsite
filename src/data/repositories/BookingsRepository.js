import { buildingApiClient } from '../buildingApiClient.js';
import { BookingEntity } from '../../core/entities/BookingEntity.js';

/**
 * BookingsRepository
 * Handles all booking data operations
 */
export const BookingsRepository = {
    /**
     * Fetch all bookings for a flat
     */
    async getAll(flatId, page = 1, pageSize = 100) {
        if (!flatId) {
            throw new Error('Flat ID is required');
        }

        try {
            console.log('[BookingsRepository] Fetching bookings for flatId:', flatId, 'page:', page);

            const result = await buildingApiClient.getBookings(flatId, page, pageSize);

            // Handle API response structure
            if (result?.message?.results && Array.isArray(result.message.results)) {
                const bookings = result.message.results.map(
                    bookingData => new BookingEntity(bookingData)
                );

                console.log('[BookingsRepository] Fetched bookings:', bookings);

                return {
                    bookings,
                    currentPage: result.message.currentPage,
                    pageCount: result.message.pageCount,
                    pageSize: result.message.pageSize,
                    rowCount: result.message.rowCount,
                };
            }

            throw new Error('Invalid API response format');
        } catch (error) {
            console.error('[BookingsRepository] getAll error:', error);
            throw error;
        }
    },

    /**
     * Get all booked dates for a flat
     */
    async getAllBookedDates(flatId) {
        try {
            const response = await this.getAll(flatId);
            const bookedDates = [];

            response.bookings.forEach(booking => {
                booking.hotelbuildingBookingDays.forEach(dayData => {
                    bookedDates.push({
                        date: dayData.day,
                        isFullDay: dayData.isFullDay,
                        bookingId: booking.id,
                        guestName: booking.name,
                        status: booking.bookingstatus,
                    });
                });
            });

            console.log('[BookingsRepository] All booked dates:', bookedDates);
            return bookedDates;
        } catch (error) {
            console.error('[BookingsRepository] getAllBookedDates error:', error);
            throw error;
        }
    },

    /**
     * Get bookings for a specific date range
     */
    async getBookingsInRange(flatId, startDate, endDate) {
        try {
            const response = await this.getAll(flatId);
            const filteredBookings = response.bookings.filter(booking => {
                return booking.hotelbuildingBookingDays.some(day => {
                    const date = new Date(day.day);
                    return date >= new Date(startDate) && date <= new Date(endDate);
                });
            });

            return filteredBookings;
        } catch (error) {
            console.error('[BookingsRepository] getBookingsInRange error:', error);
            throw error;
        }
    },

    /**
     * Get bookings by status
     */
    async getByStatus(flatId, status) {
        try {
            const response = await this.getAll(flatId);
            const filtered = response.bookings.filter(b => b.bookingstatus === status);
            return filtered;
        } catch (error) {
            console.error('[BookingsRepository] getByStatus error:', error);
            throw error;
        }
    },

    /**
     * Get confirmed bookings only
     */
    async getConfirmedBookings(flatId) {
        return this.getByStatus(flatId, 1);
    },

    /**
     * Get pending bookings only
     */
    async getPendingBookings(flatId) {
        return this.getByStatus(flatId, 0);
    },
};