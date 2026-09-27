import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext.jsx';
import {
    FetchChaletAvailabilityUseCase,
    SetChaletBlockedDaysUseCase,
} from '../../core/useCases/ChaletUseCases.js';

/** "DD/MM/YYYY" -> "YYYY-MM-DD" */
const apiToIso = (d) => {
    const [day, month, year] = d.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};
/** "YYYY-MM-DD" -> "DD/MM/YYYY" */
const isoToApi = (d) => {
    const [year, month, day] = d.split('-');
    return `${day}/${month}/${year}`;
};

/**
 * useChaletBlockedDays
 * Manages a chalet's owner-blocked availability calendar. Booked (customer)
 * days are read-only; blocked days are toggled locally and the FULL set is
 * resubmitted on save (mirrors the mobile app's CalendarScreen — no per-day
 * "units" concept since a chalet is a single unique property).
 */
export const useChaletBlockedDays = (chaletId) => {
    const { t } = useTranslation();

    const [blockedDays, setBlockedDays] = useState(new Set()); // ISO strings
    const [bookedDays, setBookedDays] = useState(new Set());   // ISO strings
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });
    const [dirty, setDirty] = useState(false);

    const load = useCallback(async () => {
        if (!chaletId) return;
        setIsLoading(true);
        setStatusMessage({ text: '', isError: false });

        const { result, error } = await FetchChaletAvailabilityUseCase.execute(chaletId, t);
        if (error) {
            setStatusMessage({ text: error, isError: true });
        } else {
            setBlockedDays(new Set((result?.blocked || []).map(apiToIso)));
            setBookedDays(new Set((result?.booked || []).map(apiToIso)));
            setDirty(false);
        }
        setIsLoading(false);
    }, [chaletId, t]);

    useEffect(() => {
        if (chaletId) load();
    }, [chaletId, load]);

    const isBooked = useCallback((isoDate) => bookedDays.has(isoDate), [bookedDays]);
    const isBlocked = useCallback((isoDate) => blockedDays.has(isoDate), [blockedDays]);

    const toggleDay = useCallback((isoDate) => {
        if (bookedDays.has(isoDate)) {
            setStatusMessage({ text: t('cannot_change_booked_date') || 'This day is booked by a customer', isError: true });
            return;
        }
        setBlockedDays(prev => {
            const next = new Set(prev);
            if (next.has(isoDate)) next.delete(isoDate); else next.add(isoDate);
            return next;
        });
        setDirty(true);
    }, [bookedDays, t]);

    const save = useCallback(async () => {
        setIsSaving(true);
        setStatusMessage({ text: '', isError: false });

        const apiDays = Array.from(blockedDays).map(isoToApi);
        const { error } = await SetChaletBlockedDaysUseCase.execute(chaletId, apiDays, t);

        if (error) {
            setStatusMessage({ text: error, isError: true });
        } else {
            setStatusMessage({ text: t('changes_saved') || 'Changes saved!', isError: false });
            setDirty(false);
        }
        setIsSaving(false);
    }, [chaletId, blockedDays, t]);

    return {
        isLoading, isSaving, statusMessage, setStatusMessage, dirty,
        isBooked, isBlocked, toggleDay, save, reload: load,
        blockedCount: blockedDays.size, bookedCount: bookedDays.size,
    };
};
