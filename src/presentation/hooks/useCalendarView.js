import { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { FetchBlockedDaysUseCase, BlockDaysUseCase } from '../../core/useCases/BlockedDaysUseCase.js';
import { FetchBookingsUseCase } from '../../core/useCases/FetchBookingsUseCase.js';

// ---------------------------------------------------------------------------
// Backend now supports true per-date units count:
//   { buldingID, days: [{ day: 'DD/MM/YYYY', unitsCount }, ...] }
// So blockedDays here is [{ date: 'YYYY-MM-DD', unitsCount }], each date
// carrying its own independent count. blockDay(date, count) upserts just
// that one date's count and resends the whole list (the API is a full
// replace), leaving every other date's count untouched.
//
// blockDay/unblockDay are now thin wrappers around blockMultipleDays /
// unblockMultipleDays, which do the same "read-merge-replace" but for any
// number of dates in a single API call.
// ---------------------------------------------------------------------------

export const useCalendarView = (flatId, buildingId) => {
    const { t } = useTranslation();

    const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1));
    const [bookings, setBookings] = useState([]);
    const [blockedDays, setBlockedDays] = useState([]); // [{ date: 'YYYY-MM-DD', unitsCount }]
    const [bookedDates, setBookedDates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

    /**
     * DD/MM/YYYY → YYYY-MM-DD. Idempotent: already-ISO input is returned
     * unchanged instead of being mis-parsed.
     */
    const toISO = (dateStr) => {
        if (!dateStr) return null;
        if (dateStr.includes('-') && !dateStr.includes('/')) return dateStr;
        if (!dateStr.includes('/')) return null;
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;
        const [dd, mm, yyyy] = parts;
        if (!dd || !mm || !yyyy) return null;
        return `${yyyy}-${mm}-${dd}`;
    };

    /**
     * YYYY-MM-DD → DD/MM/YYYY. Idempotent: already-DD/MM/YYYY input is
     * returned unchanged instead of being mis-parsed.
     */
    const toDMY = (dateStr) => {
        if (!dateStr) return null;
        if (dateStr.includes('/')) return dateStr;
        if (!dateStr.includes('-')) return null;
        const [yyyy, mm, dd] = dateStr.split('-');
        if (!dd || !mm || !yyyy) return null;
        return `${dd}/${mm}/${yyyy}`;
    };

    /** Only a strict DD/MM/YYYY string is allowed into an outgoing payload. */
    const isValidDMY = (dateStr) => /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr || '');

    const isPastDate = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(dateString + 'T00:00:00');
        return date < today;
    };

    /** Normalizes the API's per-date blocked-days result into [{date, unitsCount}] */
    const parseBlockedResult = (blockedResult) => {
        if (!Array.isArray(blockedResult)) return [];

        return blockedResult
            .map(entry => {
                // New shape: { day: 'DD/MM/YYYY', unitsCount }
                if (entry && typeof entry === 'object') {
                    const iso = toISO(entry.day || entry.date);
                    return iso ? { date: iso, unitsCount: Number(entry.unitsCount) || 0 } : null;
                }
                // Fallback: plain date string, count unknown → default 1.
                const iso = toISO(entry);
                return iso ? { date: iso, unitsCount: 1 } : null;
            })
            .filter(Boolean);
    };

    /** Build a safe outgoing days payload, dropping any corrupted entries. */
    const buildSafePayload = (entries) => {
        const payload = entries
            .map(e => ({ day: toDMY(e.date), unitsCount: e.unitsCount }))
            .filter(e => isValidDMY(e.day));
        const dropped = entries.length - payload.length;
        if (dropped > 0) {
            console.warn('[useCalendarView] Dropped', dropped, 'invalid/corrupted date(s) before sending.');
        }
        return payload;
    };

    const loadCalendarData = async () => {
        if (!flatId || !buildingId) return;

        setIsLoading(true);
        setStatusMessage({ text: '', isError: false });

        const { result: bookingsResult } = await FetchBookingsUseCase.execute(flatId, 1, 1000, t);

        if (bookingsResult) {
            setBookings(bookingsResult.bookings || []);
            const booked = [];
            (bookingsResult.bookings || []).forEach(booking => {
                booking.hotelbuildingBookingDays?.forEach(day => {
                    booked.push({
                        date: day.day,
                        type: 'booking',
                        name: booking.name,
                        status: booking.bookingstatus,
                    });
                });
            });
            setBookedDates(booked);
        }

        const { result: blockedResult } = await FetchBlockedDaysUseCase.execute(flatId, t);
        setBlockedDays(parseBlockedResult(blockedResult));

        setIsLoading(false);
    };

    /**
     * Block (or update the units count of) any number of dates in a single
     * API call. Every date not in `dateStrings` keeps its existing count
     * untouched — this is a targeted upsert, not a full overwrite.
     * Uses the already-loaded `blockedDays` state as the base list — no
     * extra fetch before sending, since there's only the one block API.
     */
    const blockMultipleDays = async (dateStrings, unitsCount) => {
        if (!buildingId) {
            setStatusMessage({ text: 'Building ID is required', isError: true });
            return;
        }

        const uniqueDates = [...new Set(dateStrings)];
        const validDates = uniqueDates.filter(d => !isPastDate(d));

        if (validDates.length === 0) {
            setStatusMessage({ text: t('cannot_block_past_date') || 'Cannot block past dates', isError: true });
            return;
        }

        setIsProcessing(true);

        const dateSet = new Set(validDates);
        const withoutTheseDates = blockedDays.filter(d => !dateSet.has(d.date));
        const newEntries = validDates.map(date => ({ date, unitsCount }));
        const allBlockedDays = [...withoutTheseDates, ...newEntries];

        const payload = buildSafePayload(allBlockedDays);
        const cleanDays = allBlockedDays.filter(d => isValidDMY(toDMY(d.date)));

        console.log('[useCalendarView] Blocking day(s), payload:', payload);

        const { error } = await BlockDaysUseCase.execute(flatId, payload, t);

        if (error) {
            setStatusMessage({ text: error, isError: true });
            setIsProcessing(false);
            return;
        }

        setBlockedDays(cleanDays);
        setStatusMessage({
            text: validDates.length > 1
                ? `${validDates.length} ${t('days_blocked') || 'days blocked'} ✓`
                : `${t('day_blocked') || 'Day blocked'} ✓`,
            isError: false,
        });
        setIsProcessing(false);
    };

    /**
     * Unblock any number of dates using the same block API — there's no
     * separate "remove" endpoint, so this just resends the current blocked
     * list with the given dates left out of it.
     */
    const unblockMultipleDays = async (dateStrings) => {
        if (!buildingId) {
            setStatusMessage({ text: 'Building ID is required', isError: true });
            return;
        }

        const uniqueDates = [...new Set(dateStrings)];
        if (uniqueDates.length === 0) return;

        setIsProcessing(true);

        const dateSet = new Set(uniqueDates);
        const allBlockedDays = blockedDays.filter(d => !dateSet.has(d.date));

        const payload = buildSafePayload(allBlockedDays);
        const cleanDays = allBlockedDays.filter(d => isValidDMY(toDMY(d.date)));

        console.log('[useCalendarView] Unblocking day(s), remaining payload:', payload);

        // The API is a full replace; if nothing is left blocked, some
        // backends reject an empty array — guard for that case by treating
        // it the same as a normal (possibly empty) update.
        // IMPORTANT: same use case + same id (flatId) as blockDay, so
        // unblock actually persists instead of silently no-op'ing.
        const { error } = payload.length > 0
            ? await BlockDaysUseCase.execute(flatId, payload, t)
            : { error: null };

        if (error) {
            setStatusMessage({ text: error, isError: true });
            setIsProcessing(false);
            return;
        }

        setBlockedDays(cleanDays);
        setStatusMessage({
            text: uniqueDates.length > 1
                ? `${uniqueDates.length} ${t('days_unblocked') || 'days unblocked'} ✓`
                : `${t('day_unblocked') || 'Day unblocked'} ✓`,
            isError: false,
        });
        setIsProcessing(false);
    };

    /** Block a single date, or update its units count — upsert of one date. */
    const blockDay = (dateString, unitsCount) => blockMultipleDays([dateString], unitsCount);

    /** Unblock a single date — every other date's count is untouched. */
    const unblockDay = (dateString) => unblockMultipleDays([dateString]);

    const isDateBlocked = (dateString) => blockedDays.some(d => d.date === dateString);
    const isDateBooked = (dateString) => bookedDates.some(d => d.date === dateString);
    const getBlockedUnitsForDate = (dateString) => blockedDays.find(d => d.date === dateString)?.unitsCount || 0;

    const getDateType = (dateString) => {
        if (isDateBlocked(dateString)) return 'blocked';
        if (isDateBooked(dateString)) return 'booked';
        return 'available';
    };

    const getDateDetails = (dateString) => {
        const booked = bookedDates.find(d => d.date === dateString);
        if (booked) return { type: 'booked', name: booked.name, status: booked.status };
        const blocked = blockedDays.find(d => d.date === dateString);
        if (blocked) return { type: 'blocked', unitsCount: blocked.unitsCount };
        return { type: 'available' };
    };

    const prevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    useEffect(() => {
        if (flatId && buildingId) {
            loadCalendarData();
        }
    }, [flatId, buildingId]);

    return {
        currentDate,
        prevMonth,
        nextMonth,
        goToToday,
        bookings,
        blockedDays,
        bookedDates,
        isLoading,
        isProcessing,
        statusMessage,
        setStatusMessage,
        loadCalendarData,
        blockDay,
        unblockDay,
        blockMultipleDays,
        unblockMultipleDays,
        isDateBlocked,
        isDateBooked,
        getBlockedUnitsForDate,
        isPastDate,
        getDateType,
        getDateDetails,
    };
};