/**
 * buildingApiClient
 *
 * Complete API Client for Building, Flat, Special Prices, Bookings, and Blocked Days
 *
 * Architecture: API Layer
 * - All HTTP requests
 * - Authentication handling
 * - Date formatting
 * - Error handling
 * - Logging
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Handle API response
 * @private
 */
const _handleResponse = async (response, methodName) => {
    let data;
    const contentType = response.headers.get('content-type') || '';
    try {
        data = contentType.includes('application/json')
            ? await response.json()
            : await response.text();
    } catch {
        data = '(could not parse response body)';
    }

    if (!response.ok) {
        console.error(`[buildingApiClient] ${methodName} ${response.status} ${response.statusText}`, data);
        throw new Error(
            typeof data === 'string'
                ? data
                : data?.title || data?.message || `HTTP ${response.status}`
        );
    }

    console.log(`[buildingApiClient] ${methodName} success →`, data);
    return data;
};

/**
 * Get authorization headers with Bearer token
 * @private
 */
const _getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

/**
 * Format date from YYYY-MM-DD to MM/DD/YYYY
 * @private
 */
const _formatDateToMMDDYYYY = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};

/**
 * Format array of dates from YYYY-MM-DD to MM/DD/YYYY
 * @private
 */
const _formatDatesToMMDDYYYY = (dates) => {
    return dates.map(date => _formatDateToMMDDYYYY(date));
};

/**
 * Get API URL from environment or use default
 * @private
 */
const _getApiUrl = () => {
    return import.meta.env.VITE_API_URL || 'https://shleeh.com';
};

export const buildingApiClient = {
    // ============ BUILDING ENDPOINTS ============

    /**
     * Add a new building
     */
    async postAddBuilding(payload) {
        console.log('[buildingApiClient] POST payload →', JSON.stringify(payload, null, 2));
        const API_URL = _getApiUrl();

        const response = await fetch(API_URL + `/api/Owners/AddHotelbuilding`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify(payload),
        });
        return await _handleResponse(response, 'postAddBuilding');
    },

    /**
     * Update an existing building
     */
    async putUpdateBuilding(payload) {
        console.log('[buildingApiClient] POST update payload →', JSON.stringify(payload, null, 2));
        const API_URL = _getApiUrl();

        const response = await fetch(API_URL + `/api/Owners/UpdateHotelbuilding`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify(payload),
        });
        return await _handleResponse(response, 'putUpdateBuilding');
    },

    /**
     * Get all buildings for logged-in owner
     */
    async getOwnerBuildings() {
        const API_URL = _getApiUrl();

        const response = await fetch(API_URL + `/api/Owners/GetHotelbuildingListbyOwner`, {
            method: 'GET',
            headers: _getHeaders(),
        });
        return await _handleResponse(response, 'getOwnerBuildings');
    },

    // ============ TODAY'S OFFER ENDPOINTS ============
    // Dedicated owner-panel endpoints (see TODAY-OFFER-API-SPEC.md Part 5) —
    // separate from the general building update/detail above, so saving the
    // offer doesn't need the full ~30-field building payload rebuilt each
    // time. Paths are backend's proposed names pending final confirmation.

    /** Get a building's current Today's Offer settings (including live todayOfferActive). */
    async getTodayOffer(buildingId) {
        const API_URL = _getApiUrl();
        // Confirmed via Swagger: shares the same query param name as the
        // chalet endpoint (`BuldingId`), not HotelbuildingId.
        const response = await fetch(API_URL + `/api/Owners/GetHotelBuildingTodayOffer?BuldingId=${buildingId}`, {
            method: 'GET',
            headers: _getHeaders(),
        });
        return await _handleResponse(response, 'getTodayOffer');
    },

    /** Update a building's Today's Offer settings. payload: { hotelbuildingId, todayOfferEnabled, todayOfferPercent, todayOfferTriggerHour } */
    async putUpdateTodayOffer(payload) {
        const API_URL = _getApiUrl();
        const response = await fetch(API_URL + `/api/Owners/UpdateHotelBuildingTodayOffer`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify(payload),
        });
        return await _handleResponse(response, 'putUpdateTodayOffer');
    },

    // ============ FLAT ENDPOINTS ============

    /**
     * Add a new flat to a building
     */
    async postAddFlat(payload) {
        console.log('[buildingApiClient] POST payload →', JSON.stringify(payload, null, 2));
        const API_URL = _getApiUrl();

        const response = await fetch(API_URL + `/api/Owners/AddFlat`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify(payload),
        });
        return await _handleResponse(response, 'postAddFlat');
    },

    /**
     * Update an existing flat
     */
    async putUpdateFlat(payload) {
        console.log('[buildingApiClient] POST update payload →', JSON.stringify(payload, null, 2));
        const API_URL = _getApiUrl();

        const response = await fetch(API_URL + `/api/Owners/UpdateFlat`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify(payload),
        });
        return await _handleResponse(response, 'putUpdateFlat');
    },

    /**
     * Get all flats for a building
     */
    async getOwnerBuildingsFlat(buildingId) {
        const API_URL = _getApiUrl();

        const response = await fetch(API_URL + `/api/Owners/GetFlatListbyBulidingId?id=${buildingId}`, {
            method: 'GET',
            headers: _getHeaders(),
        });
        return await _handleResponse(response, 'getOwnerBuildingsFlat');
    },

    /**
     * Get single flat data
     */
    async getOwnerFlat(flatId) {
        const API_URL = _getApiUrl();

        const response = await fetch(API_URL + `/api/FlatsCustomer/GetFlatData?FlatId=${flatId}`, {
            method: 'GET',
            headers: _getHeaders(),
        });
        return await _handleResponse(response, 'getOwnerFlat');
    },

    // ============ SPECIAL PRICES ENDPOINTS ============

    /**
     * Get all special prices for a flat (buildingID = flatId)
     * GET /api/Owners/GetBuildingPrices?BuldingId={flatId}
     */
    async getSpecialPrices(flatId) {
        console.log('[buildingApiClient] GET special prices for flatId:', flatId);
        const API_URL = _getApiUrl();

        const response = await fetch(API_URL + `/api/Owners/GetFlatSpcialPrices?FlatID=${flatId}`, {
            method: 'GET',
            headers: _getHeaders(),
        });
        return await _handleResponse(response, 'getSpecialPrices');
    },

    /**
     * Add or update a special price range
     * POST /api/Owners/AddBuildingPrices
     *
     * @param {Object} payload - { id, type, startDate, endDate, day, price, buildingID (flatId) }
     */
    async postSpecialPrice(payload) {
        console.log('[buildingApiClient] POST special price payload →', JSON.stringify(payload, null, 2));
        const API_URL = _getApiUrl();

        const response = await fetch(API_URL + `/api/Owners/AddFlatSpcialPrices`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify(payload),
        });
        return await _handleResponse(response, 'postSpecialPrice');
    },

    /**
     * Delete a special price range by ID
     * GET /api/Owners/DeleteBuildingPrices?id={priceId}
     *
     * @param {number} priceId - The ID of the price range to delete
     */
    async deleteSpecialPrice(priceId) {
        console.log('[buildingApiClient] DELETE special price id:', priceId);
        const API_URL = _getApiUrl();

        const response = await fetch(API_URL + `/api/Owners/DeleteFlatSpcialPrices?id=${priceId}`, {
            method: 'GET',
            headers: _getHeaders(),
        });
        return await _handleResponse(response, 'deleteSpecialPrice');
    },

    // ============ BOOKINGS ENDPOINTS ============

    /**
     * Get bookings for a flat (paginated list)
     * POST /api/Owners/GetHotelOwnerBookingListByFlat
     *
     * @param {number} flatId - The flat ID
     * @param {number} page - Page number (default: 1)
     * @param {number} pageSize - Items per page (default: 100)
     */
    async getBookings(flatId, page = 1, pageSize = 100) {
        if (!flatId) {
            throw new Error('Flat ID is required');
        }

        const API_URL = _getApiUrl();

        console.log('[buildingApiClient] Fetching bookings:', { flatId, page, pageSize });

        const requestBody = {
            page: page,
            pageSize: pageSize,
            flatId: flatId,
        };

        console.log('[buildingApiClient] POST bookings request body:', requestBody);

        const response = await fetch(API_URL + '/api/Owners/GetHotelOwnerBookingListByFlat', {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify(requestBody),
        });

        console.log('[buildingApiClient] getBookings response status:', response.status);

        return await _handleResponse(response, 'getBookings');
    },

    /**
     * Get single booking details by booking ID
     * GET /api/FlatsCustomer/GetBookingDetailes?bookingID={bookingId}
     *
     * @param {number} bookingId - The booking ID
     * @returns {Promise<Object>} { status, message: { id, name, phone, coast, noOFDays, insuranceamount, paidamount, hotelbuildingBookingDays } }
     */
    async getBookingDetails(bookingId) {
        if (!bookingId) {
            throw new Error('Booking ID is required');
        }

        const API_URL = _getApiUrl();
        console.log('[buildingApiClient] GET booking details for ID:', bookingId);

        const response = await fetch(API_URL + `/api/FlatsCustomer/GetBookingDetailes?bookingID=${bookingId}`, {
            method: 'GET',
            headers: _getHeaders(),
        });

        console.log('[buildingApiClient] getBookingDetails response status:', response.status);

        return await _handleResponse(response, 'getBookingDetails');
    },

    /**
     * Get bookings for a flat (alternative endpoint)
     * GET /api/FlatsCustomer/GetFlatBookings?flatID={flatId}
     *
     * @param {number} flatId - The flat ID
     * @param {number} page - Page number (default: 1)
     * @param {number} pageSize - Items per page (default: 100)
     */
    async getBookingsByFlatId(flatId, page = 1, pageSize = 100) {
        if (!flatId) {
            throw new Error('Flat ID is required');
        }

        const API_URL = _getApiUrl();
        console.log('[buildingApiClient] GET bookings for flatId:', flatId, 'page:', page);

        const response = await fetch(
            API_URL + `/api/FlatsCustomer/GetFlatBookings?flatID=${flatId}&page=${page}&pageSize=${pageSize}`,
            {
                method: 'GET',
                headers: _getHeaders(),
            }
        );

        console.log('[buildingApiClient] getBookingsByFlatId response status:', response.status);

        return await _handleResponse(response, 'getBookingsByFlatId');
    },

    /**
     * Update booking status
     * POST /api/FlatsCustomer/UpdateBookingStatus
     *
     * @param {number} bookingId - Booking ID
     * @param {string} status - New status
     */
    async updateBookingStatus(bookingId, status) {
        if (!bookingId || !status) {
            throw new Error('Booking ID and status are required');
        }

        const API_URL = _getApiUrl();
        console.log('[buildingApiClient] POST update booking status:', { bookingId, status });

        const response = await fetch(API_URL + `/api/FlatsCustomer/UpdateBookingStatus`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify({
                bookingID: bookingId,
                status: status,
            }),
        });

        return await _handleResponse(response, 'updateBookingStatus');
    },

    /**
     * Cancel a booking
     * POST /api/FlatsCustomer/CancelBooking
     *
     * @param {number} bookingId - Booking ID
     * @param {string} reason - Cancellation reason
     */
    async cancelBooking(bookingId, reason = '') {
        if (!bookingId) {
            throw new Error('Booking ID is required');
        }

        const API_URL = _getApiUrl();
        console.log('[buildingApiClient] POST cancel booking:', { bookingId, reason });

        const response = await fetch(API_URL + `/api/FlatsCustomer/CancelBooking`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify({
                bookingID: bookingId,
                reason: reason,
            }),
        });

        return await _handleResponse(response, 'cancelBooking');
    },

    // ============ BLOCKED DAYS ENDPOINTS ============

    /**
     * Get all blocked days for a flat
     * GET /api/Owners/GetFlatNotAllowDays?FlatId={flatId}
     *
     * @param {number} flatId - The flat ID
     */
    async getBlockedDays(flatId) {
        if (!flatId) {
            throw new Error('Flat ID is required');
        }

        const API_URL = _getApiUrl();

        console.log('[buildingApiClient] Fetching blocked days for flatId:', flatId);

        const response = await fetch(API_URL + `/api/Owners/GetFlatNotAllowDays?FlatId=${flatId}`, {
            method: 'GET',
            headers: _getHeaders(),
        });

        console.log('[buildingApiClient] getBlockedDays response status:', response.status);

        // Log the raw body without consuming the stream _handleResponse needs.
        response.clone().text()
            .then(text => console.log('[buildingApiClient] getBlockedDays raw response body:', text))
            .catch(() => {});

        return await _handleResponse(response, 'getBlockedDays');
    },

    /**
     * Block one or more days for a flat
     * POST /api/Owners/AddFlatNotAllowDays
     *
     * @param {Object} payload - { buildingID (flatId), days: string[] }
     *                           days format: ["2026-06-28", ...] (YYYY-MM-DD)
     *                           Will be converted to MM/DD/YYYY for API
     */

    async addBlockedDays(payload) {
        console.log('='.repeat(60));
        console.log('[buildingApiClient] addBlockedDays - START');

        console.log('[buildingApiClient] Validating payload...');
        console.log('[buildingApiClient] payload:', payload);
        console.log('[buildingApiClient] payload.buildingID:', payload?.buildingID);
        console.log('[buildingApiClient] payload.days:', payload?.days);
        console.log('[buildingApiClient] Is days array?', Array.isArray(payload?.days));
        console.log('[buildingApiClient] Days length:', payload?.days?.length);

        if (!payload?.buildingID || !Array.isArray(payload?.days) || payload.days.length === 0) {
            console.error('[buildingApiClient] ❌ Validation failed!');
            throw new Error('Building ID and days array are required');
        }
        console.log('[buildingApiClient] ✅ Payload validation passed');

        // days is already [{ day: 'DD/MM/YYYY', unitsCount }] — send as-is.
        const apiPayload = {
            buldingID: payload.buildingID,
            days: payload.days,
        };
        console.log('[buildingApiClient] API Payload:', apiPayload);

        const API_URL = _getApiUrl();
        const token = localStorage.getItem('token');

        console.log('[buildingApiClient] API_URL:', API_URL);
        console.log('[buildingApiClient] Token exists:', !!token);

        const endpoint = API_URL + '/api/Owners/AddFlatNotAllowDays';
        const headers = _getHeaders();
        const body = JSON.stringify(apiPayload);

        console.log('[buildingApiClient] 🚀 Making API request...');
        console.log('[buildingApiClient] Endpoint:', endpoint);
        console.log('[buildingApiClient] Method: POST');
        console.log('[buildingApiClient] Body (to be sent):', body);
        console.log('='.repeat(60));

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: body,
            });

            console.log('='.repeat(60));
            console.log('[buildingApiClient] 📥 Response received');
            console.log('[buildingApiClient] Response status:', response.status);
            console.log('[buildingApiClient] Response statusText:', response.statusText);

            const responseText = await response.text();
            console.log('[buildingApiClient] Response text:', responseText);

            let responseData;
            try {
                responseData = JSON.parse(responseText);
                console.log('[buildingApiClient] Response JSON:', responseData);
            } catch (parseErr) {
                console.warn('[buildingApiClient] ⚠️ Could not parse response as JSON');
                responseData = responseText;
            }

            if (response.ok) {
                console.log('[buildingApiClient] ✅ Success! Status 2xx');
                console.log('='.repeat(60));
                return responseData;
            } else {
                console.error('[buildingApiClient] ❌ Error! Status:', response.status);
                console.error('[buildingApiClient] Error response:', responseData);
                console.log('='.repeat(60));
                throw new Error(responseData?.message || `HTTP ${response.status}`);
            }
        } catch (err) {
            console.error('[buildingApiClient] ❌ Exception thrown!');
            console.error('[buildingApiClient] Error:', err.message);
            console.log('='.repeat(60));
            throw err;
        }
    },    /**
     * Remove blocked days for a flat
     * POST /api/Owners/RemoveFlatNotAllowDays
     *
     * @param {Object} payload - { buildingID (flatId), days: string[] }
     *                           days format: ["2026-06-28", ...] (YYYY-MM-DD)
     *                           Will be converted to MM/DD/YYYY for API
     */
    async removeBlockedDays(payload) {
        console.log('='.repeat(60));
        console.log('[buildingApiClient] removeBlockedDays - START');

        // Validate payload
        console.log('[buildingApiClient] Validating payload...');
        console.log('[buildingApiClient] payload (before date conversion):', payload);
        console.log('[buildingApiClient] payload.buildingID:', payload?.buildingID);
        console.log('[buildingApiClient] payload.days:', payload?.days);
        console.log('[buildingApiClient] Is days array?', Array.isArray(payload?.days));
        console.log('[buildingApiClient] Days length:', payload?.days?.length);

        if (!payload?.buildingID || !Array.isArray(payload?.days) || payload.days.length === 0) {
            console.error('[buildingApiClient] ❌ Validation failed!');
            throw new Error('Building ID and days array are required');
        }
        console.log('[buildingApiClient] ✅ Payload validation passed');

        // Convert date format from YYYY-MM-DD to MM/DD/YYYY
        const formattedDays = _formatDatesToMMDDYYYY(payload.days);
        console.log('[buildingApiClient] Original dates (YYYY-MM-DD):', payload.days);
        console.log('[buildingApiClient] Formatted dates (MM/DD/YYYY):', formattedDays);

        // Create payload with formatted dates
        const apiPayload = {
            buildingID: payload.buildingID,
            days: formattedDays,
        };
        console.log('[buildingApiClient] API Payload (formatted):', apiPayload);

        const API_URL = _getApiUrl();
        const token = localStorage.getItem('token');

        console.log('[buildingApiClient] API_URL:', API_URL);
        console.log('[buildingApiClient] Token exists:', !!token);

        const endpoint = API_URL + '/api/Owners/RemoveFlatNotAllowDays';
        const headers = _getHeaders();
        const body = JSON.stringify(apiPayload);

        console.log('[buildingApiClient] 🚀 Making API request...');
        console.log('[buildingApiClient] Endpoint:', endpoint);
        console.log('[buildingApiClient] Method: POST');
        console.log('[buildingApiClient] Body (to be sent):', body);
        console.log('='.repeat(60));

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: body,
            });

            console.log('='.repeat(60));
            console.log('[buildingApiClient] 📥 Response received');
            console.log('[buildingApiClient] Response status:', response.status);
            console.log('[buildingApiClient] Response statusText:', response.statusText);

            const responseText = await response.text();
            console.log('[buildingApiClient] Response text:', responseText);

            // Try to parse as JSON
            let responseData;
            try {
                responseData = JSON.parse(responseText);
                console.log('[buildingApiClient] Response JSON:', responseData);
            } catch (parseErr) {
                console.warn('[buildingApiClient] ⚠️ Could not parse response as JSON');
                responseData = responseText;
            }

            // Handle response
            if (response.ok) {
                console.log('[buildingApiClient] ✅ Success! Status 2xx');
                console.log('='.repeat(60));
                return responseData;
            } else {
                console.error('[buildingApiClient] ❌ Error! Status:', response.status);
                console.error('[buildingApiClient] Error response:', responseData);
                console.log('='.repeat(60));
                throw new Error(responseData?.message || `HTTP ${response.status}`);
            }
        } catch (err) {
            console.error('[buildingApiClient] ❌ Exception thrown!');
            console.error('[buildingApiClient] Error:', err.message);
            console.log('='.repeat(60));
            throw err;
        }
    },
};

export default buildingApiClient;