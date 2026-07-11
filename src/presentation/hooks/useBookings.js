import { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { FetchBookingsUseCase, FetchBookedDatesUseCase } from '../../core/useCases/FetchBookingsUseCase.js';

/**
 * useBookings
 * Custom hook for managing bookings and calendar data
 */
export const useBookings = (flatId) => {
    const { t } = useTranslation();

    // State
    const [bookings, setBookings] = useState([]);
    const [bookedDates, setBookedDates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageCount: 1,
        pageSize: 100,
        rowCount: 0,
    });

    /**
     * Fetch all bookings
     */
    const loadBookings = async (page = 1) => {
        if (!flatId) {
            setError('No flat ID provided');
            return;
        }

        setIsLoading(true);
        setError(null);

        console.log('[useBookings] Loading bookings for flatId:', flatId, 'page:', page);

        const { result, error: fetchError } = await FetchBookingsUseCase.execute(
            flatId,
            page,
            100,
            t
        );

        if (fetchError) {
            console.error('[useBookings] Error loading bookings:', fetchError);
            setError(fetchError);
            setIsLoading(false);
            return;
        }

        if (result) {
            console.log('[useBookings] Bookings loaded:', result.bookings);
            setBookings(result.bookings);
            setPagination({
                currentPage: result.currentPage,
                pageCount: result.pageCount,
                pageSize: result.pageSize,
                rowCount: result.rowCount,
            });
        }

        setIsLoading(false);
    };

    /**
     * Fetch all booked dates for calendar
     */
    const loadBookedDates = async () => {
        if (!flatId) {
            setError('No flat ID provided');
            return;
        }

        setIsLoading(true);
        setError(null);

        console.log('[useBookings] Loading booked dates for flatId:', flatId);

        const { result, error: fetchError } = await FetchBookedDatesUseCase.execute(flatId, t);

        if (fetchError) {
            console.error('[useBookings] Error loading booked dates:', fetchError);
            setError(fetchError);
            setIsLoading(false);
            return;
        }

        if (result) {
            console.log('[useBookings] Booked dates loaded:', result);
            setBookedDates(result);
        }

        setIsLoading(false);
    };

    /**
     * Check if a date is booked
     */
    const isDateBooked = (dateString) => {
        return bookedDates.some(bd => bd.date === dateString);
    };

    /**
     * Get booking details for a date
     */
    const getBookingForDate = (dateString) => {
        return bookedDates.find(bd => bd.date === dateString);
    };

    /**
     * Get all bookings for a date range
     */
    const getBookingsInRange = (startDate, endDate) => {
        return bookings.filter(booking => {
            return booking.hotelbuildingBookingDays.some(day => {
                const date = day.day;
                return date >= startDate && date <= endDate;
            });
        });
    };

    /**
     * Get booking status label
     */
    const getStatusLabel = (status) => {
        const statuses = {
            0: t('pending') || 'Pending',
            1: t('confirmed') || 'Confirmed',
            2: t('cancelled') || 'Cancelled',
            3: t('completed') || 'Completed',
        };
        return statuses[status] || t('unknown') || 'Unknown';
    };

    /**
     * Get status color
     */
    const getStatusColor = (status) => {
        const colors = {
            0: '#fbbf24', // yellow - pending
            1: '#10b981', // green - confirmed
            2: '#ef4444', // red - cancelled
            3: '#6366f1', // indigo - completed
        };
        return colors[status] || '#9ca3af';
    };

    // Load bookings on mount and when flatId changes
    useEffect(() => {
        if (flatId) {
            loadBookings();
            loadBookedDates();
        }
    }, [flatId]);

    return {
        bookings,
        bookedDates,
        isLoading,
        error,
        pagination,
        loadBookings,
        loadBookedDates,
        isDateBooked,
        getBookingForDate,
        getBookingsInRange,
        getStatusLabel,
        getStatusColor,
    };
};