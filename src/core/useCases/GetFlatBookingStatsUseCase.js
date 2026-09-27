import { GetBookingDetailsRepository } from '../../data/repositories/GetBookingDetailsRepository.js';

/**
 * GetFlatBookingsWithDetailsUseCase
 *
 * Fetches every booking for a flat as BookingDetailsEntity objects (each one
 * already carries coast/insurance/paidAmount, so isFullyPaid()/getPaymentStatus()
 * work out of the box). There is no dedicated backend stats endpoint (see the
 * API gaps note), so the Dashboard uses this — one call per flat — to build
 * booking counts, paid/partial/unpaid breakdowns, and revenue totals client-side.
 */
export const GetFlatBookingsWithDetailsUseCase = {
    execute: async (flatId, pageSize = 200) => {
        if (!flatId) return { bookings: [], rowCount: 0 };
        try {
            const result = await GetBookingDetailsRepository.getByFlatId(flatId, 1, pageSize);
            return { bookings: result.bookings || [], rowCount: result.rowCount || 0 };
        } catch (err) {
            console.error('[GetFlatBookingsWithDetailsUseCase] Failed for flatId:', flatId, err);
            return { bookings: [], rowCount: 0 };
        }
    },
};
