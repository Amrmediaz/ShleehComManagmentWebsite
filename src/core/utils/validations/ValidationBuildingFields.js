/**
 * Validates all required fields for the Add Building form.
 * Returns a translation key string if validation fails, or null if all fields pass.
 */
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
                                       }) => {
    // ── Basic Info ──────────────────────────────────────────────
    if (!nameAr?.trim()) return 'error_name_ar_required';
    if (!nameEn?.trim()) return 'error_name_en_required';

    const year = Number(yearBulit);
    if (!yearBulit || isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
        return 'error_year_invalid';
    }

    if (!totalFloor || Number(totalFloor) < 1) return 'error_floors_required';
    if (!totalFlats || Number(totalFlats) < 1) return 'error_flats_required';

    // ── Unit Types ───────────────────────────────────────────────
    if (!buildingFlatType || buildingFlatType.length === 0) return 'error_unit_type_required';

    // ── Location ────────────────────────────────────────────────
    if (!gouvernate?.trim()) return 'error_governorate_required';
    if (!state?.trim()) return 'error_wilayat_required';
    if (!location?.trim()) return 'error_location_required';

    // ── Financials ───────────────────────────────────────────────
    const minR = Number(minimumRent);
    const maxR = Number(maxRent);
    if (!minimumRent || isNaN(minR) || minR < 0) return 'error_min_rent_required';
    if (!maxRent || isNaN(maxR) || maxR < 0) return 'error_max_rent_required';
    if (maxR < minR) return 'error_rent_range_invalid';

    // ── Media ────────────────────────────────────────────────────
    if (!coverimg) return 'error_cover_required';

    return null; // All good ✅
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