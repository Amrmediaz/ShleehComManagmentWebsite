import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { AddBuildingUseCase } from '../../core/useCases/AddBuildingUseCase';
import { fileUploadApiClient } from '../../data/FileUploadClient';
import {
    IconX, IconBuilding, IconShieldLock, IconWifi, IconCar, IconElevator,
    IconSnowflake, IconBarbell, IconRipple, IconBolt, IconCamera,
    IconCheck, IconChevronLeft, IconChevronRight, IconInfoCircle,
} from '@tabler/icons-react';

// ===== SECTIONS =====
import BasicInfoSection from '../components/BuilidingAddingUpdating/BasicInfoSection';
import LocationSection from '../components/BuilidingAddingUpdating/LocationSection';
import ContactSection from '../components/BuilidingAddingUpdating/ContactSection';
import FinancialsSection from '../components/BuilidingAddingUpdating/FinancialsSection';
import PolicySection from '../components/BuilidingAddingUpdating/PolicySection';

// ===== UI COMPONENTS =====
import AmenityTile from '../components/BuilidingAddingUpdating/AmenityTile';
import UnitTypesSection from '../components/BuilidingAddingUpdating/UnitTypesSection.jsx';
import MediaSection from '../components/BuilidingAddingUpdating/MediaSection.jsx';

// ===== UTILITIES =====
import { resolveOwnerId, buildFormData, parseFileUploadResponse } from '../../core/utils/helper/FormHelpers.js';
import { localizeGovernorate, localizeWilayat } from '../../core/utils/Constants/building_constants.js';

// ===== STYLES =====
import '../styles/AddBuildingModal.css';

const STEP_KEYS = ['basics', 'units', 'location', 'contact', 'financials', 'policy', 'media', 'services', 'review'];

/**
 * AddBuildingModal
 * A guided, step-by-step wizard for adding a new building — one section
 * visible at a time, with a progress indicator, short help text per step,
 * and validation before moving forward. Mirrors AddChaletModal's stepper
 * pattern so both flows feel consistent for the owner.
 */
export default function AddBuildingModal({ isOpen, onClose, onSaved, ownerId: ownerIdProp }) {
    // ===== LANGUAGE & OWNER ID =====
    const { t, lang } = useTranslation();
    const isRTL = lang === 'ar';
    const resolvedOwnerId = resolveOwnerId(ownerIdProp);

    // ===== WIZARD STATE =====
    const [stepIndex, setStepIndex] = useState(0);
    const [maxReached, setMaxReached] = useState(0);
    const [stepError, setStepError] = useState('');

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

    // ===== AMENITIES STATE =====
    const [checkedAmenities, setCheckedAmenities] = useState({});

    // ===== UI STATE =====
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

    if (!isOpen) return null;

    // ===== HANDLERS =====
    const toggleAmenity = (key) => {
        setCheckedAmenities(prev => ({ ...prev, [key]: !prev[key] }));
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

    // ===== STEP DEFINITIONS =====
    const steps = [
        { key: 'basics', title: t('basic_info'), help: t('step_building_basics_help') || "Let's start with the building's name, floors and flat count." },
        { key: 'units', title: t('step_unit_types') || 'Unit Types', help: t('step_unit_types_help') || 'Select the flat types available in this building.' },
        { key: 'location', title: t('step_location') || 'Location', help: t('step_location_help') || 'Pick the governorate and wilayat, then set the exact spot on the map.' },
        { key: 'contact', title: t('step_contact') || 'Contact', help: t('step_contact_help') || 'Add phone numbers tenants and staff can reach you on.' },
        { key: 'financials', title: t('financials'), help: t('step_financials_help') || 'Set the rental price range and available payment options.' },
        { key: 'policy', title: t('complex_status'), help: t('step_policy_help') || "Set check-in/check-out times and the building's policies." },
        { key: 'media', title: t('media'), help: t('step_media_help') || 'Add a cover photo and gallery images so tenants can see the property.' },
        { key: 'services', title: t('services_utilities'), help: t('step_services_help') || 'Select everything guests will have access to. Pick at least one.' },
        { key: 'review', title: t('step_review') || 'Review', help: t('step_review_help') || 'Double-check everything below, then submit.' },
    ];
    const totalSteps = steps.length;
    const current = steps[stepIndex];

    // ===== PER-STEP VALIDATION (mirrors validateBuildingFields, split by step) =====
    const validateStep = (index) => {
        const key = STEP_KEYS[index];
        if (key === 'basics') {
            if (!nameAr.trim()) return t('error_name_ar_required');
            if (!nameEn.trim()) return t('error_name_en_required');
            if (!totalFloor || Number(totalFloor) < 1) return t('error_floors_required');
            if (!totalFlats || Number(totalFlats) < 1) return t('error_flats_required');
            const year = Number(yearBulit);
            if (!yearBulit || isNaN(year) || year < 1900 || year > new Date().getFullYear()) return t('error_year_invalid');
            if (!buldinNumber.trim()) return t('error_building_number_required');
        }
        if (key === 'location') {
            if (!gouvernate.trim()) return t('error_governorate_required');
            if (!state.trim()) return t('error_wilayat_required');
            if (!location.trim()) return t('error_location_required');
            if (!lat.trim() || !lng.trim()) return t('error_location_cor_required');
        }
        if (key === 'contact') {
            if (!managmentPhone.trim()) return t('error_name_managment_phone_required');
            if (workerPhone.trim() && managmentPhone.trim() && managmentPhone.trim() === workerPhone.trim()) {
                return t('error_managment_phone_same_workeker_phone');
            }
        }
        if (key === 'financials') {
            const minR = Number(minimumRent);
            const maxR = Number(maxRent);
            if (!minimumRent || isNaN(minR) || minR < 0) return t('error_min_rent_required');
            if (!maxRent || isNaN(maxR) || maxR < 0) return t('error_max_rent_required');
            if (maxR < minR) return t('error_rent_range_invalid');
        }
        if (key === 'policy') {
            const buildingPolicyWords = buildingPolicyAr.trim().split(/\s+/).filter(Boolean).length || 0;
            const cancellationPolicyWords = cancelation_policyAr.trim().split(/\s+/).filter(Boolean).length || 0;
            if (buildingPolicyWords < 5) return t('error_building_policy_min_words');
            if (cancellationPolicyWords < 5) return t('error_cancellation_policy_min_words');
        }
        if (key === 'media') {
            if (!coverFile) return t('error_cover_required') || 'Cover image is required.';
            if (galFiles.length === 0) return t('error_images_required') || 'Gallery images are required.';
        }
        if (key === 'services') {
            const hasAmenities = Object.values(checkedAmenities).some(v => v === true);
            if (!hasAmenities) return t('error_amenities_required');
        }
        return null;
    };

    const goToStep = (index) => {
        if (index < 0 || index >= totalSteps) return;
        if (index > maxReached) return; // can't skip ahead past unvisited steps
        setStepError('');
        setStepIndex(index);
    };

    const goNext = () => {
        const error = validateStep(stepIndex);
        if (error) {
            setStepError(error);
            return;
        }
        setStepError('');
        const next = Math.min(stepIndex + 1, totalSteps - 1);
        setStepIndex(next);
        setMaxReached(prev => Math.max(prev, next));
    };

    const goBack = () => {
        setStepError('');
        setStepIndex(prev => Math.max(prev - 1, 0));
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async () => {
        // Re-validate every step once more before actually submitting.
        for (let i = 0; i < totalSteps - 1; i++) {
            const error = validateStep(i);
            if (error) {
                setStepIndex(i);
                setMaxReached(prev => Math.max(prev, i));
                setStepError(error);
                return;
            }
        }

        setStatusMessage({ text: '', isError: false });
        setIsLoading(true);

        try {
            // Step 1: Upload cover image with proper error handling
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

            // Step 2: Upload gallery images with proper error handling
            const buldingImages = [];
            try {
                for (const { file } of galFiles) {
                    const responseString = await fileUploadApiClient.uploadFile(file);
                    const { success, url, error } = parseFileUploadResponse(responseString);

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

                if (buldingImages.length === 0) {
                    throw new Error('No gallery images were uploaded successfully');
                }
            } catch (galleryError) {
                console.error('[AddBuildingModal] Gallery upload process failed:', galleryError);
                setStatusMessage({ text: t('error_images_required') || 'Failed to upload gallery images.', isError: true });
                setIsLoading(false);
                return;
            }

            // Step 3: Build form data
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
            const formData = buildFormData(
                formState,
                coverimg,
                buldingImages,
                selectedUnits,
                checkedAmenities,
                resolvedOwnerId
            );

            // Step 4: Submit to API
            const { validationError: apiError, result } = await AddBuildingUseCase.execute(formData, t);

            if (apiError) {
                setStatusMessage({ text: apiError, isError: true });
                setIsLoading(false);
                return;
            }

            if (result && result.status === true) {
                setStatusMessage({ text: t('building_added_sucess'), isError: false });
                setTimeout(() => { onSaved?.(); onClose(); }, 1400);
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

    const arrowBack = isRTL ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />;
    const arrowNext = isRTL ? <IconChevronLeft size={16} /> : <IconChevronRight size={16} />;

    // ===== RENDER =====
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

                {/* ===== STEP PROGRESS ===== */}
                <div style={{ padding: '16px 24px 0', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginBottom: '8px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <span>{(t('step_of') || 'Step {current} of {total}').replace('{current}', stepIndex + 1).replace('{total}', totalSteps)}</span>
                        <span style={{ fontWeight: 600, color: '#185FA5' }}>{current.title}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {steps.map((s, idx) => (
                            <div
                                key={s.key}
                                onClick={() => goToStep(idx)}
                                title={s.title}
                                style={{
                                    flex: 1,
                                    height: '6px',
                                    borderRadius: '4px',
                                    cursor: idx <= maxReached ? 'pointer' : 'default',
                                    background: idx <= stepIndex ? '#185FA5' : '#e5e7eb',
                                    opacity: idx < stepIndex ? 0.55 : 1,
                                    transition: 'background 0.2s',
                                }}
                            />
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '10px' }}>
                        {steps.map((s, idx) => (
                            <button
                                type="button"
                                key={s.key}
                                onClick={() => goToStep(idx)}
                                disabled={idx > maxReached}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', padding: 0,
                                    cursor: idx <= maxReached ? 'pointer' : 'default',
                                    fontSize: '11.5px', fontWeight: idx === stepIndex ? 700 : 500,
                                    color: idx === stepIndex ? '#185FA5' : idx < stepIndex ? '#16a34a' : '#9ca3af',
                                }}
                            >
                                <span style={{
                                    width: '16px', height: '16px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '10px', fontWeight: 700,
                                    background: idx < stepIndex ? '#dcfce7' : idx === stepIndex ? '#e6f1fb' : '#f3f4f6',
                                    color: idx < stepIndex ? '#16a34a' : idx === stepIndex ? '#185FA5' : '#9ca3af',
                                }}>
                                    {idx < stepIndex ? <IconCheck size={11} /> : idx + 1}
                                </span>
                                {s.title}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="modal-divider" />

                {/* ===== BODY ===== */}
                <div className="modal-body">
                    {/* Guidance banner for the current step */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#e6f1fb', border: '1px solid #c7ddf5', borderRadius: '10px', padding: '12px 14px', marginBottom: '18px', fontSize: '12.5px', color: '#0c447c' }}>
                        <IconInfoCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                        <span>{current.help}</span>
                    </div>

                    {current.key === 'basics' && (
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
                    )}

                    {current.key === 'units' && (
                        <UnitTypesSection
                            selectedUnits={selectedUnits} setSelectedUnits={setSelectedUnits}
                            unitDropdownOpen={unitDropdownOpen} setUnitDropdownOpen={setUnitDropdownOpen}
                            t={t} isRTL={isRTL}
                        />
                    )}

                    {current.key === 'location' && (
                        <LocationSection
                            gouvernate={gouvernate} setGovernorate={setGovernorate}
                            state={state} setWilayat={setWilayat}
                            location={location} setLocation={setLocation}
                            lat={lat} setLat={setLat}
                            lng={lng} setLng={setLng}
                            nearTo={nearTo} setNearTo={setNearTo}
                            t={t} isRTL={isRTL} lang={lang}
                        />
                    )}

                    {current.key === 'contact' && (
                        <ContactSection
                            managmentPhone={managmentPhone} setManagmentPhone={setManagmentPhone}
                            workerPhone={workerPhone} setWorkerPhone={setWorkerPhone}
                            t={t} isRTL={isRTL}
                        />
                    )}

                    {current.key === 'financials' && (
                        <FinancialsSection
                            minimumRent={minimumRent} setMinimumRent={setMinimumRent}
                            maxRent={maxRent} setMaxRent={setMaxRent}
                            minDays={minDays} setMinDays={setMinDays}
                            acceptDownPay={acceptDownPay} setAcceptDownPay={setAcceptDownPay}
                            isExclusive={isExclusive} setIsExclusive={setIsExclusive}
                            t={t} isRTL={isRTL}
                        />
                    )}

                    {current.key === 'policy' && (
                        <PolicySection
                            check_In={check_In} setCheckIn={setCheckIn}
                            check_Out={check_Out} setCheckOut={setCheckOut}
                            cancelation_policyAr={cancelation_policyAr} setCancelPolicyAr={setCancelPolicyAr}
                            cancelation_policyEn={cancelation_policyEn} setCancelPolicyEn={setCancelPolicyEn}
                            buildingPolicyAr={buildingPolicyAr} setBuildingPolicyAr={setBuildingPolicyAr}
                            buildingPolicyEn={buildingPolicyEn} setBuildingPolicyEn={setBuildingPolicyEn}
                            t={t} isRTL={isRTL}
                        />
                    )}

                    {current.key === 'media' && (
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
                    )}

                    {current.key === 'services' && (
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
                    )}

                    {current.key === 'review' && (
                        <ReviewStep
                            t={t}
                            lang={lang}
                            data={{
                                nameAr, nameEn, totalFloor, totalFlats,
                                unitsCount: selectedUnits.length,
                                gouvernate, state,
                                managmentPhone,
                                minimumRent, maxRent,
                                check_In, check_Out,
                                mediaCount: (coverFile ? 1 : 0) + galFiles.length,
                                servicesCount: Object.values(checkedAmenities).filter(Boolean).length,
                            }}
                            onEditStep={goToStep}
                        />
                    )}

                    {stepError && (
                        <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                            {stepError}
                        </div>
                    )}
                </div>

                {/* ===== FOOTER ===== */}
                <div className="modal-footer" style={{ flexDirection: isRTL ? 'row-reverse' : 'row', display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                    {statusMessage.text && (
                        <div style={{ flex: 1, padding: '12px 14px', borderRadius: '8px', fontSize: '13px', background: statusMessage.isError ? '#fef2f2' : '#f0fdf4', color: statusMessage.isError ? '#dc2626' : '#16a34a', border: `1px solid ${statusMessage.isError ? '#fecaca' : '#bbf7d0'}` }}>
                            {statusMessage.text}
                        </div>
                    )}
                    <div style={{ flexShrink: 0, display: 'flex', gap: '10px', marginInlineStart: 'auto', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <button type="button" onClick={onClose} className="btn btn-secondary" style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', cursor: 'pointer' }}>
                            {t('cancel') || 'Cancel'}
                        </button>
                        {stepIndex > 0 && (
                            <button type="button" onClick={goBack} disabled={isLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', cursor: 'pointer' }}>
                                {arrowBack} {t('back') || 'Back'}
                            </button>
                        )}
                        {current.key !== 'review' ? (
                            <button type="button" onClick={goNext} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                {t('next') || 'Next'} {arrowNext}
                            </button>
                        ) : (
                            <button type="button" onClick={handleSubmit} disabled={isLoading} style={{ background: isLoading ? '#93c0e4' : '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '13px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer' }}>
                                {isLoading ? (t('saving') || 'Saving…') : (t('add_building') || 'Add Building')}
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

/** ReviewStep — a compact read-only summary of the building before submitting. */
function ReviewStep({ t, lang, data, onEditStep }) {
    const rows = [
        { label: t('basic_info'), value: data.nameEn || data.nameAr, step: 0 },
        { label: `${t('total_floors')} / ${t('total_flats')}`, value: `${data.totalFloor || 0} / ${data.totalFlats || 0}`, step: 0 },
        { label: t('step_unit_types') || 'Unit Types', value: `${data.unitsCount} ${t('selected') || 'selected'}`, step: 1 },
        { label: t('location'), value: [localizeWilayat(data.state, lang), localizeGovernorate(data.gouvernate, lang)].filter(Boolean).join(', '), step: 2 },
        { label: t('step_contact') || 'Contact', value: data.managmentPhone, step: 3 },
        { label: t('min_rent'), value: data.minimumRent ? `${data.minimumRent} ${t('OMR') || 'OMR'}` : '', step: 4 },
        { label: t('max_rent'), value: data.maxRent ? `${data.maxRent} ${t('OMR') || 'OMR'}` : '', step: 4 },
        { label: `${t('check_in')} / ${t('check_out')}`, value: `${data.check_In || ''} / ${data.check_Out || ''}`, step: 5 },
        { label: t('media'), value: `${data.mediaCount} ${t('photos') || 'photos'}`, step: 6 },
        { label: t('services_utilities'), value: `${data.servicesCount} ${t('selected') || 'selected'}`, step: 7 },
    ];

    return (
        <section>
            <div className="modal-section-title">{t('review_summary') || 'Summary'}</div>
            <div style={{ borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                {rows.map((row, idx) => (
                    !row.value ? null : (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: idx === rows.length - 1 ? 'none' : '1px solid #f1f5f9', fontSize: '13px', background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                            <span style={{ color: '#6b7280' }}>{row.label}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, color: '#111827' }}>
                                {row.value}
                                <button type="button" onClick={() => onEditStep(row.step)} style={{ background: 'none', border: 'none', color: '#185FA5', fontSize: '11.5px', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                                    {t('edit_step') || 'Edit'}
                                </button>
                            </span>
                        </div>
                    )
                ))}
            </div>
        </section>
    );
}
