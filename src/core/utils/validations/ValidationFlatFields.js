/**
 * Validates required fields for the Add Flat form.
 * Returns a translation key string if validation fails, or null if all fields pass.
 */
export const validateFlatFields = ({
                                       nameAr,
                                       nameEn,
                                       count,
                                       price_per_night,
                                       weekend_price_per_night,
                                   }) => {
    // ── Names ────────────────────────────────────────────────────
    if (!nameAr?.trim()) return 'error_name_ar_required';
    if (!nameEn?.trim()) return 'error_name_en_required';

    // ── Count ────────────────────────────────────────────────────
    if (!count || Number(count) < 1) return 'error_count_required';

    // ── Pricing ──────────────────────────────────────────────────
    const base    = Number(price_per_night);
    const weekend = Number(weekend_price_per_night);
    if (!price_per_night || isNaN(base)    || base    < 0) return 'error_base_rate_required';
    if (!weekend_price_per_night || isNaN(weekend) || weekend < 0) return 'error_weekend_rate_required';

    return null; // All good ✅
};

/**
 * Converts a File object to a base64 string.
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsDataURL(file);
    });
};