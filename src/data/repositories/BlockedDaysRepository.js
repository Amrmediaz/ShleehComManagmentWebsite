import { buildingApiClient } from '../buildingApiClient.js';
import { BlockedDaysEntity } from '../../core/entities/BlockedDaysEntity.js';

/**
 * BlockedDaysRepository
 * Handles all blocked days data operations
 */
export const BlockedDaysRepository = {
    /**
     * Get all blocked days for a flat
     */
    async getAll(flatId) {
        if (!flatId) {
            throw new Error('Flat ID is required');
        }

        try {
            console.log('[BlockedDaysRepository] Fetching blocked days for flatId:', flatId);

            const result = await buildingApiClient.getBlockedDays(flatId);

            console.log('[BlockedDaysRepository] Raw result:', result);

            // result.message.days: [{ day: 'DD/MM/YYYY', unitsCount }, ...]
            if (result?.message?.days && Array.isArray(result.message.days)) {
                console.log('[BlockedDaysRepository] Blocked days:', result.message.days);
                return result.message.days;
            }

            return [];
        } catch (error) {
            console.error('[BlockedDaysRepository] getAll error:', error);
            throw error;
        }
    },

    async isDateBlocked(flatId, dateString) {
        try {
            const blockedDays = await this.getAll(flatId);
            return blockedDays.some(d => d.day === dateString);
        } catch (error) {
            console.error('[BlockedDaysRepository] isDateBlocked error:', error);
            return false;
        }
    },

    /**
     * @param {number} buildingId
     * @param {Array<{day: string, unitsCount: number}>} days
     */
    async blockDays(buildingId, days) {
        if (!buildingId || !Array.isArray(days) || days.length === 0) {
            throw new Error('Building ID and days array are required');
        }

        try {
            console.log('[BlockedDaysRepository] Blocking days:', { buildingId, days });

            const payload = {
                buildingID: buildingId,
                days: days,
            };

            const result = await buildingApiClient.addBlockedDays(payload);

            console.log('[BlockedDaysRepository] Days blocked successfully:', result);
            return result;
        } catch (error) {
            console.error('[BlockedDaysRepository] blockDays error:', error);
            throw error;
        }
    },

    /**
     * Unblock one or more days
     */
    async unblockDays(flatId, days) {
        if (!flatId || !Array.isArray(days) || days.length === 0) {
            throw new Error('Building ID and days array are required');
        }

        try {
            console.log('[BlockedDaysRepository] Unblocking days:', { flatId, days });

            const payload = {
                buildingID: flatId,
                days: days,
            };

            const result = await buildingApiClient.removeBlockedDays(payload);

            console.log('[BlockedDaysRepository] Days unblocked successfully:', result);
            return result;
        } catch (error) {
            console.error('[BlockedDaysRepository] unblockDays error:', error);
            throw error;
        }
    },

  

};