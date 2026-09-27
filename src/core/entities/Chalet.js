/**
 * ChaletEntity
 * Domain entity for a Chalet (standalone rentable property — chalet / resort / hut).
 * Mirrors the "Building" (Hotelbuilding) entity pattern but maps to the
 * chalet-specific API surface (/api/Owners/AddBuilding, UpdateBuilding, GetBuildingList…)
 * used by the "chaletowner" mobile app.
 */
export class ChaletEntity {
    constructor({
                    id = 0,
                    name = '',
                    chaletType = '',
                    capacity = '',
                    bedrooms = '',
                    bathrooms = '',
                    livingRooms = '',
                    suitableFor = '',
                    landscape = '',
                    outdoorSpace = '',
                    safety = '',
                    atmosphere = '',
                    bestSeason = '',
                    buildingDescription = '',
                    note = '',
                    rentFullDay = '',
                    rentHalfDay = '',
                    offDayPriceFullDay = '',
                    offDayPriceHalfDay = '',
                    rentWeekend = '',
                    minDays = 0,
                    insuranceAmount = '',
                    acceptDeposit = false,
                    stopBook = false,
                    breakfastEnabled = true,
                    fullDayDiscountEnabled = true,
                    fullDayDiscountEnabledText = '',
                    // "Today's Offer" — owner-controlled discount for a day with no
                    // booking (TODAY-OFFER-API-SPEC.md). todayOfferActive is
                    // computed server-side and never sent back on update — it's
                    // read-only here, kept only so the entity can carry it through
                    // for display.
                    todayOfferEnabled = false,
                    todayOfferPercent = 0,
                    todayOfferTriggerHour = 12,
                    todayOfferActive = false,
                    showComments = true,
                    isActive = true,
                    gouvernate = '',
                    state = '',
                    lat = '',
                    lng = '',
                    buldingImages = [],
                    buldingService = [],
                    ownerId = 0,
                }) {
        this.id = Number(id) || 0;
        this.name = name?.trim() ?? '';
        this.chaletType = chaletType ?? '';
        this.capacity = String(capacity ?? '');
        this.bedrooms = String(bedrooms ?? '');
        this.bathrooms = String(bathrooms ?? '');
        this.livingRooms = String(livingRooms ?? '');
        this.suitableFor = suitableFor ?? '';
        this.landscape = landscape ?? '';
        this.outdoorSpace = outdoorSpace ?? '';
        this.safety = safety ?? '';
        this.atmosphere = atmosphere ?? '';
        this.bestSeason = bestSeason ?? '';
        this.buildingDescription = buildingDescription ?? '';
        this.note = note ?? '';
        this.rentFullDay = String(rentFullDay ?? '');
        this.rentHalfDay = String(rentHalfDay ?? '');
        this.offDayPriceFullDay = String(offDayPriceFullDay ?? '');
        this.offDayPriceHalfDay = String(offDayPriceHalfDay ?? '');
        this.rentWeekend = String(rentWeekend ?? '');
        this.minDays = Number(minDays) || 0;
        this.insuranceAmount = String(insuranceAmount ?? '0');
        this.acceptDeposit = Boolean(acceptDeposit);
        this.stopBook = Boolean(stopBook);
        this.breakfastEnabled = Boolean(breakfastEnabled);
        this.fullDayDiscountEnabled = Boolean(fullDayDiscountEnabled);
        this.fullDayDiscountEnabledText = fullDayDiscountEnabledText ?? '';
        this.todayOfferEnabled = Boolean(todayOfferEnabled);
        this.todayOfferPercent = Number(todayOfferPercent) || 0;
        this.todayOfferTriggerHour = Number(todayOfferTriggerHour ?? 12);
        this.todayOfferActive = Boolean(todayOfferActive);
        this.showComments = Boolean(showComments);
        this.isActive = Boolean(isActive);
        this.gouvernate = gouvernate?.trim() ?? '';
        this.state = state?.trim() ?? '';
        this.lat = String(lat ?? '');
        this.lng = String(lng ?? '');
        this.buldingImages = buldingImages ?? [];
        this.buldingService = buldingService ?? [];
        this.ownerId = Number(ownerId) || 0;
    }

    /** Shapes the entity into the exact body the /Owners/AddBuilding | UpdateBuilding endpoints expect. */
    toApiPayload() {
        const payload = {
            id: this.id,
            name: this.name,
            rentFullday: this.rentFullDay,
            rentHalfday: this.rentHalfDay,
            buldingDescrption: this.buildingDescription,
            note: this.note,
            state: this.state,
            gouvernate: this.gouvernate,
            lat: this.lat,
            lng: this.lng,
            showComments: this.showComments,
            isActive: this.isActive,
            offDayPriceFullday: this.offDayPriceFullDay,
            offDayPriceHalfday: this.offDayPriceHalfDay,
            rentweekend: this.rentWeekend,
            acceptDeposit: this.acceptDeposit,
            stopBook: this.stopBook,
            breakfastenabled: this.breakfastEnabled,
            fulldayDiscountenabled: this.fullDayDiscountEnabled,
            fulldayDiscountenabledText: this.fullDayDiscountEnabledText,
            // "Today's Offer" — see TODAY-OFFER-API-SPEC.md. Only the enabled
            // flag, percent and trigger hour are ever sent up; todayOfferActive
            // is server-computed and intentionally left off this payload.
            todayOfferEnabled: this.todayOfferEnabled,
            todayOfferPercent: this.todayOfferPercent,
            todayOfferTriggerHour: this.todayOfferTriggerHour,
            insuranceamount: this.insuranceAmount || '0',
            buldingImages: this.buldingImages,
            buldingService: this.buldingService,
            chaletType: this.chaletType,
            capacity: this.capacity,
            bedrooms: this.bedrooms,
            bathrooms: this.bathrooms,
            livingRooms: this.livingRooms,
            suitableFor: this.suitableFor,
            landscape: this.landscape,
            outdoorSpace: this.outdoorSpace,
            safety: this.safety,
            atmosphere: this.atmosphere,
            bestSeason: this.bestSeason,
        };
        if (this.minDays) payload.minDays = this.minDays;
        return payload;
    }
}
