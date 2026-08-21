import { BuildingRepository } from '../../data/repositories/BuildingRepository.js';
import { withCache } from '../utils/helper/simpleCache.js';

// Cached for a short window — this is fetched independently by Header, the
// Dashboard, BookingList, and anywhere else the buildings list is needed, so
// caching it here (once) removes the redundant repeat calls automatically
// for every caller. AddBuildingUseCase/EditBuildingUseCase invalidate it.
const getCached = withCache('buildings', () => BuildingRepository.getOwnerBuildings(), 30 * 1000);

export const GetOwnerBuildingsUseCase = {
    /**
     * Fetches the list of buildings owned by the logged-in owner.
     * @returns {Array} array of mapped building objects
     */
    execute: async () => {
        return await getCached();
    },
};
