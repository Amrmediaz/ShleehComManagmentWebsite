import { BuildingRepository } from '../../data/repositories/BuildingRepository.js';

export const GetOwnerFlatUseCase = {
    /**
     * Fetches the list of flats for a specific building.
     * @param {number|string} buildingId - The building ID
     * @returns {Array} array of mapped flat objects
     */
    execute: async (flatId) => {
        return await BuildingRepository.getOwnerFlat(flatId);
    },
};