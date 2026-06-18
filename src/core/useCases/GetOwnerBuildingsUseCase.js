import { BuildingRepository } from '../../data/repositories/BuildingRepository.js';

export const GetOwnerBuildingsUseCase = {
    /**
     * Fetches the list of buildings owned by the logged-in owner.
     * @returns {Array} array of mapped building objects
     */
    execute: async () => {
        return await BuildingRepository.getOwnerBuildings();
    },
};
 