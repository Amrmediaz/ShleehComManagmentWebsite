import { BuildingRepository } from '../../data/repositories/BuildingRepository.js';
import { invalidateCache } from '../utils/helper/simpleCache.js';

/**
 * UpdateBuildingTodayOfferUseCase
 * Dedicated Today's Offer write for a building (TODAY-OFFER-API-SPEC.md
 * Part 5) — separate from EditBuildingUseCase on purpose, so saving the
 * offer never needs the full ~30-field building payload rebuilt.
 */
export const UpdateBuildingTodayOfferUseCase = {
    /** @param {{ id, buildingId, todayOfferEnabled, todayOfferPercent, todayOfferTriggerHour }} formData */
    execute: async (formData, t) => {
        if (formData.todayOfferEnabled && (!formData.todayOfferPercent || Number(formData.todayOfferPercent) <= 0)) {
            return { validationError: t('today_offer_error_percent_required') || 'Enter a discount percentage greater than 0', result: null };
        }
        if (formData.todayOfferEnabled && Number(formData.todayOfferPercent) > 90) {
            return { validationError: t('today_offer_error_percent_too_high') || 'Discount percentage looks too high — double check it', result: null };
        }

        // Field names match backend's real Swagger schema for
        // UpdateHotelBuildingTodayOffer — same shared request DTO as the
        // chalet endpoint (`buildingOrHoteBuildinglId`, note the backend's
        // own typo), NOT hotelbuildingId. `id` is the TodayOfferSettings
        // row's own id: 0 for the very first save (no row yet), otherwise
        // the real id fetched by GetHotelBuildingTodayOffer — must be
        // echoed back on every edit or backend creates a duplicate row.
        const payload = {
            id: formData.id ?? 0,
            buildingOrHoteBuildinglId: formData.buildingId,
            todayOfferEnabled: formData.todayOfferEnabled,
            todayOfferPercent: formData.todayOfferEnabled ? Number(formData.todayOfferPercent) : 0,
            todayOfferTriggerHour: Number(formData.todayOfferTriggerHour),
        };
        const result = await BuildingRepository.updateTodayOffer(payload);
        invalidateCache('buildings');
        return { validationError: null, result };
    },
};

export default UpdateBuildingTodayOfferUseCase;
