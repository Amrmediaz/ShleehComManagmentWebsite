import { initialBuildings, initialBookings } from '../api/mock/initialState.js';

const USE_API = import.meta.env?.VITE_USE_API === 'false';

export class BmsRepositoryImpl {
    constructor() {
        this._initLocalData();
    }

    _initLocalData() {
        try {
            if (!localStorage.getItem('bms_buildings')) {
                localStorage.setItem('bms_buildings', JSON.stringify(initialBuildings));
            }
            if (!localStorage.getItem('bms_bookings')) {
                localStorage.setItem('bms_bookings', JSON.stringify(initialBookings));
            }
        } catch (e) {
            console.error("LocalStorage initialization error:", e);
        }
    }

    async getBuildings() {
        if (USE_API) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/buildings`);
                return await response.json();
            } catch { return []; }
        }
        return JSON.parse(localStorage.getItem('bms_buildings') || '[]');
    }

    async getBookings() {
        if (USE_API) {
            // Placeholder for future API
            return [];
        }
        return JSON.parse(localStorage.getItem('bms_bookings') || '[]');
    }

    async saveBooking(bookingEntity) {
        if (USE_API) {
            // Placeholder for future API
            return true;
        }
        const data = JSON.parse(localStorage.getItem('bms_bookings') || '[]');
        data.push(bookingEntity);
        localStorage.setItem('bms_bookings', JSON.stringify(data));
        return true;
    }
}