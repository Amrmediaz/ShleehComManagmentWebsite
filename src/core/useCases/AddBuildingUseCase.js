import { BuildingRepository } from '../../data/repositories/BuildingRepository';
import { BuildingEntity } from '../entities/Building.js';
import { validateBuildingFields } from '../utils/validations/ValidationBuildingFields.js';

export const AddBuildingUseCase = {
    /**
     * Orchestrates the full add-building flow:
     *  1. Validates raw form data
     *  2. Shapes it into a domain BuildingEntity
     *  3. Dispatches to the data repository
     *
     * @param {object} formData - raw values from the presentation layer
     * @returns {{ validationError: string|null, result: object|null }}
     */
    execute: async (formData) => {
        // 1. Validate before touching the network
        const validationError = validateBuildingFields(formData);
        if (validationError) {
            return { validationError, result: null };
        }

        // 2. Shape raw form data into a clean domain entity
        const building = new BuildingEntity(formData);

        // 3. Send to data layer
        const result = await BuildingRepository.addBuilding(building.toApiPayload());

        return { validationError: null, result };
    },
};