import { BlockedDaysRepository } from '../../data/repositories/BlockedDaysRepository.js';

/**
 * FetchBlockedDaysUseCase
 * Fetches all blocked days for a flat.
 * result: [{ day: 'DD/MM/YYYY', unitsCount: number }, ...]
 */
export const FetchBlockedDaysUseCase = {
    execute: async (flatId, t) => {
        if (!flatId) {
            return {
                result: null,
                error: t('error_flat_id_required') || 'Flat ID is required',
            };
        }

        try {
            console.log('[FetchBlockedDaysUseCase] Fetching blocked days for flatId:', flatId);

            const result = await BlockedDaysRepository.getAll(flatId);

            console.log('[FetchBlockedDaysUseCase] Success:', result);

            return {
                result,
                error: null,
            };
        } catch (err) {
            console.error('[FetchBlockedDaysUseCase] Error:', err);
            return {
                result: null,
                error: err.message || t('error_loading_blocked_days') || 'Failed to load blocked days',
            };
        }
    },
};

/**
 * BlockDaysUseCase
 * Blocks one or more days for a flat. Each day carries its own units count
 * now — no separate unitsCount argument anymore.
 * @param {number} buildingId
 * @param {Array<{day: string, unitsCount: number}>} days
 * @param {Function} t
 */
export const BlockDaysUseCase = {
    execute: async (buildingId, days, t) => {
        if (!buildingId) {
            return {
                result: null,
                error: t('error_building_id_required') || 'Building ID is required',
            };
        }

        if (!Array.isArray(days) || days.length === 0) {
            return {
                result: null,
                error: t('error_days_required') || 'At least one day is required',
            };
        }

        try {
            console.log('[BlockDaysUseCase] Blocking days:', { buildingId, days });

            const result = await BlockedDaysRepository.blockDays(buildingId, days);

            console.log('[BlockDaysUseCase] Success:', result);

            return {
                result,
                error: null,
            };
        } catch (err) {
            console.error('[BlockDaysUseCase] Error:', err);
            return {
                result: null,
                error: err.message || t('error_blocking_days') || 'Failed to block days',
            };
        }
    },
};

/**
 * UnblockDaysUseCase
 * Not used by useCalendarView.js (unblocking is done by resending the
 * remaining days through BlockDaysUseCase instead), kept here for any other
 * caller. Already matches BlockedDaysRepository.blockDays(buildingId, days)'s
 * 2-arg signature, so no change needed.
 */
export const UnblockDaysUseCase = {
    execute: async (flatId, days, t) => {
        if (!flatId) {
            return {
                result: null,
                error: t('error_building_id_required') || 'Building ID is required',
            };
        }

        if (!Array.isArray(days) || days.length === 0) {
            return {
                result: null,
                error: t('error_days_required') || 'At least one day is required',
            };
        }

        try {
            console.log('[UnblockDaysUseCase] Unblocking days:', { flatId, days });

            const result = await BlockedDaysRepository.blockDays(flatId, days);

            console.log('[UnblockDaysUseCase] Success:', result);

            return {
                result,
                error: null,
            };
        } catch (err) {
            console.error('[UnblockDaysUseCase] Error:', err);
            return {
                result: null,
                error: err.message || t('error_unblocking_days') || 'Failed to unblock days',
            };
        }
    },
};