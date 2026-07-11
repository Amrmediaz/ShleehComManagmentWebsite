import { BookingsRepository } from '../../data/repositories/BookingsRepository.js';

/**
 * FetchBookingsUseCase
 * Fetches all bookings for a flat
 */
export const FetchBookingsUseCase = {
    execute: async (flatId, page = 1, pageSize = 100, t) => {
        if (!flatId) {
            return {
                result: null,
                error: t('error_flat_id_required') || 'Flat ID is required',
            };
        }

        try {
            console.log('[FetchBookingsUseCase] Fetching bookings for flatId:', flatId);

            const result = await BookingsRepository.getAll(flatId, page, pageSize);

            console.log('[FetchBookingsUseCase] Success:', result);

            return {
                result,
                error: null,
            };
        } catch (err) {
            console.error('[FetchBookingsUseCase] Error:', err);
            return {
                result: null,
                error: err.message || t('error_loading_bookings') || 'Failed to load bookings',
            };
        }
    },
};

/**
 * FetchBookedDatesUseCase
 * Fetches all booked dates for a flat
 */
export const FetchBookedDatesUseCase = {
    execute: async (flatId, t) => {
        if (!flatId) {
            return {
                result: null,
                error: t('error_flat_id_required') || 'Flat ID is required',
            };
        }

        try {
            console.log('[FetchBookedDatesUseCase] Fetching booked dates for flatId:', flatId);

            const result = await BookingsRepository.getAllBookedDates(flatId);

            console.log('[FetchBookedDatesUseCase] Success:', result);

            return {
                result,
                error: null,
            };
        } catch (err) {
            console.error('[FetchBookedDatesUseCase] Error:', err);
            return {
                result: null,
                error: err.message || t('error_loading_dates') || 'Failed to load booked dates',
            };
        }
    },
};

/**
 * FetchBookingsByStatusUseCase
 * Fetches bookings filtered by status
 */
export const FetchBookingsByStatusUseCase = {
    execute: async (flatId, status, t) => {
        if (!flatId) {
            return {
                result: null,
                error: t('error_flat_id_required') || 'Flat ID is required',
            };
        }

        try {
            console.log('[FetchBookingsByStatusUseCase] Fetching bookings with status:', status);

            const result = await BookingsRepository.getByStatus(flatId, status);

            return {
                result,
                error: null,
            };
        } catch (err) {
            console.error('[FetchBookingsByStatusUseCase] Error:', err);
            return {
                result: null,
                error: err.message || t('error_loading_bookings') || 'Failed to load bookings',
            };
        }
    },
};

/**
 * FetchConfirmedBookingsUseCase
 * Fetches only confirmed bookings
 */
export const FetchConfirmedBookingsUseCase = {
    execute: async (flatId, t) => {
        return FetchBookingsByStatusUseCase.execute(flatId, 1, t);
    },
};