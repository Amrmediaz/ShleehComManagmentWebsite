import { SpecialPricesRepository } from '../../data/repositories/SpecialPricesRepository.js';
import { SpecialPriceEntity } from '../entities/SpecialPriceEntity.js';
import { validateSpecialPriceFields } from '../utils/validations/ValidationSpecialPriceFields.js';

/**
 * EditSpecialPriceUseCase
 * Orchestrates the special price save flow
 */
export const EditSpecialPriceUseCase = {
    execute: async (formData, priceId, t) => {
        // 1. Validate form data
        const validationErrors = validateSpecialPriceFields(formData, t);
        if (validationErrors) {
            return { validationErrors, result: null, error: null };
        }

        try {
            // 2. Create domain entity with CORRECT values
            const specialPrice = new SpecialPriceEntity({
                id: priceId || 0,
                type: 2,                                    // ✅ Always 0 (number, not string)
                startDate: formData.startDate.trim(),       // ✅ Trim whitespace
                endDate: formData.endDate.trim(),           // ✅ Trim whitespace
                day: '',                                    // ✅ Empty string (not "fullday")
                price: parseFloat(formData.price),
                flatID: formData.flatId,
            });

            console.log('[EditSpecialPriceUseCase] Saving price:', specialPrice.toApiPayload());
            console.log('[EditSpecialPriceUseCase] Saving price:', formData.flatId);

            // 3. Dispatch to repository
            const result = await SpecialPricesRepository.save(specialPrice);

            return {
                validationErrors: null,
                result,
                error: null,
            };
        } catch (err) {
            console.error('[EditSpecialPriceUseCase] Error:', err);
            return {
                validationErrors: null,
                result: null,
                error: err.message || t('error_saving_price') || 'Failed to save price',
            };
        }
    },
};

/**
 * DeleteSpecialPriceUseCase
 */
export const DeleteSpecialPriceUseCase = {
    execute: async (priceId, t) => {
        if (!priceId) {
            return {
                result: null,
                error: t('error_price_id_required') || 'Price ID is required',
            };
        }

        try {
            console.log('[DeleteSpecialPriceUseCase] Deleting price:', priceId);
            const result = await SpecialPricesRepository.delete(priceId);

            return {
                result,
                error: null,
            };
        } catch (err) {
            console.error('[DeleteSpecialPriceUseCase] Error:', err);
            return {
                result: null,
                error: err.message || t('error_deleting_price') || 'Failed to delete price',
            };
        }
    },
};

/**
 * FetchSpecialPricesUseCase
 */
export const FetchSpecialPricesUseCase = {
    execute: async (flatId, t) => {
        if (!flatId) {
            return {
                result: null,
                error: t('error_flat_id_required') || 'Flat ID is required',
            };
        }

        try {
            console.log('[FetchSpecialPricesUseCase] Fetching prices for flatId:', flatId);
            const result = await SpecialPricesRepository.getAll(flatId);

            return {
                result: Array.isArray(result) ? result : [],
                error: null,
            };
        } catch (err) {
            console.error('[FetchSpecialPricesUseCase] Error:', err);
            return {
                result: null,
                error: err.message || t('error_loading_prices') || 'Failed to load prices',
            };
        }
    },
};

/**
 * GetActivePricesUseCase
 */
export const GetActivePricesUseCase = {
    execute: async (flatId, t) => {
        if (!flatId) {
            return {
                result: null,
                error: t('error_flat_id_required') || 'Flat ID is required',
            };
        }

        try {
            const result = await SpecialPricesRepository.getActive(flatId);

            return {
                result: Array.isArray(result) ? result : [],
                error: null,
            };
        } catch (err) {
            console.error('[GetActivePricesUseCase] Error:', err);
            return {
                result: null,
                error: err.message || t('error_loading_prices') || 'Failed to load prices',
            };
        }
    },
};