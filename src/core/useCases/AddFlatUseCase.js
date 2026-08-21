import { BuildingRepository } from '../../data/repositories/BuildingRepository';
import { FlatEntity } from '../entities/Flat.js';
import { validateFlatFields } from '../utils/validations/ValidationFlatFields.js';
import { invalidateCache } from '../utils/helper/simpleCache.js';

export const AddFlatUseCase = {
    /**
     * Orchestrates the full add-flat flow:
     *  1. Validates raw form data (flat-specific rules only)
     *  2. Shapes it into a domain FlatEntity
     *  3. Dispatches to the data repository
     *
     * @param {object} formData - raw values from the presentation layer
     * @returns {{ validationError: string|null, result: object|null }}
     */
    execute: async (formData,t) => {
        // 1. Validate before touching the network
        const validationError = validateFlatFields(formData,t);
        if (validationError) {
            return { validationError, result: null };
        }

        // 2. Shape raw form data into a clean domain entity
        const flatEntity = new FlatEntity(formData);

        // 3. Send to data layer
        const result = await BuildingRepository.addFlat(flatEntity.toApiPayload());
        invalidateCache(`flats:${formData.hotelbuildingID}`);

        return { validationError: null, result };
    },
};