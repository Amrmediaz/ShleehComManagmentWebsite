import React, { useState, useRef } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { AddBuildingUseCase } from '../../core/useCases/AddBuildingUseCase';
import { fileUploadApiClient } from '../../data/FileUploadClient';
import {
    IconX, IconBuilding, IconShieldLock, IconWifi, IconCar, IconElevator,
    IconSnowflake, IconBarbell, IconRipple, IconBolt, IconCamera,
} from '@tabler/icons-react';

// ===== SECTIONS =====
import BasicInfoSection from '../components/BuilidingAddingUpdating/BasicInfoSection';
import LocationSection from '../components/BuilidingAddingUpdating/LocationSection';
import ContactSection from '../components/BuilidingAddingUpdating/ContactSection';
import FinancialsSection from '../components/BuilidingAddingUpdating/FinancialsSection';
import PolicySection from '../components/BuilidingAddingUpdating/PolicySection';

// ===== UI COMPONENTS =====
import AmenityTile from '../components/BuilidingAddingUpdating/AmenityTile';
import StatusMessage from '../components/BuilidingAddingUpdating/StatusMessage';
import FormActions from '../components/BuilidingAddingUpdating/FormActions';
import UnitTypesSection from '../components/BuilidingAddingUpdating/UnitTypesSection.jsx';
import MediaSection from '../components/BuilidingAddingUpdating/MediaSection.jsx';

// ===== UTILITIES =====
import { resolveOwnerId, buildFormData, parseFileUploadResponse } from '../../core/utils/helper/FormHelpers.js';
import { UNIT_TYPES, AMENITY_SERVICE_MAP } from '../../core/utils/constants/building_constants.js';

// ===== STYLES =====
import '../styles/AddBuildingModal.css';
import { validateBuildingFields } from "../../core/utils/validations/ValidationBuildingFields.js";

/**
 * AddBuildingModal Component
 * Main modal for adding new buildings with all sections and features
 * Refactored from 2000+ lines into modular, maintainable code
 */
export default function AddBuildingModal({ isOpen, onClose, ownerId: ownerIdProp }) {
    // ===== LANGUAGE & OWNER ID =====
    const { t, lang } = useTranslation();
    const isRTL = lang === 'ar';
    const resolvedOwnerId = resolveOwnerId(ownerIdProp);

    // ===== BASIC INFO STATE =====
    const [nameAr, setNameAr] = useState('');
    const [nameEn, setNameEn] = useState('');
    const [totalFloor, setTotalFloor] = useState('');
    const [totalFlats, setTotalFlats] = useState('');
    const [yearBulit, setYearBulit] = useState('');
    const [buldinNumber, setBuldinNumber] = useState('');
    const [buldingDescrptionAr, setDescAr] = useState('');
    const [buldingDescrptionEn, setDescEn] = useState('');
    const [additional_detailsAr, setAddDetailsAr] = useState('');
    const [additional_detailsEn, setAddDetailsEn] = useState('');

    // ===== LOCATION STATE =====
    const [gouvernate, setGovernorate] = useState('');
    const [state, setWilayat] = useState('');
    const [location, setLocation] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [nearTo, setNearTo] = useState('');

    // ===== CONTACT STATE =====
    const [managmentPhone, setManagmentPhone] = useState('');
    const [workerPhone, setWorkerPhone] = useState('');

    // ===== FINANCIAL STATE =====
    const [minimumRent, setMinimumRent] = useState('');
    const [maxRent, setMaxRent] = useState('');
    const [minDays, setMinDays] = useState('');
    const [acceptDownPay, setAcceptDownPay] = useState(false);
    const [isExclusive, setIsExclusive] = useState(false);

    // ===== POLICY STATE =====
    const [check_In, setCheckIn] = useState('14:00');
    const [check_Out, setCheckOut] = useState('11:00');
    const [cancelation_policyAr, setCancelPolicyAr] = useState('');
    const [cancelation_policyEn, setCancelPolicyEn] = useState('');
    const [buildingPolicyAr, setBuildingPolicyAr] = useState('');
    const [buildingPolicyEn, setBuildingPolicyEn] = useState('');

    // ===== UNIT TYPES STATE =====
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);

    // ===== MEDIA STATE =====
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [galFiles, setGalFiles] = useState([]);
    const coverInputRef = useRef();
    const galInputRef = useRef();

    // ===== AMENITIES STATE =====
    const [checkedAmenities, setCheckedAmenities] = useState({});

    // ===== UI STATE =====
    const [isLoading, setIsLoading] = useState(false);
    // BUG FIX #1: Changed state property from 'tokenKey' to 'text'
    const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

    // ===== HANDLERS =====

    /**
     * Toggle amenity checkbox
     */
    const toggleAmenity = (key) => {
        setCheckedAmenities(prev => ({ ...prev, [key]: !prev[key] }));
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async () => {
        setStatusMessage({ text: '', isError: false });
        setIsLoading(true);

        try {
            // Step 1: Validate all form fields
            const formState = {
                nameAr, nameEn, totalFloor, totalFlats, yearBulit, buldinNumber,
                buldingDescrptionAr, buldingDescrptionEn, additional_detailsAr, additional_detailsEn,
                minimumRent, maxRent, minDays,
                gouvernate, state, location, lat, lng, nearTo,
                managmentPhone, workerPhone,
                buildingPolicyAr, buildingPolicyEn, cancelation_policyAr, cancelation_policyEn,
                acceptDownPay, isExclusive,
                check_In, check_Out,
            };

            // BUG FIX #6: Changed 'var' to 'const' and fixed variable name typo
            const validationError = validateBuildingFields(formState, t);
            if (validationError) {
                setStatusMessage({ text: validationError, isError: true });
                // BUG FIX #10: Added missing setIsLoading(false) and return
                setIsLoading(false);
                return;
            }
            const hasAmenities = Object.values(checkedAmenities).some(v => v === true);
            if (!hasAmenities) {
                setStatusMessage({ text: t('error_amenities_required'), isError: true });
                setIsLoading(false);
                return;
            }
            // Step 2: Validate cover image existence
            if (!coverFile) {
                setStatusMessage({ text: t('error_cover_required') || 'Cover image is required.', isError: true });
                setIsLoading(false);
                return;
            }

            // Step 3: Validate gallery images existence (BUG FIX #3: Removed duplicate check)
            if (galFiles.length === 0) {
                setStatusMessage({ text: t('error_images_required') || 'Gallery images are required.', isError: true });
                setIsLoading(false);
                return;
            }

            // Step 4: Upload cover image with proper error handling
            let coverimg = '';
            try {
                const responseString = await fileUploadApiClient.uploadFile(coverFile);
                const { success, url, error } = parseFileUploadResponse(responseString);

                if (success && url) {
                    coverimg = url;
                } else {
                    throw new Error(error || 'Failed to upload cover image');
                }
            } catch (uploadError) {
                console.error('[AddBuildingModal] Cover image upload failed:', uploadError);
                setStatusMessage({ text: t('error_upload_failed') || 'Upload failed.', isError: true });
                setIsLoading(false);
                return;
            }

            // Step 5: Upload gallery images with proper error handling
            const buldingImages = [];
            try {
                for (const { file } of galFiles) {
                    const responseString = await fileUploadApiClient.uploadFile(file);
                    const { success, url, error } = parseFileUploadResponse(responseString);

                    // BUG FIX #5: Added else block for failed uploads instead of silently continuing
                    if (success && url) {
                        buldingImages.push({
                            id: 0,
                            path: url,
                            hotelbuildingID: 0
                        });
                    } else {
                        console.error('[AddBuildingModal] Gallery image upload failed:', error);
                        throw new Error(error || 'Failed to upload one or more gallery images');
                    }
                }

                // Verify at least one image was uploaded successfully
                if (buldingImages.length === 0) {
                    throw new Error('No gallery images were uploaded successfully');
                }
            } catch (galleryError) {
                console.error('[AddBuildingModal] Gallery upload process failed:', galleryError);
                setStatusMessage({ text: t('error_images_required') || 'Failed to upload gallery images.', isError: true });
                setIsLoading(false);
                return;
            }
           

            // Step 6: Build form data
            const formData = buildFormData(
                formState,
                coverimg,
                buldingImages,
                selectedUnits,
                checkedAmenities,
                resolvedOwnerId
            );

            // Step 7: Submit to API
            const { validationError: apiError, result } = await AddBuildingUseCase.execute(formData, t);

            if (apiError) {
                setStatusMessage({ text: apiError, isError: true });
                setIsLoading(false);
                return;
            }

            if (result && result.status === true) {
                setStatusMessage({ text: t('building_added_sucess'), isError: false });
                setTimeout(() => onClose(), 1400);
            } else {
                setStatusMessage({
                    text: result?.message || t('building_add_failed') || 'Failed to add building',
                    isError: true
                });
                setIsLoading(false);
            }
        } catch (error) {
            console.error('[AddBuildingModal] Unexpected error:', error);
            setStatusMessage({ text: t('server_error') || 'Server error occurred.', isError: true });
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    // ===== AMENITIES CONFIG =====
    const amenities = [
        { key: 'sec_24', Icon: IconShieldLock, bg: '#EEEDFE', color: '#534AB7' },
        { key: 'wifi', Icon: IconWifi, bg: '#E6F1FB', color: '#185FA5' },
        { key: 'parking', Icon: IconCar, bg: '#E1F5EE', color: '#0F6E56' },
        { key: 'elevator', Icon: IconElevator, bg: '#FAEEDA', color: '#854F0B' },
        { key: 'ac', Icon: IconSnowflake, bg: '#FAECE7', color: '#993C1D' },
        { key: 'gym', Icon: IconBarbell, bg: '#FBEAF0', color: '#993556' },
        { key: 'pool', Icon: IconRipple, bg: '#E6F1FB', color: '#185FA5' },
        { key: 'power', Icon: IconBolt, bg: '#FAEEDA', color: '#854F0B' },
        { key: 'cctv', Icon: IconCamera, bg: '#F1EFE8', color: '#5F5E5A' },
    ];

    // ===== RENDER =====
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>

                {/* ===== HEADER ===== */}
                <div className="modal-header" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <div className="modal-header__content" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <div className="modal-header__icon">
                            <IconBuilding size={18} color="#185FA5" />
                        </div>
                        <div>
                            <div className="modal-header__title">{t('add_property_title')}</div>
                            <div className="modal-header__subtitle">{t('register_asset')}</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="modal-header__close">
                        <IconX size={20} />
                    </button>
                </div>

                {/* ===== BODY ===== */}
                <div className="modal-body">

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

                    {/* 6. POLICY */}
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
                        coverFile={coverFile}
                        setCoverFile={setCoverFile}
                        coverPreview={coverPreview}
                        setCoverPreview={setCoverPreview}
                        galFiles={galFiles}
                        setGalFiles={setGalFiles}
                        t={t}
                        isRTL={isRTL}
                    />
                    <div className="modal-divider" />

                    {/* 8. SERVICES */}
                    <section>
                        <div className="modal-section-title">{t('services_utilities')}
                            <span style={{ color: '#ef4444' }}>*</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                            width: '100%'
                        }}>
                            {amenities.map(item => (
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

                {/* BUG FIX #1: Fixed status message display with correct property name */}
                {statusMessage.text && (
                    <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: statusMessage.isError ? '#fef2f2' : '#f0fdf4', color: statusMessage.isError ? '#dc2626' : '#16a34a', border: `1px solid ${statusMessage.isError ? '#fecaca' : '#bbf7d0'}` }}>
                        {statusMessage.text}
                    </div>
                )}

                {/* ===== FOOTER ===== */}
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
        </div>
    );
}