/**
 * Helper Functions for BuildingDetail Component
 */

/**
 * Get building ID from building object (handles nested structures)
 * @param {Object} building - Building object
 * @returns {string|null} - Building ID or null
 */
export const getBuildingId = (building) => {
    return building?.id || building?.raw?.id || null;
};

/**
 * Get cover image from building object
 * @param {Object} building - Building object
 * @returns {string|null} - Cover image URL or null
 */
export const getCoverImage = (building) => {
    return building?.coverImg || building?.raw?.coverimg || null;
};

/**
 * Get building images array from building object
 * @param {Object} building - Building object
 * @returns {Array} - Array of images
 */
export const getBuildingImages = (building) => {
    return (
        building?.images ||
        building?.raw?.buldingImages?.map((img) => ({
            id: img.id,
            url: img.path,
        })) ||
        []
    );
};

/**
 * Get building services array
 * @param {Object} building - Building object
 * @returns {Array} - Array of service names
 */
export const getBuildingServices = (building) => {
    return building?.services || building?.raw?.buldingService?.map((s) => s.serviceName) || [];
};

/**
 * Validate building data before operations
 * @param {Object} building - Building object to validate
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateBuilding = (building) => {
    if (!building) {
        return { isValid: false, error: 'Building data is missing' };
    }

    const id = getBuildingId(building);
    if (!id) {
        return { isValid: false, error: 'Building ID is missing' };
    }

    return { isValid: true, error: null };
};

/**
 * Merge updated building data with existing building
 * @param {Object} localBuilding - Current building state
 * @param {Object} updatedRaw - Updated raw data from API
 * @returns {Object} - Merged building object
 */
export const mergeUpdatedBuilding = (localBuilding, updatedRaw) => {
    return {
        ...localBuilding,
        id: localBuilding.id || localBuilding.raw?.id,
        nameAr: updatedRaw.nameAr,
        nameEn: updatedRaw.nameEn,
        isActive: updatedRaw.isActive,
        floors: updatedRaw.totalFloor,
        flats: updatedRaw.totalFlats,
        governorate: updatedRaw.gouvernate,
        wilayat: updatedRaw.state,
        address: updatedRaw.gouvernate,
        coverImg: updatedRaw.coverimg || localBuilding.coverImg,
        services: updatedRaw.buldingService?.map((s) => s.serviceName) || [],
        images: updatedRaw.buldingImages?.map((img) => ({ id: img.id, url: img.path })) || localBuilding.images,
        raw: { ...localBuilding.raw, ...updatedRaw },
    };
};

/**
 * Extract flat chips (badges showing flat details)
 * @param {Object} flat - Flat object
 * @param {Function} t - Translation function
 * @returns {Array} - Array of chip objects { icon, label }
 */
export const extractFlatChips = (flat, t) => {
    return [
        flat.bedsNumber && {
            icon: 'ti-bed',
            label: `${flat.bedsNumber} ${Number(flat.bedsNumber) > 1 ? t('beds') || 'beds' : t('bed') || 'bed'}`,
        },
        flat.bathroomsNumber && { icon: 'ti-bath', label: `${flat.bathroomsNumber} ${t('bath') || 'bath'}` },
        flat.balconiesNumber && { icon: 'ti-building', label: `${flat.balconiesNumber} ${t('balcony') || 'balcony'}` },
        flat.visitors_count && { icon: 'ti-users', label: `${t('up_to') || 'Up to'} ${flat.visitors_count}` },
        flat.flatFloor && { icon: 'ti-layers', label: `${t('floor') || 'Floor'} ${flat.flatFloor}` },
        flat.flatNumber && { icon: 'ti-hash', label: `${t('flat_number') || 'No.'} ${flat.flatNumber}` },
    ].filter(Boolean);
};

/**
 * Check if flat is available
 * @param {string} status - Flat status
 * @returns {boolean}
 */
export const isFlatAvailable = (status) => {
    return status === 'available';
};

/**
 * Get flat name from flat object
 * @param {Object} flat - Flat object
 * @param {number} index - Flat index in list
 * @returns {string} - Flat name
 */
export const getFlatName = (flat, index) => {
    return flat.nameEn || flat.nameAr || `Flat ${index + 1}`;
};

/**
 * Get flat description
 * @param {Object} flat - Flat object
 * @returns {string}
 */
export const getFlatDescription = (flat) => {
    return flat.descrptionEn || flat.descrptionAr || '';
};

/**
 * Format price with currency
 * @param {number} price - Price value
 * @returns {string} - Formatted price
 */
export const formatPrice = (price) => {
    return `OMR ${Number(price).toFixed(2)}`;
};

/**
 * Get unique key for flat card (stable, avoids react warnings)
 * @param {Object} flat - Flat object
 * @param {number} index - Flat index
 * @returns {string}
 */
export const getFlatCardKey = (flat, index) => {
    return `flat-${flat.id ?? index}`;
};

/**
 * Create Google Maps URL from coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} - Google Maps URL
 */
export const getGoogleMapsUrl = (lat, lng) => {
    return `https://maps.google.com/?q=${lat},${lng}`;
};

/**
 * Handle image error with optional logging
 * @param {Event} event - Image error event
 * @param {string} imagePath - Path of the image that failed
 * @param {string} context - Context for logging (e.g., 'cover', 'flat-card')
 */
export const handleImageError = (event, imagePath, context = 'image') => {
    if (event?.target) {
        event.target.style.display = 'none';
    }
};

/**
 * Check if data is a valid array response from API
 * @param {any} data - Data to check
 * @returns {Object} - { isArray: boolean, isEmpty: boolean, firstItem: any }
 */
export const checkApiResponse = (data) => {
    const isArray = Array.isArray(data);
    const isEmpty = isArray ? data.length === 0 : !data;
    const firstItem = isArray ? data[0] : data;

    return { isArray, isEmpty, firstItem };
};