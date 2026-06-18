export class FlatEntity {
    constructor({
                    id = 0,
                    flatNumber = '',
                    flatFloor = '',
                    nameAr = '',
                    nameEn = '',
                    descrptionAr = '',
                    descrptionEn = '',
                    additional_detailsAr = '',
                    additional_detailsEn = '',
                    visitors_count = '',
                    typeId = 0,
                    count = 0,
                    occupied = 0,
                    bedsNumber = '',
                    balconiesNumber = '',
                    bathroomsNumber = '',
                    price_per_night = 0,
                    weekend_price_per_night = 0,
                    insurance_amount = 0,
                    coverimg = '',
                    value1 = '',
                    value2 = '',
                    value3 = '',
                    showComments = true,
                    isActive = true,
                    isDeleted = false,
                    stopBook = false,
                    crreatedDate = new Date().toISOString(),
                    flatImages = [],
                    electronic_devices = [],
                    hotelbuildingID = 0
                }) {
        this.id                      = Number(id) || 0;
        this.flatNumber              = String(flatNumber ?? '');
        this.flatFloor               = String(flatFloor ?? '');
        this.nameAr                  = nameAr?.trim() ?? '';
        this.nameEn                  = nameEn?.trim() ?? '';
        this.descrptionAr            = descrptionAr ?? '';
        this.descrptionEn            = descrptionEn ?? '';
        this.additional_detailsAr    = additional_detailsAr ?? '';
        this.additional_detailsEn    = additional_detailsEn ?? '';
        this.visitors_count          = String(visitors_count ?? '');
        this.typeId                  = Number(typeId) || 0;
        this.count                   = Number(count) || 0;
        this.occupied                = Number(occupied) || 0;
        this.bedsNumber              = String(bedsNumber ?? '');
        this.balconiesNumber         = String(balconiesNumber ?? '');
        this.bathroomsNumber         = String(bathroomsNumber ?? '');
        this.price_per_night         = Number(price_per_night) || 0;
        this.weekend_price_per_night = Number(weekend_price_per_night) || 0;
        this.insurance_amount        = Number(insurance_amount) || 0;
        this.coverimg                = coverimg ?? '';
        this.value1                  = value1 ?? '';
        this.value2                  = value2 ?? '';
        this.value3                  = value3 ?? '';
        this.showComments            = Boolean(showComments);
        this.isActive                = Boolean(isActive);
        this.isDeleted               = Boolean(isDeleted);
        this.stopBook                = Boolean(stopBook);
        this.crreatedDate            = crreatedDate;
        this.flatImages              = flatImages ?? [];
        this.electronic_devices      = electronic_devices ?? [];
        this.hotelbuildingID         = Number(hotelbuildingID) || 0;
    }

    toApiPayload() {
        return {
            id:                      this.id,
            flatNumber:              this.flatNumber,
            flatFloor:               this.flatFloor,
            nameAr:                  this.nameAr,
            nameEn:                  this.nameEn,
            descrptionAr:            this.descrptionAr,
            descrptionEn:            this.descrptionEn,
            additional_detailsAr:    this.additional_detailsAr,
            additional_detailsEn:    this.additional_detailsEn,
            visitors_count:          this.visitors_count,
            typeId:                  this.typeId,
            count:                   this.count,
            occupied:                this.occupied,
            bedsNumber:              this.bedsNumber,
            balconiesNumber:         this.balconiesNumber,
            bathroomsNumber:         this.bathroomsNumber,
            price_per_night:         this.price_per_night,
            weekend_price_per_night: this.weekend_price_per_night,
            insurance_amount:        this.insurance_amount,
            coverimg:                this.coverimg,
            value1:                  this.value1,
            value2:                  this.value2,
            value3:                  this.value3,
            showComments:            this.showComments,
            isActive:                this.isActive,
            isDeleted:               this.isDeleted,
            stopBook:                this.stopBook,
            crreatedDate:            this.crreatedDate,
            flatImages:              this.flatImages,
            electronic_devices:      this.electronic_devices,
            hotelbuildingID:         this.hotelbuildingID
        };
    }
}