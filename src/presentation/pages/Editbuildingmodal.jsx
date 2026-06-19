import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext.jsx';
import { fileUploadApiClient } from '../../data/FileUploadClient.js';
import { EditBuildingUseCase } from '../../core/useCases/EditBuildingUseCase.js';
import {
    IconX, IconBuilding, IconTrash, IconPlus,
} from '@tabler/icons-react';

// ===== SECTIONS =====
import BasicInfoSection from '../components/BuilidingAddingUpdating/BasicInfoSection.jsx';
import LocationSection from '../components/BuilidingAddingUpdating/LocationSection.jsx';
import ContactSection from '../components/BuilidingAddingUpdating/ContactSection';
import FinancialsSection from '../components/BuilidingAddingUpdating/FinancialsSection';

// ===== UI COMPONENTS =====

import AmenityTile from '../components/BuilidingAddingUpdating/AmenityTile';
import FormActions from '../components/BuilidingAddingUpdating/FormActions';
import UnitTypesSection from '../components/BuilidingAddingUpdating/UnitTypesSection.jsx';
// ===== SHARED CONSTANTS =====
import {
    WILAYATS,
    UNIT_TYPES,
    AMENITIES_UI,
    SERVICE_TO_KEY ,
    AMENITY_SERVICE_MAP,
} from '../../core/utils/Constants/building_constants.js';

// ===== SHARED HELPERS =====
import {
    initAmenities,
    initUnits,
    getBuildingId,
    initExistingImages,
    initTime
} from '../../core/utils/helper/FormHelpers.js';

// ===== STYLES =====
import '../styles/AddBuildingModal.css';
import PolicySection from "../components/BuilidingAddingUpdating/PolicySection.jsx";
import MediaSection from "../components/BuilidingAddingUpdating/MediaSection.jsx";


export default function EditBuildingModal({ isOpen, onClose, building, onUpdate }) {
    const { t, lang } = useTranslation();
    const isRTL = lang === 'ar';

    if (!isOpen || !building) return null;

    const raw = building.raw || {};

    // ===== HELPER: Initialize amenities from building services =====
    const initAmenities = () => {
        const checked = {};

        // DEBUG: Log what we're working with
        console.log('[initAmenities] building.services:', building.services);
        console.log('[initAmenities] raw.buldingService:', raw.buldingService);
        console.log('[initAmenities] SERVICE_TO_KEY:', SERVICE_TO_KEY);

        // Try to get services from either building.services or raw.buldingService
        const services = building.services || raw.buldingService || [];

        console.log('[initAmenities] Using services:', services);

        services.forEach(item => {
            let serviceName = '';

            // Handle if item is an object { serviceName: 'WiFi' } or string 'WiFi'
            if (typeof item === 'object' && item.serviceName) {
                serviceName = item.serviceName;
            } else if (typeof item === 'string') {
                serviceName = item;
            }

            console.log('[initAmenities] Processing service:', serviceName);

            // Look up the amenity key from the service name
            const key = SERVICE_TO_KEY[serviceName];

            console.log('[initAmenities] Service "' + serviceName + '" maps to key:', key);

            if (key) {
                checked[key] = true;
                console.log('[initAmenities] ✓ Checked:', key);
            } else {
                console.warn('[initAmenities] ✗ No key found for service:', serviceName);
            }
        });

        console.log('[initAmenities] Final checked amenities:', checked);
        return checked;
    };

    // ===== STATE =====
    const [nameAr, setNameAr] = useState(raw.nameAr || '');
    const [nameEn, setNameEn] = useState(raw.nameEn || '');
    const [totalFloor, setTotalFloor] = useState(raw.totalFloor || '');
    const [totalFlats, setTotalFlats] = useState(raw.totalFlats || '');
    const [yearBulit, setYearBulit] = useState(raw.yearBulit || '');
    const [buldinNumber, setBuldinNumber] = useState(raw.buldinNumber || '');
    const [buldingDescrptionAr, setDescAr] = useState(raw.buldingDescrptionAr || '');
    const [buldingDescrptionEn, setDescEn] = useState(raw.buldingDescrptionEn || '');
    const [additional_detailsAr, setAddDetailsAr] = useState(raw.additional_detailsAr || '');
    const [additional_detailsEn, setAddDetailsEn] = useState(raw.additional_detailsEn || '');
    const [gouvernate, setGovernorate] = useState(raw.gouvernate || '');
    const [state, setWilayat] = useState(raw.state || '');
    const [location, setLocation] = useState(raw.location || '');
    const [lat, setLat] = useState(raw.lat || '');
    const [lng, setLng] = useState(raw.lng || '');
    const [nearTo, setNearTo] = useState(raw.nearTo || '');
    const [managmentPhone, setManagmentPhone] = useState(raw.managmentPhone || '');
    const [workerPhone, setWorkerPhone] = useState(raw.workerPhone || '');
    const [minimumRent, setMinimumRent] = useState(raw.minimumRent || '');
    const [maxRent, setMaxRent] = useState(raw.maxRent || '');
    const [minDays, setMinDays] = useState(raw.minDays || '');
    const [acceptDownPay, setAcceptDownPay] = useState(raw.acceptDownPay || false);
    const [isExclusive, setIsExclusive] = useState(raw.isExclusive || false);
    const [isActive, setIsActive] = useState(raw.isActive ?? true);
    const [stopBook, setStopBook] = useState(raw.stopBook || false);
    const [check_In, setCheckIn] = useState(initTime(raw.check_In, '14:00'));
    const [check_Out, setCheckOut] = useState(initTime(raw.check_Out, '11:00'));
    const [cancelation_policyAr, setCancelPolicyAr] = useState(raw.cancelation_policyAr || '');
    const [cancelation_policyEn, setCancelPolicyEn] = useState(raw.cancelation_policyEn || '');
    const [buildingPolicyAr, setBuildingPolicyAr] = useState(raw.buildingPolicyAr || '');
    const [buildingPolicyEn, setBuildingPolicyEn] = useState(raw.buildingPolicyEn || '');
    const [checkedAmenities, setCheckedAmenities] = useState(initAmenities);
    const [selectedUnits, setSelectedUnits] = useState(() => initUnits(raw.buildingFlatType, UNIT_TYPES));
    const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);

    // Images
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(building.coverImg || null);
    const [existingCoverRaw, setExistingCoverRaw] = useState(raw.coverimg || '');
    const [existingImages, setExistingImages] = useState(() => initExistingImages(raw.buldingImages));
    const [galFiles, setGalFiles] = useState([]);

    const coverInputRef = useRef();
    const galInputRef = useRef();

    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

    useEffect(() => {
        const buildingId = getBuildingId(building);
        console.log('[EditBuildingModal] Building loaded:', buildingId);
        console.log('[EditBuildingModal] Checked amenities:', checkedAmenities);
    }, [building, checkedAmenities]);

    // ===== HANDLERS =====

    const toggleAmenity = (key) => setCheckedAmenities(prev => ({ ...prev, [key]: !prev[key] }));

    const handleCover = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleGallery = (e) => {
        const files = Array.from(e.target.files);
        const newEntries = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
        setGalFiles(prev => [...prev, ...newEntries].slice(0, 8 - existingImages.length));
        e.target.value = '';
    };

    const removeExistingImage = (id) => setExistingImages(prev => prev.filter(img => img.id !== id));
    const removeNewGalImage = (index) => setGalFiles(prev => prev.filter((_, i) => i !== index));

    const handleSubmit = async () => {
        setStatusMessage({ text: '', isError: false });

        // Validation
        if (!nameAr?.trim()) {
            setStatusMessage({ text: isRTL ? 'اسم المبنى (عربي) مطلوب' : 'Building Name (Arabic) is required', isError: true });
            return;
        }
        if (!nameEn?.trim()) {
            setStatusMessage({ text: isRTL ? 'اسم المبنى (إنجليزي) مطلوب' : 'Building Name (English) is required', isError: true });
            return;
        }
        if (!gouvernate) {
            setStatusMessage({ text: isRTL ? 'المحافظة مطلوبة' : 'Governorate is required', isError: true });
            return;
        }
        if (!state) {
            setStatusMessage({ text: isRTL ? 'الولاية مطلوبة' : 'Wilayat is required', isError: true });
            return;
        }

        setIsLoading(true);
        let coverimg = existingCoverRaw;

        try {
            // Upload cover if changed
            if (coverFile) {
                let response = await fileUploadApiClient.uploadFile(coverFile);
                let parsed = typeof response === 'string' ? JSON.parse(response) : response;

                if (typeof parsed === 'string') {
                    parsed = JSON.parse(parsed);
                }

                if (parsed?.status) {
                    coverimg = 'https://shleeh.com/' + parsed.message.replace(/^\//, '');
                } else {
                    console.error('[EditBuilding] Cover upload failed:', parsed);
                }
            }

            // Upload gallery images
            const newUploadedImages = [];

            for (const { file } of galFiles) {
                try {
                    const response = await fileUploadApiClient.uploadFile(file);
                    let parsed = typeof response === 'string' ? JSON.parse(response) : response;

                    if (typeof parsed === 'string') {
                        parsed = JSON.parse(parsed);
                    }

                    if (parsed?.status) {
                        // Define the path locally to this iteration
                        const imagePath = 'https://shleeh.com/' + parsed.message.replace(/^\//, '');

                        newUploadedImages.push({
                            id: 0,
                            path: imagePath,
                            hotelbuildingID: raw.id || 0
                        });
                    } else {
                        console.error('[EditBuilding] Gallery image upload failed:', parsed);
                    }
                } catch (error) {
                    console.error('[EditBuilding] Error uploading gallery image:', error);
                }
            }

            const buldingImages = [
                ...existingImages.map(img => ({ id: img.id, path: img.path, hotelbuildingID: raw.id || 0 })),
                ...newUploadedImages,
            ];

            // Deduplicate units
            const uniqueUnits = Array.from(new Map(selectedUnits.map(u => [u.id, u])).values());
            const buildingFlatType = uniqueUnits.map(unit => ({
                id: 0,
                typeId: unit.id,
                hotelbuildingID: raw.id || 0
            }));

            // Convert checked amenities to service names (FIXED)
            const buldingService = Object.entries(checkedAmenities)
                .filter(([, v]) => v)
                .map(([key]) => ({
                    id: 0,
                    serviceName: AMENITY_SERVICE_MAP[key] || key,
                    hotelbuildingID: raw.id || 0
                }));

            console.log('[Submit] Building services:', buldingService);

            const buildingId = getBuildingId(building);

            const payload = {
                id: buildingId,
                nameAr, nameEn,
                totalFloor: Number(totalFloor),
                totalFlats: Number(totalFlats),
                yearBulit: String(yearBulit),
                minimumRent: String(minimumRent),
                maxRent: String(maxRent),
                minDays: Number(minDays),
                value1: raw.value1 || '',
                value2: raw.value2 || '',
                value3: raw.value3 || '',
                buldingDescrptionAr,
                buldingDescrptionEn,
                additional_detailsAr,
                additional_detailsEn,
                gouvernate,
                state,
                location,
                lat: String(lat),
                lng: String(lng),
                nearTo,
                managmentPhone,
                workerPhone,
                buildingPolicyAr,
                buildingPolicyEn,
                cancelation_policyAr,
                cancelation_policyEn,
                buldinNumber,
                coverimg,
                onlinePay: raw.onlinePay ?? true,
                acceptDownPay,
                check_In: check_In.length === 5 ? `${check_In}:00` : check_In,
                check_Out: check_Out.length === 5 ? `${check_Out}:00` : check_Out,
                isExclusive,
                isActive,
                isDeleted: false,
                stopBook,
                bulidstatus: raw.bulidstatus || 0,
                buldingImages,
                buildingFlatType,
                buildingPayment_methods: raw.buildingPayment_methods || [],
                buldingService,
                ownerId: raw.ownerId || 0,
            };

            console.log('[EditBuildingModal] Submitting:', buildingId);

            const { validationError, result } = await EditBuildingUseCase.execute(payload,t);

            if (validationError) {
                setStatusMessage({ text: validationError, isError: true });
                return;
            }

            if (result?.status === true) {
                setStatusMessage({ text: t('building_updated_success') || 'Building updated successfully!', isError: false });
                if (onUpdate) onUpdate(payload);
                setTimeout(() => onClose(), 1400);
            } else {
                setStatusMessage({ text: result?.message || t('building_update_failed') || 'Update failed', isError: true });
            }
        } catch (err) {
            console.error('[EditBuildingModal] Error:', err);
            setStatusMessage({ text: err.message || t('server_error') || 'Server error', isError: true });
        } finally {
            setIsLoading(false);
        }
    };

    // ===== RENDER =====

    return (
        <div className="modal-overlay">
            <div className="modal-container" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>

                {/* HEADER */}
                <div className="modal-header" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <div className="modal-header__content" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <div className="modal-header__icon">
                            <IconBuilding size={18} color="#185FA5" />
                        </div>
                        <div>
                            <div className="modal-header__title">{t('edit_building') || 'Edit Building'}</div>
                            <div className="modal-header__subtitle">{building.nameEn || building.nameAr}</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="modal-header__close">
                        <IconX size={20} />
                    </button>
                </div>

                {/* BODY */}
                <div className="modal-body">

                    {/* Status Message */}
                    {statusMessage.text && (
                        <div style={{
                            padding: '14px 16px',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 500,
                            background: statusMessage.isError ? '#fee2e2' : '#dcfce7',
                            color: statusMessage.isError ? '#991b1b' : '#166534',
                            border: `2px solid ${statusMessage.isError ? '#fca5a5' : '#86efac'}`,
                            textAlign: isRTL ? 'right' : 'left',
                            animation: 'pulse 0.5s ease-in-out'
                        }}>
                            {statusMessage.text}
                        </div>
                    )}

                    {/* 1. BASIC INFO */}
                    <BasicInfoSection
                        nameAr={nameAr} setNameAr={setNameAr}
                        nameEn={nameEn} setNameEn={setNameEn}
                        totalFloor={totalFloor} setTotalFloor={setTotalFloor}
                        totalFlats={totalFlats} setTotalFlats={setTotalFlats}
                        yearBulit={yearBulit} setYearBulit={setYearBulit}
                        buldinNumber={buldinNumber} setBuldinNumber={setBuldinNumber}
                        buldingDescrptionAr={buldingDescrptionAr} setDescAr={setDescAr}
                        buldingDescrptionEn={buldingDescrptionEn} setDescEn={setDescEn}
                        additional_detailsAr={additional_detailsAr} setAddDetailsAr={setAddDetailsAr}
                        additional_detailsEn={additional_detailsEn} setAddDetailsEn={setAddDetailsEn}
                        t={t} isRTL={isRTL}
                    />
                    <div className="modal-divider" />

                    {/* 2. UNIT TYPES */}
                    <UnitTypesSection
                        selectedUnits={selectedUnits} setSelectedUnits={setSelectedUnits}
                        unitDropdownOpen={unitDropdownOpen} setUnitDropdownOpen={setUnitDropdownOpen}
                        t={t} isRTL={isRTL}
                    />
                    <div className="modal-divider" />

                    {/* 3. LOCATION */}
                 
                    <LocationSection
                        gouvernate={gouvernate} setGovernorate={setGovernorate}
                        state={state} setWilayat={setWilayat}
                        location={location} setLocation={setLocation}
                        lat={lat} setLat={setLat}
                        lng={lng} setLng={setLng}
                        nearTo={nearTo} setNearTo={setNearTo}
                        t={t} isRTL={isRTL}
                    />
                    <div className="modal-divider" />

                    {/* 4. CONTACT */}
                    <ContactSection
                        managmentPhone={managmentPhone} setManagmentPhone={setManagmentPhone}
                        workerPhone={workerPhone} setWorkerPhone={setWorkerPhone}
                        t={t} isRTL={isRTL}
                    />
                    <div className="modal-divider" />

                    {/* 5. FINANCIALS */}
                    <FinancialsSection
                        minimumRent={minimumRent} setMinimumRent={setMinimumRent}
                        maxRent={maxRent} setMaxRent={setMaxRent}
                        minDays={minDays} setMinDays={setMinDays}
                        acceptDownPay={acceptDownPay} setAcceptDownPay={setAcceptDownPay}
                        isExclusive={isExclusive} setIsExclusive={setIsExclusive}
                        t={t} isRTL={isRTL}
                    />
                    <div className="modal-divider" />

                    {/* 6. POLICY & STATUS */}
                    <PolicySection
                        check_In={check_In} setCheckIn={setCheckIn}
                        check_Out={check_Out} setCheckOut={setCheckOut}
                        cancelation_policyAr={cancelation_policyAr} setCancelPolicyAr={setCancelPolicyAr}
                        cancelation_policyEn={cancelation_policyEn} setCancelPolicyEn={setCancelPolicyEn}
                        buildingPolicyAr={buildingPolicyAr} setBuildingPolicyAr={setBuildingPolicyAr}
                        buildingPolicyEn={buildingPolicyEn} setBuildingPolicyEn={setBuildingPolicyEn}
                        t={t} isRTL={isRTL}
                    />
                  
                    <div className="modal-divider" />

                    {/* 7. MEDIA */}
                    <MediaSection
                        coverPreview={coverPreview}
                        existingImages={existingImages}
                        galFiles={galFiles}
                        coverInputRef={coverInputRef}
                        galInputRef={galInputRef}
                        handleCover={handleCover}
                        handleGallery={handleGallery}
                        removeExistingImage={removeExistingImage}
                        removeNewGalImage={removeNewGalImage}
                        t={t}
                        isRTL={isRTL}
                    />
                  

                    <div className="modal-divider" />

                    {/* 8. SERVICES */}
                    <section>
                        <div className="modal-section-title">{t('services_utilities')}
                            <span style={{ color: '#ef4444' }}>*</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', width: '100%' }}>
                            {AMENITIES_UI.map(item => (
                                <AmenityTile
                                    key={item.key}
                                    item={item}
                                    checked={!!checkedAmenities[item.key]}
                                    onChange={() => toggleAmenity(item.key)}
                                    t={t}
                                    lang={lang}
                                />
                            ))}
                        </div>
                    </section>

                </div>

                {/* FOOTER */}
                <div className="modal-footer" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <FormActions
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        isLoading={isLoading}
                        t={t}
                        isRTL={isRTL}
                    />
                </div>

            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
            `}</style>
        </div>
    );
}