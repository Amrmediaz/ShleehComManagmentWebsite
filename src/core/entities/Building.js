export class BuildingEntity {
    constructor({
                    id = 0,
                    nameAr,
                    nameEn,
                    totalFloor,
                    totalFlats,
                    yearBulit,
                    minimumRent,
                    maxRent,
                    minDays,
                    gouvernate,
                    state,
                    location,
                    lat = '',
                    lng = '',
                    managmentPhone = '',
                    workerPhone = '',
                    buildingPolicyAr = '',
                    buildingPolicyEn = '',
                    cancelation_policyAr = '',
                    cancelation_policyEn = '',
                    buldingDescrptionAr = '',
                    buldingDescrptionEn = '',
                    additional_detailsAr = '',
                    additional_detailsEn = '',
                    buldinNumber = '',
                    nearTo = '',
                    onlinePay = true,
                    acceptDownPay = false,
                    check_In = '14:00',
                    check_Out = '11:00',
                    isExclusive = false,
                    isActive = true,
                    isDeleted = false,
                    stopBook = false,
                    bulidstatus = 0,
                    coverimg = '',
                    value1 = '',
                    value2 = '',
                    value3 = '',
                    buldingImages = [],
                    buildingFlatType = [],
                    buildingPayment_methods = [],
                    buldingService = [],
                    ownerId = 0,
                }) {
        this.id = Number(id) || 0;
        this.nameAr                 = nameAr?.trim() ?? '';
        this.nameEn                 = nameEn?.trim() ?? '';
        this.totalFloor             = Number(totalFloor) || 0;
        this.totalFlats             = Number(totalFlats) || 0;
        this.yearBulit              = String(yearBulit ?? '');
        this.minimumRent            = String(minimumRent ?? '');
        this.maxRent                = String(maxRent ?? '');
        this.minDays                = Number(minDays) || 0;
        this.gouvernate             = gouvernate?.trim() ?? '';
        this.state                  = state?.trim() ?? '';
        this.location               = location?.trim() ?? '';
        this.lat                    = String(lat ?? '');
        this.lng                    = String(lng ?? '');
        this.managmentPhone         = String(managmentPhone ?? '');
        this.workerPhone            = String(workerPhone ?? '');
        this.buildingPolicyAr       = buildingPolicyAr ?? '';
        this.buildingPolicyEn       = buildingPolicyEn ?? '';
        this.cancelation_policyAr   = cancelation_policyAr ?? '';
        this.cancelation_policyEn   = cancelation_policyEn ?? '';
        this.buldingDescrptionAr    = buldingDescrptionAr ?? '';
        this.buldingDescrptionEn    = buldingDescrptionEn ?? '';
        this.additional_detailsAr   = additional_detailsAr ?? '';
        this.additional_detailsEn   = additional_detailsEn ?? '';
        this.buldinNumber           = String(buldinNumber ?? '');
        this.nearTo                 = nearTo ?? '';
        this.onlinePay              = Boolean(onlinePay);
        this.acceptDownPay          = Boolean(acceptDownPay);
        this.isExclusive            = Boolean(isExclusive);
        this.isActive               = Boolean(isActive);
        this.isDeleted              = Boolean(isDeleted);
        this.stopBook               = Boolean(stopBook);
        this.bulidstatus            = Number(bulidstatus) || 0;
        this.coverimg               = coverimg ?? '';
        this.value1                 = value1 ?? '';
        this.value2                 = value2 ?? '';
        this.value3                 = value3 ?? '';
        this.buldingImages          = buldingImages ?? [];
        this.buildingFlatType       = buildingFlatType ?? [];
        this.buildingPayment_methods = buildingPayment_methods ?? [];
        this.buldingService         = buldingService ?? [];
        this.ownerId                = Number(ownerId) || 0;

        // "HH:mm" → "HH:mm:ss" — some .NET APIs need the seconds segment
        this.check_In  = this._normalizeTime(check_In,  '14:00');
        this.check_Out = this._normalizeTime(check_Out, '11:00');
    }

    /** Ensures time strings always have HH:mm:ss format */
    _normalizeTime(value, fallback) {
        if (!value) return `${fallback}:00`;
        const parts = String(value).split(':');
        if (parts.length === 2) return `${value}:00`;   // "14:00" → "14:00:00"
        if (parts.length === 3) return value;            // already "14:00:00"
        return `${fallback}:00`;
    }

    toApiPayload() {
        return {
            id: this.id,
            nameAr:                  this.nameAr,
            nameEn:                  this.nameEn,
            totalFloor:              this.totalFloor,
            totalFlats:              this.totalFlats,
            yearBulit:               this.yearBulit,
            minimumRent:             this.minimumRent,
            maxRent:                 this.maxRent,
            minDays:                 this.minDays,
            value1:                  this.value1,
            value2:                  this.value2,
            value3:                  this.value3,
            buldingDescrptionAr:     this.buldingDescrptionAr,
            buldingDescrptionEn:     this.buldingDescrptionEn,
            additional_detailsAr:    this.additional_detailsAr,
            additional_detailsEn:    this.additional_detailsEn,
            gouvernate:              this.gouvernate,
            state:                   this.state,
            location:                this.location,
            lat:                     this.lat,
            lng:                     this.lng,
            managmentPhone:          this.managmentPhone,
            workerPhone:             this.workerPhone,
            buildingPolicyAr:        this.buildingPolicyAr,
            buildingPolicyEn:        this.buildingPolicyEn,
            cancelation_policyAr:    this.cancelation_policyAr,
            cancelation_policyEn:    this.cancelation_policyEn,
            buldinNumber:            this.buldinNumber,
            coverimg:                this.coverimg,
            nearTo:                  this.nearTo,
            onlinePay:               this.onlinePay,
            acceptDownPay:           this.acceptDownPay,
            check_In:                this.check_In,
            check_Out:               this.check_Out,
            isExclusive:             this.isExclusive,
            isActive:                this.isActive,
            isDeleted:               this.isDeleted,
            stopBook:                this.stopBook,
            bulidstatus:             this.bulidstatus,
            buldingImages:           this.buldingImages,
            buildingFlatType:        this.buildingFlatType,
            buildingPayment_methods: this.buildingPayment_methods,
            buldingService:          this.buldingService,
            ownerId:                 this.ownerId,
        };
    }
}