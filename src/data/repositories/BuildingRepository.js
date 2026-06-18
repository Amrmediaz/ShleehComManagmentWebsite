import { buildingApiClient } from '../buildingApiClient.js';

export const BuildingRepository = {
    /**
     * Sends the fully shaped building payload to the API.
     * Mirrors the same pattern as AuthRepository.registerOwner.
     *
     * @param {object} payload - output of BuildingEntity.toApiPayload()
     * @returns {{ status: boolean, message?: string, data?: object }}
     */
    async addBuilding(payload) {
        const responseData = await buildingApiClient.postAddBuilding(payload);
        return responseData; // { status: true/false, message/data... }
    },
    async addFlat(payload) {
        const responseData = await buildingApiClient.postAddFlat(payload);
        return responseData; // { status: true/false, message/data... }
    },
    async getOwnerBuildings() {
        const data = await buildingApiClient.getOwnerBuildings();
        // API returns: { status: true, message: [...buildings] }
        if (data?.status && Array.isArray(data?.message)) {
            return data.message.map(b => ({
                id: b.id,
                name: b.nameEn || b.nameAr || `Building #${b.id}`,
                nameAr: b.nameAr,
                nameEn: b.nameEn,
                address: `${b.state}, ${b.gouvernate}`,
                governorate: b.gouvernate,
                wilayat: b.state,
                floors: b.totalFloor,
                flats: b.totalFlats,
                isActive: b.isActive,
                coverImg: b.coverimg,
                images: (b.buldingImages || []).map(img => ({
                    id: img.id,
                    url: img.path,
                })),
                services: (b.buldingService || []).map(s => s.serviceName),
                ownerId: b.ownerId,
                raw: b, // full raw object if needed
            }));
        }
        return [];
    },
    async getOwnerBuildingsFlat(buildingId) {
        const data = await buildingApiClient.getOwnerBuildingsFlat(buildingId);
        // API returns: { status: true, message: [...buildings] }
        if (data?.status && Array.isArray(data?.message)) {
            return data.message.map(f => ({
                "id": f.id,
                "flatNumber": f.flatNumber || "",
                "flatImages": f.flatImages || f.images || [],
                "electronic_devices": f.electronic_devices || f.electronics || [],
                "typeId": f.typeId || f.value1 || "",
                "count": f.count || 0,
                "insurance_amount": f.insurance_amount || 0,
                "status": f.status || "available",
                "flatFloor": f.flatFloor || "",
                "nameAr": f.nameAr || "",
                "nameEn": f.nameEn || "",
                "descrptionAr": f.descrptionAr || "",
                "descrptionEn": f.descrptionEn || "",
                "additional_detailsAr": f.additional_detailsAr || "",
                "additional_detailsEn": f.additional_detailsEn || "",
                "visitors_count": f.visitors_count || "0",
                "bedsNumber": f.bedsNumber || "0",
                "balconiesNumber": f.balconiesNumber || "",
                "bathroomsNumber": f.bathroomsNumber || "0",
                "price_per_night": parseFloat(f.price_per_night) || 0.00,
                "weekend_price_per_night": parseFloat(f.weekend_price_per_night) || 0.00,
                "coverimg": f.cover_image || f.coverimg || "",
                "hotelbuildingID": f.hotelbuildingID || f.buildingId
            }));
        }
        return [];
    },

    async getOwnerFlat(flatId) {
        const data = await buildingApiClient.getOwnerFlat(flatId);

        if (!data?.status || !data?.message) {
            return [];
        }

        // Handle BOTH array (multiple flats) and object (single flat)
        const flatsArray = Array.isArray(data.message) ? data.message : [data.message];

        return flatsArray.map(f => ({
            "id": f.id,
            "flatNumber": f.flatNumber || "",
            "flatFloor": f.flatFloor || "",
            "nameAr": f.nameAr || "",
            "nameEn": f.nameEn || "",
            "descrptionAr": f.descrptionAr || "",
            "descrptionEn": f.descrptionEn || "",
            "additional_detailsAr": f.additional_detailsAr || "",
            "additional_detailsEn": f.additional_detailsEn || "",
            "visitors_count": f.visitors_count || "0",
            "bedsNumber": f.bedsNumber || "0",
            "balconiesNumber": f.balconiesNumber || "",
            "bathroomsNumber": f.bathroomsNumber || "0",
            "price_per_night": parseFloat(f.price_per_night) || 0.00,
            "weekend_price_per_night": parseFloat(f.weekend_price_per_night) || 0.00,
            "coverimg": f.coverimg || f.cover_image || "",
            "hotelbuildingID": f.hotelbuildingID || f.buildingId || 0,
            "typeId": f.typeId || 0,                          // ✅ Fixed: use typeId not value1
            "value1": f.value1 || "",
            "value2": f.value2 || "",
            "value3": f.value3 || "",
            "count": f.count || 0,                            // ✅ Count
            "occupied": f.occupied || 0,
            "insurance_amount": f.insurance_amount || 0,      // ✅ Insurance amount
            "showComments": f.showComments ?? true,
            "isActive": f.isActive ?? true,
            "isDeleted": f.isDeleted ?? false,
            "stopBook": f.stopBook ?? false,
            "status": f.status || "available",
            "crreatedDate": f.crreatedDate || new Date().toISOString(),
            "flatImages": f.flatImages || f.images || [],     // ✅ Images
            "electronic_devices": f.electronic_devices || f.electronics || []  // ✅ Electronics
        }));
    },
    async updateBuilding(payload) {
        const responseData = await buildingApiClient.putUpdateBuilding(payload);
        return responseData;
    },
    async updateFlat(payload) {
        const responseData = await buildingApiClient.putUpdateFlat(payload);
        return responseData;
    }
};
 