import { chaletApiClient } from '../chaletApiClient.js';

/** Normalizes one raw chalet object from the API into the shape the UI consumes. */
function mapChalet(c) {
    return {
        id: c.id,
        name: c.name || `Chalet #${c.id}`,
        chaletType: c.chaletType || '',
        capacity: c.capacity || '',
        bedrooms: c.bedrooms || '',
        bathrooms: c.bathrooms || '',
        livingRooms: c.livingRooms || '',
        suitableFor: c.suitableFor || '',
        landscape: c.landscape || '',
        outdoorSpace: c.outdoorSpace || '',
        safety: c.safety || '',
        atmosphere: c.atmosphere || '',
        bestSeason: c.bestSeason || '',
        buildingDescription: c.buldingDescrption || '',
        note: c.note || '',
        rentFullDay: c.rentFullday || '',
        rentFullDayDiscount: c.rentFulldayDisCount || '',
        rentHalfDay: c.rentHalfday || '',
        rentHalfDayDiscount: c.rentHalfdayDisCount || '',
        offDayPriceFullDay: c.offDayPriceFullday || '',
        offDayPriceHalfDay: c.offDayPriceHalfday || '',
        rentWeekend: c.rentweekend || '',
        // "Today's Offer" — see TODAY-OFFER-API-SPEC.md. todayOfferActive is
        // computed fresh by the backend on every response — never derived here.
        todayOfferEnabled: !!c.todayOfferEnabled,
        todayOfferPercent: Number(c.todayOfferPercent) || 0,
        todayOfferTriggerHour: Number(c.todayOfferTriggerHour ?? 12),
        todayOfferActive: !!c.todayOfferActive,
        minDays: c.minDays || 0,
        insuranceAmount: c.insuranceamount || '0',
        acceptDeposit: !!c.acceptDeposit,
        stopBook: !!c.stopBook,
        breakfastEnabled: !!c.breakfastenabled,
        showComments: c.showComments ?? true,
        isActive: c.isActive ?? true,
        gouvernate: c.gouvernate || '',
        state: c.state || '',
        lat: c.lat || '',
        lng: c.lng || '',
        rateAverage: c.rateAverage || 0,
        coverImg: c.buldingImages?.[0]?.path || '',
        images: (c.buldingImages || []).map(img => ({ id: img.id, url: img.path })),
        services: (c.buldingService || []).map(s => s.serviceName),
        ownerId: c.apartmentOwnerId || c.ownerId || 0,
        createdDate: c.crreatedDate || null,
        raw: c,
    };
}

export const ChaletRepository = {
    async getOwnerChalets() {
        const data = await chaletApiClient.getOwnerChalets();
        if (data?.status && Array.isArray(data?.message)) {
            return data.message.map(mapChalet);
        }
        return [];
    },

    async getChaletById(chaletId) {
        const data = await chaletApiClient.getChaletDetails(chaletId);
        if (data?.status && data?.message) {
            return mapChalet(data.message);
        }
        return null;
    },

    async addChalet(payload) {
        return await chaletApiClient.postAddChalet(payload);
    },

    async updateChalet(payload) {
        return await chaletApiClient.putUpdateChalet(payload);
    },

    /** Dedicated Today's Offer read — see TODAY-OFFER-API-SPEC.md Part 5. */
    async getTodayOffer(chaletId) {
        const data = await chaletApiClient.getTodayOffer(chaletId);
        if (data?.status && data?.message) {
            const m = data.message;
            return {
                // The TodayOfferSettings row's own id — 0 means "no row
                // yet" (first save). Must be echoed back on the next
                // update, or backend creates a duplicate row instead of
                // editing this one.
                id: Number(m.id) || 0,
                todayOfferEnabled: !!m.todayOfferEnabled,
                todayOfferPercent: Number(m.todayOfferPercent) || 0,
                todayOfferTriggerHour: Number(m.todayOfferTriggerHour ?? 12),
                todayOfferActive: !!m.todayOfferActive,
            };
        }
        return null;
    },

    /** Dedicated Today's Offer write — see TODAY-OFFER-API-SPEC.md Part 5. */
    async updateTodayOffer(payload) {
        return await chaletApiClient.putUpdateTodayOffer(payload);
    },

    async getPrices(chaletId) {
        const data = await chaletApiClient.getChaletPrices(chaletId);
        if (data?.status && Array.isArray(data?.message)) {
            return data.message;
        }
        return [];
    },

    async savePrice(payload) {
        const data = payload.id
            ? await chaletApiClient.putChaletPrice(payload)
            : await chaletApiClient.postChaletPrice(payload);
        if (data?.status === false) {
            throw new Error(data?.message || 'Failed to save price');
        }
        return data;
    },

    async deletePrice(priceId) {
        const data = await chaletApiClient.deleteChaletPrice(priceId);
        if (data?.status === false) {
            throw new Error(data?.message || 'Failed to delete price');
        }
        return data;
    },

    /** Owner-blocked days only, as plain "DD/MM/YYYY" strings. */
    async getBlockedDays(chaletId) {
        const data = await chaletApiClient.getChaletBlockedDays(chaletId);
        if (data?.status && Array.isArray(data?.message?.days)) {
            return data.message.days;
        }
        return [];
    },

    /** Every unavailable day (bookings + blocked), as plain "DD/MM/YYYY" strings. */
    async getAllUnavailableDays(chaletId) {
        const data = await chaletApiClient.getChaletBookingDays(chaletId);
        if (data?.status && Array.isArray(data?.message)) {
            return data.message;
        }
        return [];
    },

    /** Replaces the full owner-blocked-days list. days: ["DD/MM/YYYY", …] */
    async setBlockedDays(chaletId, days) {
        const data = await chaletApiClient.setChaletBlockedDays({ buldingID: chaletId, days });
        if (data?.status === false) {
            throw new Error(data?.message || 'Failed to update blocked days');
        }
        return data;
    },

    async getOwnerBookings(page = 1, pageSize = 20) {
        const data = await chaletApiClient.getOwnerChaletBookings(page, pageSize);
        if (data?.status && data?.message) {
            return {
                bookings: data.message.results || [],
                currentPage: data.message.currentPage || page,
                pageCount: data.message.pageCount || 1,
                pageSize: data.message.pageSize || pageSize,
                rowCount: data.message.rowCount || 0,
            };
        }
        return { bookings: [], currentPage: 1, pageCount: 1, pageSize, rowCount: 0 };
    },

    async getBookingDetails(bookingId) {
        const data = await chaletApiClient.getChaletBookingDetails(bookingId);
        if (data?.status && data?.message) {
            return data.message;
        }
        return null;
    },
};

export default ChaletRepository;
