import { ChaletRepository } from '../../data/repositories/ChaletRepository.js';
import { ChaletEntity } from '../entities/Chalet.js';
import { convertToApiDate } from '../utils/helper/date_utils.js';
import { withCache, invalidateCache } from '../utils/helper/simpleCache.js';

// Cached like GetOwnerBuildingsUseCase — ChaletsPage, CalendarPage, BookingList
// and the Dashboard all fetch the owner's chalets independently.
const getChaletsCached = withCache('chalets', () => ChaletRepository.getOwnerChalets(), 30 * 1000);

/** Minimal, self-contained validation — mirrors validateBuildingFields' shape/return style. */
function validateChaletFields(formData, t) {
    if (!formData.name || !formData.name.trim()) {
        return t('error_chalet_name_required') || 'Chalet name is required';
    }
    if (!formData.chaletType) {
        return t('error_chalet_type_required') || 'Chalet type is required';
    }
    if (!formData.capacity) {
        return t('error_capacity_required') || 'Capacity is required';
    }
    if (!formData.rentFullDay) {
        return t('error_base_rate_required') || 'Full day price is required';
    }
    if (!formData.gouvernate) {
        return t('error_governorate_required') || 'Governorate is required';
    }
    if (!formData.state) {
        return t('error_wilayat_required') || 'Wilayat is required';
    }
    if (!formData.lat || !formData.lng) {
        return t('error_location_cor_required') || 'Location coordinates are required';
    }
    return null;
}

export const GetOwnerChaletsUseCase = {
    execute: async () => getChaletsCached(),
};

export const GetChaletByIdUseCase = {
    execute: async (chaletId) => ChaletRepository.getChaletById(chaletId),
};

export const AddChaletUseCase = {
    execute: async (formData, t) => {
        const validationError = validateChaletFields(formData, t);
        if (validationError) return { validationError, result: null };

        const chalet = new ChaletEntity(formData);
        const result = await ChaletRepository.addChalet(chalet.toApiPayload());
        invalidateCache('chalets');
        return { validationError: null, result };
    },
};

export const UpdateChaletUseCase = {
    execute: async (formData, t) => {
        const validationError = validateChaletFields(formData, t);
        if (validationError) return { validationError, result: null };

        const chalet = new ChaletEntity(formData);
        const result = await ChaletRepository.updateChalet(chalet.toApiPayload());
        invalidateCache('chalets');
        return { validationError: null, result };
    },
};

// ============ TODAY'S OFFER ============
// Dedicated owner-panel endpoints (TODAY-OFFER-API-SPEC.md Part 5) — kept
// separate from AddChaletUseCase/UpdateChaletUseCase above on purpose, so
// saving the offer never needs the full chalet payload rebuilt.

export const GetChaletTodayOfferUseCase = {
    execute: async (chaletId, t) => {
        if (!chaletId) return { result: null, error: t('error_building_id_required') || 'Chalet ID is required' };
        try {
            const result = await ChaletRepository.getTodayOffer(chaletId);
            return { result, error: null };
        } catch (err) {
            return { result: null, error: err.message || t('error_loading') || 'Failed to load Today’s Offer settings' };
        }
    },
};

export const UpdateChaletTodayOfferUseCase = {
    /** @param {{ id, chaletId, todayOfferEnabled, todayOfferPercent, todayOfferTriggerHour }} formData */
    execute: async (formData, t) => {
        if (formData.todayOfferEnabled && (!formData.todayOfferPercent || Number(formData.todayOfferPercent) <= 0)) {
            return { validationError: t('today_offer_error_percent_required') || 'Enter a discount percentage greater than 0', result: null };
        }
        if (formData.todayOfferEnabled && Number(formData.todayOfferPercent) > 90) {
            return { validationError: t('today_offer_error_percent_too_high') || 'Discount percentage looks too high — double check it', result: null };
        }

        // Field names match backend's real Swagger schema for
        // UpdateTodayOffer exactly — NOT buldingId like the rest of the
        // chalet API. `id` is the TodayOfferSettings row's own id: 0 for
        // the very first save (no row yet), otherwise the real id fetched
        // by GetTodayOffer — must be echoed back on every edit or backend
        // creates a duplicate row instead of updating this one.
        const payload = {
            id: formData.id ?? 0,
            buildingOrHoteBuildinglId: formData.chaletId,
            todayOfferEnabled: formData.todayOfferEnabled,
            todayOfferPercent: formData.todayOfferEnabled ? Number(formData.todayOfferPercent) : 0,
            todayOfferTriggerHour: Number(formData.todayOfferTriggerHour),
        };
        const result = await ChaletRepository.updateTodayOffer(payload);
        invalidateCache('chalets');
        return { validationError: null, result };
    },
};

// ============ SPECIAL PRICES ============

export const FetchChaletPricesUseCase = {
    execute: async (chaletId, t) => {
        if (!chaletId) return { result: null, error: t('error_building_id_required') || 'Chalet ID is required' };
        try {
            const result = await ChaletRepository.getPrices(chaletId);
            return { result, error: null };
        } catch (err) {
            return { result: null, error: err.message || t('error_loading_prices') || 'Failed to load prices' };
        }
    },
};

export const SaveChaletPriceUseCase = {
    /**
     * @param {object} formData - { type: 1|2, day, startDate, endDate, price, chaletId }
     * @param {number|null} priceId
     */
    execute: async (formData, priceId, t) => {
        if (!formData.price && formData.price !== 0) {
            return { validationErrors: { price: t('error_price_required') || 'Price is required' }, result: null, error: null };
        }
        if (formData.type === 1 && !formData.day) {
            return { validationErrors: { day: t('error_day_required') || 'Day is required' }, result: null, error: null };
        }
        if (formData.type === 2 && (!formData.startDate || !formData.endDate)) {
            return { validationErrors: { startDate: t('error_dates_required') || 'Start/end dates are required' }, result: null, error: null };
        }

        try {
            // The backend expects dates as "DD/MM/YYYY" (same as the mobile app's
            // SetPriceScreen), while the native <input type="date"> gives us
            // "YYYY-MM-DD" — convert before sending.
            const payload = {
                ...(priceId ? { id: priceId } : {}),
                type: formData.type,
                ...(formData.type === 1 ? { day: formData.day } : {}),
                ...(formData.type === 2 ? {
                    startDate: convertToApiDate(formData.startDate),
                    endDate: convertToApiDate(formData.endDate),
                } : {}),
                price: parseFloat(formData.price),
                buildingID: formData.chaletId,
            };
            const result = await ChaletRepository.savePrice(payload);
            return { validationErrors: null, result, error: null };
        } catch (err) {
            return { validationErrors: null, result: null, error: err.message || t('error_saving_price') || 'Failed to save price' };
        }
    },
};

export const DeleteChaletPriceUseCase = {
    execute: async (priceId, t) => {
        if (!priceId) return { result: null, error: t('error_price_id_required') || 'Price ID is required' };
        try {
            const result = await ChaletRepository.deletePrice(priceId);
            return { result, error: null };
        } catch (err) {
            return { result: null, error: err.message || t('error_deleting_price') || 'Failed to delete price' };
        }
    },
};

// ============ BLOCKED DAYS / AVAILABILITY ============

export const FetchChaletAvailabilityUseCase = {
    /** Loads BOTH owner-blocked days and all-unavailable days in parallel, then derives booked = all - blocked. */
    execute: async (chaletId, t) => {
        if (!chaletId) return { result: null, error: t('error_building_id_required') || 'Chalet ID is required' };
        try {
            const [blocked, allUnavailable] = await Promise.all([
                ChaletRepository.getBlockedDays(chaletId),
                ChaletRepository.getAllUnavailableDays(chaletId),
            ]);
            const blockedSet = new Set(blocked);
            const booked = allUnavailable.filter(d => !blockedSet.has(d));
            return { result: { blocked, booked }, error: null };
        } catch (err) {
            return { result: null, error: err.message || t('error_loading_blocked_days') || 'Failed to load availability' };
        }
    },
};

export const SetChaletBlockedDaysUseCase = {
    /** days: array of "DD/MM/YYYY" strings — the FULL new blocked-days list (replaces, not additive). */
    execute: async (chaletId, days, t) => {
        if (!chaletId) return { result: null, error: t('error_building_id_required') || 'Chalet ID is required' };
        try {
            const result = await ChaletRepository.setBlockedDays(chaletId, days);
            return { result, error: null };
        } catch (err) {
            return { result: null, error: err.message || t('error_blocking_days') || 'Failed to update blocked days' };
        }
    },
};

// ============ BOOKINGS ============

export const FetchChaletBookingsUseCase = {
    execute: async (page, pageSize, t) => {
        try {
            const result = await ChaletRepository.getOwnerBookings(page, pageSize);
            return { result, error: null };
        } catch (err) {
            return { result: null, error: err.message || t('error_loading_bookings') || 'Failed to load bookings' };
        }
    },
};

export const FetchChaletBookingDetailsUseCase = {
    execute: async (bookingId, t) => {
        if (!bookingId) return { result: null, error: t('booking_id') || 'Booking ID is required' };
        try {
            const result = await ChaletRepository.getBookingDetails(bookingId);
            return { result, error: null };
        } catch (err) {
            return { result: null, error: err.message || t('error_loading_details') || 'Failed to load booking details' };
        }
    },
};
