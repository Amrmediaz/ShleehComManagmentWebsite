/**
 * chaletApiClient
 *
 * Complete API Client for Chalets, Chalet Prices, Bookings, and Blocked Days.
 * Talks to the same backend surface as the "chaletowner" mobile app
 * (chalets are a standalone rentable property — NOT tied to a Hotelbuilding/Flat).
 *
 * Architecture: API Layer — mirrors buildingApiClient.js conventions.
 */

const _getApiUrl = () => import.meta.env.VITE_API_URL || 'https://shleeh.com';

const _getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

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
        console.error(`[chaletApiClient] ${methodName} ${response.status} ${response.statusText}`, data);
        throw new Error(
            typeof data === 'string'
                ? data
                : data?.title || data?.message || `HTTP ${response.status}`
        );
    }

    console.log(`[chaletApiClient] ${methodName} success →`, data);
    return data;
};

export const chaletApiClient = {
    // ============ CHALET ENDPOINTS ============

    /** Get all chalets for the logged-in owner. */
    async getOwnerChalets() {
        const API_URL = _getApiUrl();
        const response = await fetch(API_URL + `/api/Owners/GetBuildingList`, {
            method: 'GET',
            headers: _getHeaders(),
        });
        return await _handleResponse(response, 'getOwnerChalets');
    },

    /** Get a single chalet's full details. */
    async getChaletDetails(chaletId) {
        const API_URL = _getApiUrl();
        const response = await fetch(API_URL + `/api/Owners/GetBuildingDetailes?BuldingId=${chaletId}`, {
            method: 'GET',
            headers: _getHeaders(),
        });
        return await _handleResponse(response, 'getChaletDetails');
    },

    /** Add a new chalet. */
    async postAddChalet(payload) {
        const API_URL = _getApiUrl();
        const response = await fetch(API_URL + `/api/Owners/AddBuilding`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify(payload),
        });
        return await _handleResponse(response, 'postAddChalet');
    },

    /** Update an existing chalet. */
    async putUpdateChalet(payload) {
        const API_URL = _getApiUrl();
        const response = await fetch(API_URL + `/api/Owners/UpdateBuilding`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify(payload),
        });
        return await _handleResponse(response, 'putUpdateChalet');
    },

    // ============ TODAY'S OFFER ENDPOINTS ============
    // Dedicated owner-panel endpoints (see TODAY-OFFER-API-SPEC.md Part 5) —
    // separate from the general chalet update/detail above, so saving the
    // offer doesn't need the full ~25-field chalet payload rebuilt each
    // time. Paths are backend's proposed names pending final confirmation.

    /** Get a chalet's current Today's Offer settings (including live todayOfferActive). */
    async getTodayOffer(chaletId) {
        const API_URL = _getApiUrl();
        const response = await fetch(API_URL + `/api/Owners/GetTodayOffer?BuldingId=${chaletId}`, {
            method: 'GET',
            headers: _getHeaders(),
        });
        return await _handleResponse(response, 'getTodayOffer');
    },

    /** Update a chalet's Today's Offer settings. payload: { buldingId, todayOfferEnabled, todayOfferPercent, todayOfferTriggerHour } */
    async putUpdateTodayOffer(payload) {
        const API_URL = _getApiUrl();
        const response = await fetch(API_URL + `/api/Owners/UpdateTodayOffer`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify(payload),
        });
        return await _handleResponse(response, 'putUpdateTodayOffer');
    },

    // ============ SPECIAL PRICES ENDPOINTS ============

    /** Get all special price rules for a chalet. */
    async getChaletPrices(chaletId) {
        const API_URL = _getApiUrl();
        const response = await fetch(API_URL + `/api/Owners/GetBuildingPrices?BuldingId=${chaletId}`, {
            method: 'GET',
            headers: _getHeaders(),
        });
        return await _handleResponse(response, 'getChaletPrices');
    },

    /**
     * Add a special price rule.
     * payload: { type: 1|2, day?, startDate?, endDate?, price, buildingID }
     * type 1 = recurring weekday, type 2 = date range
     */
    async postChaletPrice(payload) {
        const API_URL = _getApiUrl();
        const response = await fetch(API_URL + `/api/Owners/AddBuildingPrices`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify(payload),
        });
        return await _handleResponse(response, 'postChaletPrice');
    },

    /** Update an existing special price rule (payload must include id). */
    async putChaletPrice(payload) {
        const API_URL = _getApiUrl();
        const response = await fetch(API_URL + `/api/Owners/UpdateBuildingPrices`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify(payload),
        });
        return await _handleResponse(response, 'putChaletPrice');
    },

    /** Delete a special price rule by id. */
    async deleteChaletPrice(priceId) {
        const API_URL = _getApiUrl();
        const response = await fetch(API_URL + `/api/Owners/DeleteBuildingPrices?Id=${priceId}`, {
            method: 'GET',
            headers: _getHeaders(),
        });
        return await _handleResponse(response, 'deleteChaletPrice');
    },

    // ============ BLOCKED / AVAILABILITY DAYS ENDPOINTS ============

    /** Days the OWNER has blocked (editable subset). Returns { status, message: { days: ["DD/MM/YYYY", …] } }. */
    async getChaletBlockedDays(chaletId) {
        const API_URL = _getApiUrl();
        const response = await fetch(API_URL + `/api/Owners/GetBuildingNotAllowDays?BuldingId=${chaletId}`, {
            method: 'GET',
            headers: _getHeaders(),
        });
        return await _handleResponse(response, 'getChaletBlockedDays');
    },

    /** ALL unavailable days — customer bookings AND owner-blocked days combined. Returns { status, message: ["DD/MM/YYYY", …] }. */
    async getChaletBookingDays(chaletId) {
        const API_URL = _getApiUrl();
        const response = await fetch(API_URL + `/api/CustomerData/GetBookingDays`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify({ buildingId: chaletId }),
        });
        return await _handleResponse(response, 'getChaletBookingDays');
    },

    /**
     * Replace the FULL set of owner-blocked days for a chalet (not additive — send the whole list).
     * payload: { buldingID, days: ["DD/MM/YYYY", …] }
     */
    async setChaletBlockedDays(payload) {
        const API_URL = _getApiUrl();
        const response = await fetch(API_URL + `/api/Owners/AddBuildingNotAllowDays`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify(payload),
        });
        return await _handleResponse(response, 'setChaletBlockedDays');
    },

    // ============ BOOKINGS ENDPOINTS ============

    /**
     * Get bookings across ALL of the owner's chalets (paginated).
     * Returns { status, message: { results: [...], currentPage, pageCount, pageSize, rowCount } }
     */
    async getOwnerChaletBookings(page = 1, pageSize = 20) {
        const API_URL = _getApiUrl();
        const response = await fetch(API_URL + `/api/Owners/GetOwnerBookingList`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify({ page, pageSize }),
        });
        return await _handleResponse(response, 'getOwnerChaletBookings');
    },

    /** Get a single booking's full details (includes which chalet via buildingID). */
    async getChaletBookingDetails(bookingId) {
        const API_URL = _getApiUrl();
        const response = await fetch(API_URL + `/api/CustomerData/GetBookingDetailes?bookingID=${bookingId}`, {
            method: 'GET',
            headers: _getHeaders(),
        });
        return await _handleResponse(response, 'getChaletBookingDetails');
    },
};

export default chaletApiClient;
