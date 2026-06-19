/**
 * Validates all required fields for the Add Building form.
 * Returns a translation key string if validation fails, or null if all fields pass.
 */

import {useTranslation} from '../../../presentation/context/LanguageContext.jsx'
export const validateBuildingFields = ({
                                           nameAr,
                                           nameEn,
                                           totalFloor,
                                           totalFlats,
                                           yearBulit,
                                           gouvernate,
                                           state,
                                           location,
                                           minimumRent,
                                           maxRent,
                                           coverimg,
                                           buildingFlatType,
                                           buldingImages,buldingService ,
                                           managmentPhone,
                                           workerPhone,
    lat,lng

                                       } , t) => {
   

    if (!nameAr?.trim()) return t('error_name_ar_required');
    if (!nameEn?.trim()) return t('error_name_en_required');

   

    const year = Number(yearBulit);
    if (!yearBulit || isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
        return t('error_year_invalid');
    }

    if (!totalFloor || Number(totalFloor) < 1) return t('error_floors_required');
    if (!totalFlats || Number(totalFlats) < 1) return t('error_flats_required');

    // ── Unit Types ───────────────────────────────────────────────
    if (!buildingFlatType || buildingFlatType.length === 0) return t('error_unit_type_required');

    // ── Location ────────────────────────────────────────────────
    if (!gouvernate?.trim()) return t('error_governorate_required');
    if (!state?.trim()) return t('error_wilayat_required');
    if (!location?.trim()) return t('error_location_required');
    if(managmentPhone?.trim()) return t('error_name_managment_phone_required');
    
    if(!lat.trim() || !lng.trim()) return t('error_location_required');
    if (workerPhone?.trim() && managmentPhone?.trim() &&
        managmentPhone.trim() === workerPhone.trim()) {

        return t('error_managment_phone_same_workeker_phone');
    }    // ── Financials ───────────────────────────────────────────────
    const minR = Number(minimumRent);
    const maxR = Number(maxRent);
    if (!minimumRent || isNaN(minR) || minR < 0) return t('error_min_rent_required');
    if (!maxRent || isNaN(maxR) || maxR < 0) return t('error_max_rent_required');
    if (maxR < minR) return t('error_rent_range_invalid');

    // ── Media ────────────────────────────────────────────────────
    if (!coverimg) return t('error_cover_required');
    if (!buldingImages || buldingImages.length === 0) return t('error_images_required');
    if (!buldingService || buldingService.length === 0) return t('error_services_required');
    
};

/**
 * Converts a File object to a base64 string for API upload.
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsDataURL(file);
    });
};