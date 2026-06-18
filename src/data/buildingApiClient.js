const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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

const _getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const buildingApiClient = {
    async postAddBuilding(payload) {
        console.log('[buildingApiClient] POST payload →', JSON.stringify(payload, null, 2));
        const API_URL = import.meta.env.VITE_API_URL || 'https://shleeh.com';

        const response = await fetch(API_URL+`/api/Owners/AddHotelbuilding`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify(payload),
        });
        return await _handleResponse(response, 'postAddBuilding');
    },
    async postAddFlat(payload) {
        console.log('[buildingApiClient] POST payload →', JSON.stringify(payload, null, 2));
        const API_URL = import.meta.env.VITE_API_URL || 'https://shleeh.com';

        const response = await fetch(API_URL+`/api/Owners/AddFlat`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify(payload),
        });
        return await _handleResponse(response, 'postAddFlat');
    },

    async getOwnerBuildings() {
        const API_URL = import.meta.env.VITE_API_URL || 'https://shleeh.com';

        const response = await fetch(API_URL+`/api/Owners/GetHotelbuildingListbyOwner`, {
            method: 'GET',
            headers: _getHeaders(),
        });
        return await _handleResponse(response, 'getOwnerBuildings');
    },
    async getOwnerBuildingsFlat(buildingId) {
        const API_URL = import.meta.env.VITE_API_URL || 'https://shleeh.com';

        const response = await fetch(API_URL+`/api/Owners/GetFlatListbyBulidingId?id=${buildingId}`, {
            method: 'GET',
            headers: _getHeaders(),
        });
        return await _handleResponse(response, 'getOwnerBuildingsFlat');
    },
    async getOwnerFlat(flatId) {
        const API_URL = import.meta.env.VITE_API_URL || 'https://shleeh.com';

        const response = await fetch(API_URL+`/api/FlatsCustomer/GetFlatData?FlatId=${flatId}`, {
            method: 'GET',
            headers: _getHeaders(),
        });
        return await _handleResponse(response, 'getOwnerFlat');
    },
    
    async putUpdateBuilding(payload) {
        console.log('[buildingApiClient] POST update payload →', JSON.stringify(payload, null, 2));
        const API_URL = import.meta.env.VITE_API_URL || 'https://shleeh.com';

        const response = await fetch(API_URL+`/api/Owners/UpdateHotelbuilding`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify(payload),
        });
        return await _handleResponse(response, 'putUpdateBuilding');
    },
    async putUpdateFlat(payload) {
        console.log('[buildingApiClient] POST update payload →', JSON.stringify(payload, null, 2));
        const API_URL = import.meta.env.VITE_API_URL || 'https://shleeh.com';

        const response = await fetch(API_URL+`/api/Owners/UpdateFlat`, {
            method: 'POST',
            headers: _getHeaders(),
            body: JSON.stringify(payload),
        });
        return await _handleResponse(response, 'putUpdateFlat');
    }
};