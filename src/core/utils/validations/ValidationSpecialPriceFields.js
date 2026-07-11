/**
 * Validation utility for Special Price fields
 * Returns validation errors or null if valid
 */
export const validateSpecialPriceFields = (formData, t) => {
    const errors = {};

    // Start Date validation
    if (!formData.startDate || !formData.startDate.trim()) {
        errors.startDate = t('error_start_date_required') || 'Start date is required';
    }

    // End Date validation
    if (!formData.endDate || !formData.endDate.trim()) {
        errors.endDate = t('error_end_date_required') || 'End date is required';
    }

    // Price validation
    if (!formData.price && formData.price !== 0) {
        errors.price = t('error_price_required') || 'Price is required';
    } else if (Number(formData.price) < 0) {
        errors.price = t('error_price_must_be_positive') || 'Price must be positive or zero';
    }

    // Date range validation (start < end)
    if (formData.startDate && formData.endDate) {
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);

        if (startDate > endDate) {
            errors.startDate = t('error_date_range_invalid') || 'Start date must be before end date';
        }

        // Optional: Warn if dates are too far in the past
        const now = new Date();
        if (endDate < now) {
            errors.endDate = t('warning_date_in_past') || 'End date is in the past';
        }
    }

    // Return null if no errors, otherwise return error object
    return Object.keys(errors).length > 0 ? errors : null;
};