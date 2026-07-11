/**
 * GetBookingDetailsRepository
 *
 * Data Layer: Repository
 * Responsibility: Handle booking details data operations
 *
 * Handles:
 * - Fetching single booking details via API
 * - Response transformation to entities
 * - Error handling and logging
 *
 * Matches the pattern from BookingsRepository
 */

import buildingApiClient from '../buildingApiClient.js';
import { BookingDetailsEntity } from '../../core/entities/BookingDetailsEntity.js';

/**
 * GetBookingDetailsRepository
 * Singleton object containing booking details operations
 */
export const GetBookingDetailsRepository = {
    /**
     * Fetch booking details by ID
     *
     * @param {number} bookingId - The booking ID to fetch
     * @returns {Promise<BookingDetailsEntity>} Transformed booking details entity
     *
     * @throws {Error} If booking ID is missing or API call fails
     *
     * @example
     * const booking = await GetBookingDetailsRepository.getById(123);
     * console.log(booking.id, booking.name, booking.cost);
     */
    async getById(bookingId) {
        if (!bookingId) {
            throw new Error('Booking ID is required');
        }

        try {
            console.log('[GetBookingDetailsRepository] Fetching booking details for ID:', bookingId);

            // Call API to get booking details
            // GET /api/FlatsCustomer/GetBookingDetailes?bookingID={bookingId}
            const result = await buildingApiClient.getBookingDetails(bookingId);

            // Validate API response structure
            if (!result?.message) {
                throw new Error('Invalid API response - missing message field');
            }

            // Transform API response to entity
            const bookingEntity = new BookingDetailsEntity(result.message);

            console.log('[GetBookingDetailsRepository] ✅ Booking details fetched and transformed:', {
                id: bookingEntity.id,
                name: bookingEntity.name,
                cost: bookingEntity.cost,
            });

            return bookingEntity;

        } catch (error) {
            console.error('[GetBookingDetailsRepository] getById error:', error);
            throw error;
        }
    },

    /**
     * Get multiple bookings details by flat ID (paginated)
     *
     * @param {number} flatId - The flat ID to get bookings for
     * @param {number} page - Page number (default: 1)
     * @param {number} pageSize - Items per page (default: 100)
     * @returns {Promise<Object>} Object with bookings array and pagination info
     *
     * @throws {Error} If flat ID is missing or API call fails
     *
     * @example
     * const result = await GetBookingDetailsRepository.getByFlatId(18, 1, 10);
     * console.log(result.bookings, result.pageCount);
     */
    async getByFlatId(flatId, page = 1, pageSize = 100) {
        if (!flatId) {
            throw new Error('Flat ID is required');
        }

        try {
            console.log('[GetBookingDetailsRepository] Fetching bookings for flatId:', flatId, 'page:', page, 'pageSize:', pageSize);

            // Call API to get bookings list
            // POST /api/Owners/GetHotelOwnerBookingListByFlat
            const result = await buildingApiClient.getBookings(flatId, page, pageSize);

            // Validate and transform response
            if (result?.message?.results && Array.isArray(result.message.results)) {
                const bookings = result.message.results.map(
                    bookingData => new BookingDetailsEntity(bookingData)
                );

                console.log('[GetBookingDetailsRepository] ✅ Fetched', bookings.length, 'booking details');

                return {
                    bookings,
                    currentPage: result.message.currentPage,
                    pageCount: result.message.pageCount,
                    pageSize: result.message.pageSize,
                    rowCount: result.message.rowCount,
                };
            }

            // If no results, return empty structure
            console.warn('[GetBookingDetailsRepository] ⚠️ No results in API response');
            return {
                bookings: [],
                currentPage: page,
                pageCount: 0,
                pageSize: pageSize,
                rowCount: 0,
            };

        } catch (error) {
            console.error('[GetBookingDetailsRepository] getByFlatId error:', error);
            throw error;
        }
    },

    /**
     * Get all booked dates for a flat from booking details
     *
     * Extracts all dates from all bookings for a flat
     *
     * @param {number} flatId - The flat ID
     * @returns {Promise<Array>} Array of booked date objects
     *
     * @example
     * const dates = await GetBookingDetailsRepository.getAllBookedDates(18);
     * dates.forEach(d => console.log(d.date, d.isFullDay, d.guestName));
     */
    async getAllBookedDates(flatId) {
        try {
            console.log('[GetBookingDetailsRepository] Getting all booked dates for flatId:', flatId);

            const response = await this.getByFlatId(flatId, 1, 1000); // Get large page size to get all
            const bookedDates = [];

            response.bookings.forEach(booking => {
                if (booking.bookedDays && Array.isArray(booking.bookedDays)) {
                    booking.bookedDays.forEach(dayData => {
                        bookedDates.push({
                            date: dayData.day,
                            isFullDay: dayData.isFullDay,
                            bookingId: booking.id,
                            guestName: booking.name,
                            status: booking.status || booking.bookingstatus,
                            cost: booking.cost,
                        });
                    });
                }
            });

            console.log('[GetBookingDetailsRepository] ✅ Retrieved', bookedDates.length, 'booked dates');
            return bookedDates;

        } catch (error) {
            console.error('[GetBookingDetailsRepository] getAllBookedDates error:', error);
            throw error;
        }
    },

    /**
     * Get booking details for a specific date range
     *
     * @param {number} flatId - The flat ID
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     * @returns {Promise<Array<BookingDetailsEntity>>} Filtered booking details
     *
     * @example
     * const bookings = await GetBookingDetailsRepository.getDetailsInRange(18, '2024-01-01', '2024-01-31');
     */
    async getDetailsInRange(flatId, startDate, endDate) {
        try {
            console.log('[GetBookingDetailsRepository] Getting bookings in range:', startDate, 'to', endDate);

            const response = await this.getByFlatId(flatId, 1, 1000); // Get all bookings
            const filteredBookings = response.bookings.filter(booking => {
                return booking.bookedDays && booking.bookedDays.some(day => {
                    const date = new Date(day.day);
                    return date >= new Date(startDate) && date <= new Date(endDate);
                });
            });

            console.log('[GetBookingDetailsRepository] ✅ Found', filteredBookings.length, 'bookings in range');
            return filteredBookings;

        } catch (error) {
            console.error('[GetBookingDetailsRepository] getDetailsInRange error:', error);
            throw error;
        }
    },

    /**
     * Get booking details by payment status
     *
     * @param {number} flatId - The flat ID
     * @param {boolean} fullyPaid - Filter by payment status (true = fully paid)
     * @returns {Promise<Array<BookingDetailsEntity>>} Filtered bookings
     *
     * @example
     * const unpaid = await GetBookingDetailsRepository.getByPaymentStatus(18, false);
     * const paid = await GetBookingDetailsRepository.getByPaymentStatus(18, true);
     */
    async getByPaymentStatus(flatId, fullyPaid) {
        try {
            console.log('[GetBookingDetailsRepository] Getting bookings by payment status:', fullyPaid);

            const response = await this.getByFlatId(flatId, 1, 1000); // Get all bookings
            const filtered = response.bookings.filter(booking => {
                return booking.isFullyPaid() === fullyPaid;
            });

            console.log('[GetBookingDetailsRepository] ✅ Found', filtered.length, 'bookings with payment status:', fullyPaid);
            return filtered;

        } catch (error) {
            console.error('[GetBookingDetailsRepository] getByPaymentStatus error:', error);
            throw error;
        }
    },

    /**
     * Get fully paid bookings only
     *
     * @param {number} flatId - The flat ID
     * @returns {Promise<Array<BookingDetailsEntity>>} Fully paid bookings
     *
     * @example
     * const paid = await GetBookingDetailsRepository.getFullyPaidBookings(18);
     */
    async getFullyPaidBookings(flatId) {
        return this.getByPaymentStatus(flatId, true);
    },

    /**
     * Get unpaid or partially paid bookings
     *
     * @param {number} flatId - The flat ID
     * @returns {Promise<Array<BookingDetailsEntity>>} Unpaid bookings
     *
     * @example
     * const unpaid = await GetBookingDetailsRepository.getUnpaidBookings(18);
     */
    async getUnpaidBookings(flatId) {
        return this.getByPaymentStatus(flatId, false);
    },

    /**
     * Get total revenue from all bookings
     *
     * @param {number} flatId - The flat ID
     * @returns {Promise<Object>} Object with revenue statistics
     *
     * @example
     * const revenue = await GetBookingDetailsRepository.getTotalRevenue(18);
     * console.log(revenue.totalCost, revenue.totalPaid, revenue.totalRemaining);
     */
    async getTotalRevenue(flatId) {
        try {
            console.log('[GetBookingDetailsRepository] Calculating total revenue for flatId:', flatId);

            const response = await this.getByFlatId(flatId, 1, 1000); // Get all bookings
            let totalCost = 0;
            let totalPaid = 0;
            let totalRemaining = 0;

            response.bookings.forEach(booking => {
                totalCost += booking.getTotalCost();
                totalPaid += booking.paidAmount;
                totalRemaining += booking.getRemainingAmount();
            });

            const result = {
                totalCost,
                totalPaid,
                totalRemaining,
                bookingCount: response.bookings.length,
                averageBookingValue: response.bookings.length > 0 ? totalCost / response.bookings.length : 0,
                paymentPercentage: totalCost > 0 ? Math.round((totalPaid / totalCost) * 100) : 0,
            };

            console.log('[GetBookingDetailsRepository] ✅ Revenue calculated:', result);
            return result;

        } catch (error) {
            console.error('[GetBookingDetailsRepository] getTotalRevenue error:', error);
            throw error;
        }
    },

    /**
     * Get booking statistics
     *
     * @param {number} flatId - The flat ID
     * @returns {Promise<Object>} Statistics object
     *
     * @example
     * const stats = await GetBookingDetailsRepository.getStatistics(18);
     * console.log(stats.totalBookings, stats.fullyPaidCount, stats.unpaidCount);
     */
    async getStatistics(flatId) {
        try {
            console.log('[GetBookingDetailsRepository] Getting statistics for flatId:', flatId);

            const response = await this.getByFlatId(flatId, 1, 1000); // Get all bookings
            const revenue = await this.getTotalRevenue(flatId);

            const fullyPaid = response.bookings.filter(b => b.isFullyPaid()).length;
            const unpaid = response.bookings.length - fullyPaid;

            const stats = {
                totalBookings: response.bookings.length,
                fullyPaidCount: fullyPaid,
                unpaidCount: unpaid,
                fullyPaidPercentage: response.bookings.length > 0 ? Math.round((fullyPaid / response.bookings.length) * 100) : 0,
                totalDays: response.bookings.reduce((sum, b) => sum + b.daysCount, 0),
                revenue: revenue,
                averageDaysPerBooking: response.bookings.length > 0
                    ? (response.bookings.reduce((sum, b) => sum + b.daysCount, 0) / response.bookings.length).toFixed(1)
                    : 0,
            };

            console.log('[GetBookingDetailsRepository] ✅ Statistics calculated:', stats);
            return stats;

        } catch (error) {
            console.error('[GetBookingDetailsRepository] getStatistics error:', error);
            throw error;
        }
    },
};

export default GetBookingDetailsRepository;