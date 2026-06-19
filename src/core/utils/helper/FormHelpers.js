/**
 * Form Helper Functions for AddBuildingModal
 */

/**
 * Resolve owner ID from multiple sources
 * @param {number|string} ownerIdProp - Owner ID from props
 * @returns {number} - Resolved owner ID
 */
export const resolveOwnerId = (ownerIdProp) => {
    return Number(
        ownerIdProp ||
        localStorage.getItem('ownerId') ||
        localStorage.getItem('userId') ||
        localStorage.getItem('user_id') ||
        0
    );
};

/**
 * Format unit type for display
 * @param {Object} unit - Unit object
 * @param {boolean} isRTL - Is right-to-left language
 * @returns {string} - Formatted unit name
 */
export const formatUnitName = (unit, isRTL) => {
    if (isRTL) return unit.ar;
    return unit.en.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

/**
 * Build form data object for API submission
 * @param {Object} formState - All form state values
 * @param {string} coverimg - Cover image URL from upload
 * @param {Array} buldingImages - Building images array
 * @param {Array} selectedUnits - Selected unit types
 * @param {Object} checkedAmenities - Checked amenities
 * @param {number} resolvedOwnerId - Owner ID
 * @returns {Object} - Formatted form data for API
 */
export const buildFormData = (
    formState,
    coverimg,
    buldingImages,
    selectedUnits,
    checkedAmenities,
    resolvedOwnerId
) => {
    // Amenity service map
    const AMENITY_SERVICE_MAP = {
        sec_24: 'Security 24/7',
        wifi: 'WiFi',
        parking: 'Parking',
        elevator: 'Elevator',
        ac: 'Air Conditioning',
        gym: 'Gym',
        pool: 'Swimming Pool',
        power: 'Power Backup',
        cctv: 'CCTV',
    };

    const buildingFlatType = selectedUnits.map(unit => ({
        id: 0,
        typeId: unit.id,
        hotelbuildingID: 0
    }));

    const buldingService = Object.entries(checkedAmenities)
        .filter(([, v]) => v)
        .map(([key]) => ({
            id: 0,
            serviceName: AMENITY_SERVICE_MAP[key] || key,
            hotelbuildingID: 0
        }));

    const buildingPayment_methods = [
        { id: 0, type: 'online', hotelbuildingID: 0 },
        ...(formState.acceptDownPay ? [{ id: 0, type: 'partial', hotelbuildingID: 0 }] : []),
    ];

    return {
        nameAr: formState.nameAr,
        nameEn: formState.nameEn,
        totalFloor: formState.totalFloor,
        totalFlats: formState.totalFlats,
        yearBulit: formState.yearBulit,
        buldinNumber: formState.buldinNumber,
        buldingDescrptionAr: formState.buldingDescrptionAr,
        buldingDescrptionEn: formState.buldingDescrptionEn,
        additional_detailsAr: formState.additional_detailsAr,
        additional_detailsEn: formState.additional_detailsEn,
        minimumRent: formState.minimumRent,
        maxRent: formState.maxRent,
        minDays: formState.minDays,
        gouvernate: formState.gouvernate,
        state: formState.state,
        location: formState.location,
        lat: formState.lat,
        lng: formState.lng,
        nearTo: formState.nearTo,
        managmentPhone: formState.managmentPhone,
        workerPhone: formState.workerPhone,
        buildingPolicyAr: formState.buildingPolicyAr,
        buildingPolicyEn: formState.buildingPolicyEn,
        cancelation_policyAr: formState.cancelation_policyAr,
        cancelation_policyEn: formState.cancelation_policyEn,
        onlinePay: true,
        acceptDownPay: formState.acceptDownPay,
        isExclusive: formState.isExclusive,
        check_In: formState.check_In,
        check_Out: formState.check_Out,
        coverimg,
        buldingImages,
        buildingFlatType,
        buldingService,
        buildingPayment_methods,
        ownerId: resolvedOwnerId,
        isActive: true,
        isDeleted: false,
        stopBook: false,
        bulidstatus: 0,
        value1: '',
        value2: '',
        value3: '',
    };
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {string} type - Image type ('cover' or 'gallery')
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateImageFile = (file, type = 'gallery') => {
    if (!file) return { isValid: false, error: 'No file selected' };

    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!validTypes.includes(file.type)) {
        return { isValid: false, error: 'Invalid image format. Use JPEG, PNG, or WebP.' };
    }

    if (file.size > maxSize) {
        return { isValid: false, error: `Image too large. Max size: 5MB. Type: ${type}` };
    }

    return { isValid: true };
};

/**
 * Parse file upload response
 * @param {string} responseString - JSON string response from API
 * @returns {Object} - { success: boolean, url: string, error: string }
 */
export const parseFileUploadResponse = (responseString, baseUrl = 'https://shleeh.com/') => {
    try {
        const response = JSON.parse(responseString);

        if (response && response.status) {
            const cleanPath = baseUrl + response.message.replace(/^\//, '');
            return { success: true, url: cleanPath };
        }

        return { success: false, error: 'Upload returned unsuccessful status' };
    } catch (error) {
        return { success: false, error: `Failed to parse upload response: ${error.message}` };
    }
};

/**
 * EditBuildingHelpers
 * Reusable helper functions for editing buildings
 */

/**
 * Initialize checked amenities from existing building services
 * Converts service names back to amenity keys
 *
 * @param {Array} buildingServices - Array of service names from API
 * @param {Object} SERVICE_TO_KEY - Mapping of service names to amenity keys
 * @returns {Object} Object with amenity keys as keys, boolean values
 */
export const initAmenities = (buildingServices, SERVICE_TO_KEY) => {
    const checked = {};
    (buildingServices || []).forEach(serviceName => {
        const key = SERVICE_TO_KEY[serviceName];
        if (key) checked[key] = true;
    });
    return checked;
};

/**
 * Initialize unit types from building flat type data
 * Deduplicates by typeId (keeps only first occurrence of each type)
 *
 * @param {Array} buildingFlatType - Raw building flat type data
 * @param {Array} UNIT_TYPES - Reference unit types array
 * @returns {Array} Deduplicated array of unit type objects
 */
export const initUnits = (buildingFlatType, UNIT_TYPES) => {
    const rawData = buildingFlatType || [];
    if (rawData.length === 0) return [];

    const unitMap = new Map();
    rawData.forEach(ft => {
        if (!unitMap.has(ft.typeId)) {
            const unit = UNIT_TYPES.find(u => u.id === ft.typeId);
            if (unit) unitMap.set(ft.typeId, { ...unit });
        }
    });

    console.log('[initUnits] Raw records:', rawData.length);
    console.log('[initUnits] Unique typeIds:', unitMap.size);
    console.log('[initUnits] Duplicates removed:', rawData.length - unitMap.size);

    return Array.from(unitMap.values());
};

/**
 * Safely get building ID from various sources
 * Handles: building.id, building.raw.id, fallback to 0
 *
 * @param {Object} building - Building object from API
 * @returns {number} Building ID or 0 if not found
 */
export const getBuildingId = (building) => {
    return building?.id || building?.raw?.id || 0;
};

/**
 * Initialize existing images from building data
 * Prepares images for display in gallery
 *
 * @param {Array} buldingImages - Raw building images from API
 * @returns {Array} Array of image objects with id, path, and url
 */
export const initExistingImages = (buldingImages) => {
    return (buldingImages || []).map(img => ({
        id: img.id,
        path: img.path,
        url: img.path
    }));
};

/**
 * Initialize check-in/check-out times from building data
 * Extracts HH:mm format from API response (which includes seconds)
 *
 * @param {string} timeString - Time string from API (HH:mm:ss format or HH:mm)
 * @param {string} defaultTime - Default time if not provided
 * @returns {string} Time in HH:mm format
 */
export const initTime = (timeString, defaultTime) => {
    if (!timeString) return defaultTime;
    return timeString.slice(0, 5); // Extract HH:mm
};