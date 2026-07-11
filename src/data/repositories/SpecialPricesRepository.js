import { buildingApiClient } from '../buildingApiClient.js';

/**
 * SpecialPricesRepository
 * Handles all data operations related to special prices
 * Abstracts away API client details from business logic
 */
export const SpecialPricesRepository = {
    /**
     * Fetch all special prices for a flat
     * @param {number} flatId - The flat ID (referred to as buildingID in API)
     * @returns {Promise<Array>} Array of special price objects
     */
    async getAll(flatId) {
        if (!flatId) {
            throw new Error('Flat ID is required');
        }

        console.log('[SpecialPricesRepository] Fetching prices for flatId:', flatId);

        try {
            const result = await buildingApiClient.getSpecialPrices(flatId);

            // Ensure we always return an array
            if (!Array.isArray(result)) {
                if (result?.message && Array.isArray(result.message)) {
                    return result.message;
                }
                return [];
            }

            return result;
        } catch (error) {
            console.error('[SpecialPricesRepository] getAll error:', error);
            throw error;
        }
    },

    /**
     * Create a new special price
     * @param {SpecialPriceEntity} specialPriceEntity - The special price entity
     * @returns {Promise<object>} API response
     */
    async create(specialPriceEntity) {
        if (!specialPriceEntity) {
            throw new Error('Special price entity is required');
        }

        console.log('[SpecialPricesRepository] Creating price:', specialPriceEntity.toApiPayload());

        try {
            const payload = {
                id: 0, // Always 0 for new
                ...specialPriceEntity.toApiPayload(),
            };

            const result = await buildingApiClient.postSpecialPrice(payload);

            if (!result?.status && !result?.success) {
                throw new Error(result?.message || 'Failed to create special price');
            }

            return result;
        } catch (error) {
            console.error('[SpecialPricesRepository] create error:', error);
            throw error;
        }
    },

    /**
     * Update an existing special price
     * @param {SpecialPriceEntity} specialPriceEntity - The special price entity with id
     * @returns {Promise<object>} API response
     */
    async update(specialPriceEntity) {
        if (!specialPriceEntity || !specialPriceEntity.id) {
            throw new Error('Special price entity with id is required');
        }

        console.log('[SpecialPricesRepository] Updating price:', specialPriceEntity.toApiPayload());

        try {
            const payload = specialPriceEntity.toApiPayload();
            const result = await buildingApiClient.postSpecialPrice(payload);

            if (!result?.status && !result?.success) {
                throw new Error(result?.message || 'Failed to update special price');
            }

            return result;
        } catch (error) {
            console.error('[SpecialPricesRepository] update error:', error);
            throw error;
        }
    },

    /**
     * Delete a special price by ID
     * @param {number} priceId - The price ID to delete
     * @returns {Promise<object>} API response
     */
    async delete(priceId) {
        if (!priceId) {
            throw new Error('Price ID is required');
        }

        console.log('[SpecialPricesRepository] Deleting price:', priceId);

        try {
            const result = await buildingApiClient.deleteSpecialPrice(priceId);

            if (!result?.status && !result?.success) {
                throw new Error(result?.message || 'Failed to delete special price');
            }

            return result;
        } catch (error) {
            console.error('[SpecialPricesRepository] delete error:', error);
            throw error;
        }
    },

    /**
     * Save a price (create if new, update if existing)
     * @param {SpecialPriceEntity} specialPriceEntity - The special price entity
     * @returns {Promise<object>} API response
     */
    async save(specialPriceEntity) {
        if (specialPriceEntity.isNew()) {
            return this.create(specialPriceEntity);
        } else {
            return this.update(specialPriceEntity);
        }
    },

    /**
     * Get active prices for a flat (prices with current date in range)
     * @param {number} flatId - The flat ID
     * @returns {Promise<Array>} Array of active special prices
     */
    async getActive(flatId) {
        const allPrices = await this.getAll(flatId);
        const now = new Date();

        return allPrices.filter(price => {
            const startDate = new Date(price.startDate);
            const endDate = new Date(price.endDate);
            return now >= startDate && now <= endDate;
        });
    },

    /**
     * Get prices for a specific date
     * @param {number} flatId - The flat ID
     * @param {Date} date - The date to check
     * @returns {Promise<Array>} Array of prices that cover this date
     */
    async getPricesForDate(flatId, date) {
        const allPrices = await this.getAll(flatId);
        const checkDate = new Date(date);

        return allPrices.filter(price => {
            const startDate = new Date(price.startDate);
            const endDate = new Date(price.endDate);
            return checkDate >= startDate && checkDate <= endDate;
        });
    },
};