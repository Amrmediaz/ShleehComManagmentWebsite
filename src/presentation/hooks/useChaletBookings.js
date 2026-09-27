import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext.jsx';
import {
    FetchChaletBookingsUseCase,
    FetchChaletBookingDetailsUseCase,
} from '../../core/useCases/ChaletUseCases.js';

/**
 * useChaletBookings
 * Loads the paginated, cross-chalet bookings list for the owner (mirrors the
 * mobile app's BookingListScreen, which is NOT filtered per chalet), plus
 * on-demand booking detail lookups.
 */
export const useChaletBookings = () => {
    const { t } = useTranslation();

    const [bookings, setBookings] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const PAGE_SIZE = 20;

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        setError(null);

        const { result, error: fetchError } = await FetchChaletBookingsUseCase.execute(page, PAGE_SIZE, t);
        if (fetchError) {
            setError(fetchError);
            setIsLoading(false);
            return;
        }
        setBookings(prev => [...prev, ...(result?.bookings || [])]);
        if (!result?.bookings || result.bookings.length < PAGE_SIZE) setHasMore(false);
        setPage(prev => prev + 1);
        setIsLoading(false);
    }, [page, isLoading, hasMore, t]);

    useEffect(() => {
        loadMore();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openBookingDetails = useCallback(async (bookingId) => {
        setDetailsLoading(true);
        setSelectedBooking({ id: bookingId, loading: true });

        const { result, error: fetchError } = await FetchChaletBookingDetailsUseCase.execute(bookingId, t);
        if (fetchError) {
            setSelectedBooking({ id: bookingId, error: fetchError });
        } else {
            setSelectedBooking(result);
        }
        setDetailsLoading(false);
    }, [t]);

    const closeBookingDetails = useCallback(() => setSelectedBooking(null), []);

    return {
        bookings, isLoading, error, hasMore, loadMore,
        selectedBooking, detailsLoading, openBookingDetails, closeBookingDetails,
    };
};
