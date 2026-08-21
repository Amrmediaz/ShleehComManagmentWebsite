import { BuildingRepository } from '../../data/repositories/BuildingRepository.js';
import { withCache } from '../utils/helper/simpleCache.js';

// Keyed per building — BuildingDetail, Dashboard, and BookingList each fetch
// a given building's flats independently; caching here shares the result.
// AddFlatUseCase / EditRoomModal invalidate the relevant `flats:{id}` key.
const getCached = withCache(
    (buildingId) => `flats:${buildingId}`,
    (buildingId) => BuildingRepository.getOwnerBuildingsFlat(buildingId),
    30 * 1000
);

export const GetOwnerBuildingsFlatUseCase = {
    /**
     * Fetches the list of flats for a specific building.
     * @param {number|string} buildingId - The building ID
     * @returns {Array} array of mapped flat objects
     */
    execute: async (buildingId) => {
        return await getCached(buildingId);
    },
};
