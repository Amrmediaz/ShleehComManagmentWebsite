import { BuildingRepository } from '../../data/repositories/BuildingRepository.js';

/**
 * GetBuildingTodayOfferUseCase
 * Dedicated Today's Offer read for a building (TODAY-OFFER-API-SPEC.md Part 5)
 * — separate from the general GetOwnerBuildingsUseCase, so the Offers tab
 * loads its own small settings object instead of depending on the full
 * building list/detail already being loaded.
 */
export const GetBuildingTodayOfferUseCase = {
    execute: async (buildingId, t) => {
        if (!buildingId) return { result: null, error: t('error_building_id_required') || 'Building ID is required' };
        try {
            const result = await BuildingRepository.getTodayOffer(buildingId);
            return { result, error: null };
        } catch (err) {
            return { result: null, error: err.message || t('error_loading') || 'Failed to load Today’s Offer settings' };
        }
    },
};

export default GetBuildingTodayOfferUseCase;
