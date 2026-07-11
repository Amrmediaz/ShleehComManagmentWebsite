/**
 * GetBookingDetailsUseCase
 *
 * Use Case Layer: Business Logic
 * Responsibility: Orchestrate business logic without knowing about HTTP/API details
 *
 * ✅ Uses: GetBookingDetailsRepository (NOT buildingApiClient directly)
 * The repository handles all API calls using buildingApiClient
 *
 * Architecture Flow:
 * Component → UseCase → Repository → buildingApiClient → Backend
 *
 * UseCase should NEVER import API client directly
 */

import { GetBookingDetailsRepository } from '../../data/repositories/GetBookingDetailsRepository.js';

/**
 * GetBookingDetailsUseCase
 * Singleton instance for getting booking details
 */
const GetBookingDetailsUseCase = {
    /**
     * Execute: Get booking details by booking ID
     *
     * Uses: GetBookingDetailsRepository.getById()
     * Which uses: buildingApiClient.getBookingDetails()
     *
     * @param {number} bookingId - The booking ID
     * @returns {Promise<BookingDetailsEntity>} Booking details entity
     *
     * @throws {Error} If booking ID is invalid or API call fails
     *
     * @example
     * const booking = await GetBookingDetailsUseCase.execute(123);
     * console.log(booking.name, booking.cost, booking.isFullyPaid());
     */
    async execute(bookingId) {
        if (!bookingId) {
            throw new Error('Booking ID is required');
        }

        console.log('[GetBookingDetailsUseCase] ===== START =====');
        console.log('[GetBookingDetailsUseCase] execute() called with bookingId:', bookingId);

        try {
            console.log('[GetBookingDetailsUseCase] 🔄 Calling Repository.getById()');

            // ✅ Call Repository (NOT API client directly)
            const bookingDetails = await GetBookingDetailsRepository.getById(bookingId);

            console.log('[GetBookingDetailsUseCase] ✅ Successfully fetched booking details');
            console.log('[GetBookingDetailsUseCase] Booking:', {
                id: bookingDetails.id,
                name: bookingDetails.name,
                totalCost: bookingDetails.getTotalCost(),
                isFullyPaid: bookingDetails.isFullyPaid(),
            });
            console.log('[GetBookingDetailsUseCase] ===== END =====');

            return bookingDetails;

        } catch (error) {
            console.error('[GetBookingDetailsUseCase] ❌ Error executing use case');
            console.error('[GetBookingDetailsUseCase] Error message:', error.message);
            console.error('[GetBookingDetailsUseCase] Full error:', error);
            console.log('[GetBookingDetailsUseCase] ===== ERROR =====');
            throw error;
        }
    },

    /**
     * Get booking details by ID with error handling
     *
     * Alternative method with detailed error handling
     *
     * @param {number} bookingId - The booking ID
     * @returns {Promise<Object>} { success, data, error }
     *
     * @example
     * const result = await GetBookingDetailsUseCase.executeWithResult(123);
     * if (result.success) {
     *     console.log(result.data);
     * } else {
     *     console.error(result.error);
     * }
     */
    async executeWithResult(bookingId) {
        try {
            console.log('[GetBookingDetailsUseCase] executeWithResult() called with bookingId:', bookingId);

            const data = await this.execute(bookingId);

            return {
                success: true,
                data: data,
                error: null,
            };

        } catch (error) {
            console.error('[GetBookingDetailsUseCase] executeWithResult() error:', error.message);

            return {
                success: false,
                data: null,
                error: error.message,
            };
        }
    },
};

// ✅ Export as default
export default GetBookingDetailsUseCase;
export { GetBookingDetailsUseCase };