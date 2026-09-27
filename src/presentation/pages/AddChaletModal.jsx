import React, { useState, useRef } from 'react';
import { useTranslation } from '../context/LanguageContext.jsx';
import { fileUploadApiClient } from '../../data/FileUploadClient.js';
import { AddChaletUseCase, UpdateChaletUseCase } from '../../core/useCases/ChaletUseCases.js';
import { IconX, IconHome, IconTrash, IconPlus, IconCheck, IconChevronLeft, IconChevronRight, IconInfoCircle } from '@tabler/icons-react';

import ChaletBasicInfoSection from '../components/ChaletAddingUpdating/ChaletBasicInfoSection.jsx';
import ChaletCharacteristicsSection from '../components/ChaletAddingUpdating/ChaletCharacteristicsSection.jsx';
import ChaletPricingSection from '../components/ChaletAddingUpdating/ChaletPricingSection.jsx';
import LocationSection from '../components/BuilidingAddingUpdating/LocationSection.jsx';

import { parseFileUploadResponse, resolveOwnerId } from '../../core/utils/helper/FormHelpers.js';
import { localizeGovernorate, localizeWilayat } from '../../core/utils/Constants/building_constants.js';

import '../styles/AddBuildingModal.css';

const CHALET_SERVICES = ['wifi', 'menPool', 'womenPool', 'childGames', 'games', 'noSmoking', 'grill', 'animals'];

const STEP_KEYS = ['basics', 'characteristics', 'location', 'pricing', 'services', 'photos', 'review'];

function toggleInArray(arr, value) {
    return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
}

/**
 * AddChaletModal
 * A guided, step-by-step wizard for adding/editing a chalet — one section
 * visible at a time, with a progress indicator, short help text per step,
 * and validation before moving forward (mirrors the mobile app's
 * AddChaletScreen stepper instead of one long scrolling form).
 */
export default function AddChaletModal({ isOpen, onClose, chalet = null, onSaved }) {
    const { t, lang } = useTranslation();
    const isRTL = lang === 'ar';
    const isEdit = !!chalet;

    // ===== WIZARD STATE =====
    const [stepIndex, setStepIndex] = useState(0);
    const [maxReached, setMaxReached] = useState(0);
    const [stepError, setStepError] = useState('');

    // ===== BASIC INFO =====
    const [name, setName] = useState(chalet?.name || '');
    const [chaletType, setChaletType] = useState(chalet?.chaletType || 'Chalet');
    const [capacity, setCapacity] = useState(chalet?.capacity || '');
    const [bedrooms, setBedrooms] = useState(chalet?.bedrooms || '');
    const [bathrooms, setBathrooms] = useState(chalet?.bathrooms || '');
    const [livingRooms, setLivingRooms] = useState(chalet?.livingRooms || '');
    const [buildingDescription, setBuildingDescription] = useState(chalet?.buildingDescription || '');
    const [note, setNote] = useState(chalet?.note || '');

    // ===== CHARACTERISTICS =====
    const [suitableFor, setSuitableFor] = useState(chalet?.suitableFor ? chalet.suitableFor.split(',').map(s => s.trim()).filter(Boolean) : []);
    const [landscape, setLandscape] = useState(chalet?.landscape ? chalet.landscape.split(',').map(s => s.trim()).filter(Boolean) : []);
    const [outdoorSpace, setOutdoorSpace] = useState(chalet?.outdoorSpace ? chalet.outdoorSpace.split(',').map(s => s.trim()).filter(Boolean) : []);
    const [safety, setSafety] = useState(chalet?.safety || '');
    const [atmosphere, setAtmosphere] = useState(chalet?.atmosphere || '');
    const [bestSeason, setBestSeason] = useState(chalet?.bestSeason || '');

    // ===== PRICING =====
    const [rentFullDay, setRentFullDay] = useState(chalet?.rentFullDay || '');
    const [rentHalfDay, setRentHalfDay] = useState(chalet?.rentHalfDay || '');
    const [offDayPriceFullDay, setOffDayPriceFullDay] = useState(chalet?.offDayPriceFullDay || '');
    const [offDayPriceHalfDay, setOffDayPriceHalfDay] = useState(chalet?.offDayPriceHalfDay || '');
    const [rentWeekend, setRentWeekend] = useState(chalet?.rentWeekend || '');
    const [minDays, setMinDays] = useState(chalet?.minDays || '');
    const [insuranceAmount, setInsuranceAmount] = useState(chalet?.insuranceAmount || '');
    const [acceptDeposit, setAcceptDeposit] = useState(chalet?.acceptDeposit || false);
    const [stopBook, setStopBook] = useState(chalet?.stopBook || false);

    // ===== LOCATION =====
    const [gouvernate, setGovernorate] = useState(chalet?.gouvernate || '');
    const [state, setWilayat] = useState(chalet?.state || '');
    const [lat, setLat] = useState(chalet?.lat || '');
    const [lng, setLng] = useState(chalet?.lng || '');

    // ===== SERVICES =====
    const [checkedServices, setCheckedServices] = useState(() => {
        const checked = {};
        (chalet?.services || []).forEach(s => { checked[s] = true; });
        return checked;
    });

    // ===== IMAGES =====
    const [existingImages, setExistingImages] = useState(chalet?.images || []);
    const [newFiles, setNewFiles] = useState([]); // [{file, preview}]
    const galInputRef = useRef();

    // ===== UI STATE =====
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

    if (!isOpen) return null;

    const toggleService = (key) => setCheckedServices(prev => ({ ...prev, [key]: !prev[key] }));

    const handleGallery = (e) => {
        const files = Array.from(e.target.files);
        const totalCount = existingImages.length + newFiles.length;
        const remaining = 15 - totalCount;
        const entries = files.slice(0, remaining).map(file => ({ file, preview: URL.createObjectURL(file) }));
        setNewFiles(prev => [...prev, ...entries]);
        e.target.value = '';
    };
    const removeExisting = (id) => setExistingImages(prev => prev.filter(img => img.id !== id));
    const removeNew = (idx) => setNewFiles(prev => prev.filter((_, i) => i !== idx));

    // ===== STEP DEFINITIONS =====
    const steps = [
        { key: 'basics', title: t('step_basics') || 'Basics', help: t('step_basics_help') || "Let's start with the chalet's name, type and room breakdown." },
        { key: 'characteristics', title: t('step_characteristics') || 'Characteristics', help: t('step_characteristics_help') || 'Help guests know what to expect — who it suits and the setting around it.' },
        { key: 'location', title: t('step_location') || 'Location', help: t('step_location_help') || 'Pick the governorate and wilayat, then set the exact spot on the map.' },
        { key: 'pricing', title: t('step_pricing') || 'Pricing', help: t('step_pricing_help') || 'Set your rates. Only the full-day rate is required — add more if you offer them.' },
        { key: 'services', title: t('step_services') || 'Services', help: t('step_services_help') || 'Select everything guests will have access to. Pick at least one.' },
        { key: 'photos', title: t('step_photos') || 'Photos', help: t('step_photos_help') || 'Add photos so guests can see the chalet. The first photo becomes the cover.' },
        { key: 'review', title: t('step_review') || 'Review', help: t('step_review_help') || 'Double-check everything below, then submit.' },
    ];
    const totalSteps = steps.length;
    const current = steps[stepIndex];

    // ===== PER-STEP VALIDATION =====
    const validateStep = (index) => {
        const key = STEP_KEYS[index];
        if (key === 'basics') {
            if (!name.trim()) return t('error_chalet_name_required') || 'Chalet name is required';
            if (!chaletType) return t('error_chalet_type_required') || 'Chalet type is required';
            if (!capacity) return t('error_capacity_required') || 'Capacity is required';
        }
        if (key === 'location') {
            if (!gouvernate) return t('error_governorate_required') || 'Governorate is required';
            if (!state) return t('error_wilayat_required') || 'Wilayat is required';
            if (!lat || !lng) return t('error_location_cor_required') || 'Location coordinates are required';
        }
        if (key === 'pricing') {
            if (!rentFullDay) return t('error_base_rate_required') || 'Full day price is required';
        }
        if (key === 'services') {
            if (!Object.values(checkedServices).some(Boolean)) return t('error_services_required') || 'At least one service is required';
        }
        if (key === 'photos') {
            if (existingImages.length + newFiles.length === 0) return t('error_images_required') || 'At least one image is required';
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
            // Upload new images
            const uploaded = [];
            for (const { file } of newFiles) {
                const responseString = await fileUploadApiClient.uploadFile(file);
                const { success, url, error } = typeof responseString === 'string'
                    ? parseFileUploadResponse(responseString)
                    : { success: !!responseString, url: responseString };
                if (success && url) {
                    uploaded.push({ id: 0, path: url });
                } else {
                    throw new Error(error || 'Failed to upload an image');
                }
            }

            const buldingImages = [
                ...existingImages.map(img => ({ id: img.id || 0, path: img.url || img.path })),
                ...uploaded,
            ];

            const buldingService = Object.entries(checkedServices)
                .filter(([, v]) => v)
                .map(([key]) => ({ id: 0, serviceName: key }));

            const formState = {
                id: chalet?.id || 0,
                name,
                chaletType,
                capacity, bedrooms, bathrooms, livingRooms,
                suitableFor: suitableFor.join(', '),
                landscape: landscape.join(', '),
                outdoorSpace: outdoorSpace.join(', '),
                safety, atmosphere, bestSeason,
                buildingDescription, note,
                rentFullDay, rentHalfDay,
                offDayPriceFullDay, offDayPriceHalfDay,
                rentWeekend,
                minDays: minDays ? Number(minDays) : 0,
                insuranceAmount,
                acceptDeposit, stopBook,
                gouvernate, state, lat, lng,
                buldingImages,
                buldingService,
                ownerId: resolveOwnerId(),
                isActive: true,
                showComments: true,
            };

            const useCase = isEdit ? UpdateChaletUseCase : AddChaletUseCase;
            const { validationError, result } = await useCase.execute(formState, t);

            if (validationError) {
                setStatusMessage({ text: validationError, isError: true });
                setIsLoading(false);
                return;
            }

            if (result?.status === true || result?.status === undefined) {
                setStatusMessage({ text: isEdit ? (t('chalet_updated_success') || 'Chalet updated!') : (t('chalet_added_success') || 'Chalet added!'), isError: false });
                setTimeout(() => { onSaved?.(); onClose(); }, 1200);
            } else {
                setStatusMessage({ text: result?.message || (t('chalet_save_failed') || 'Failed to save chalet'), isError: true });
                setIsLoading(false);
            }
        } catch (err) {
            console.error('[AddChaletModal] Error:', err);
            setStatusMessage({ text: err.message || t('server_error') || 'Server error', isError: true });
            setIsLoading(false);
        }
    };

    const arrowBack = isRTL ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />;
    const arrowNext = isRTL ? <IconChevronLeft size={16} /> : <IconChevronRight size={16} />;

    return (
        <div className="modal-overlay">
            <div className="modal-container" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>

                <div className="modal-header" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <div className="modal-header__content" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <div className="modal-header__icon">
                            <IconHome size={18} color="#185FA5" />
                        </div>
                        <div>
                            <div className="modal-header__title">{isEdit ? (t('edit_chalet') || 'Edit Chalet') : (t('add_chalet_title') || 'Add New Chalet')}</div>
                            <div className="modal-header__subtitle">{t('register_chalet') || 'Register a standalone rentable chalet'}</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="modal-header__close"><IconX size={20} /></button>
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

                <div className="modal-body">
                    {/* Guidance banner for the current step */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#e6f1fb', border: '1px solid #c7ddf5', borderRadius: '10px', padding: '12px 14px', marginBottom: '18px', fontSize: '12.5px', color: '#0c447c' }}>
                        <IconInfoCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                        <span>{current.help}</span>
                    </div>

                    {current.key === 'basics' && (
                        <ChaletBasicInfoSection
                            name={name} setName={setName}
                            chaletType={chaletType} setChaletType={setChaletType}
                            capacity={capacity} setCapacity={setCapacity}
                            bedrooms={bedrooms} setBedrooms={setBedrooms}
                            bathrooms={bathrooms} setBathrooms={setBathrooms}
                            livingRooms={livingRooms} setLivingRooms={setLivingRooms}
                            buildingDescription={buildingDescription} setBuildingDescription={setBuildingDescription}
                            note={note} setNote={setNote}
                            t={t} isRTL={isRTL}
                        />
                    )}

                    {current.key === 'characteristics' && (
                        <ChaletCharacteristicsSection
                            suitableFor={suitableFor} toggleSuitableFor={(k) => setSuitableFor(prev => toggleInArray(prev, k))}
                            landscape={landscape} toggleLandscape={(k) => setLandscape(prev => toggleInArray(prev, k))}
                            outdoorSpace={outdoorSpace} toggleOutdoorSpace={(k) => setOutdoorSpace(prev => toggleInArray(prev, k))}
                            safety={safety} setSafety={setSafety}
                            atmosphere={atmosphere} setAtmosphere={setAtmosphere}
                            bestSeason={bestSeason} setBestSeason={setBestSeason}
                            t={t}
                        />
                    )}

                    {current.key === 'location' && (
                        <LocationSection
                            gouvernate={gouvernate} setGovernorate={setGovernorate}
                            state={state} setWilayat={setWilayat}
                            location="" setLocation={() => {}}
                            lat={lat} setLat={setLat}
                            lng={lng} setLng={setLng}
                            nearTo="" setNearTo={() => {}}
                            t={t} isRTL={isRTL} lang={lang}
                            showAddressFields={false}
                        />
                    )}

                    {current.key === 'pricing' && (
                        <ChaletPricingSection
                            rentFullDay={rentFullDay} setRentFullDay={setRentFullDay}
                            rentHalfDay={rentHalfDay} setRentHalfDay={setRentHalfDay}
                            offDayPriceFullDay={offDayPriceFullDay} setOffDayPriceFullDay={setOffDayPriceFullDay}
                            offDayPriceHalfDay={offDayPriceHalfDay} setOffDayPriceHalfDay={setOffDayPriceHalfDay}
                            rentWeekend={rentWeekend} setRentWeekend={setRentWeekend}
                            minDays={minDays} setMinDays={setMinDays}
                            insuranceAmount={insuranceAmount} setInsuranceAmount={setInsuranceAmount}
                            acceptDeposit={acceptDeposit} setAcceptDeposit={setAcceptDeposit}
                            stopBook={stopBook} setStopBook={setStopBook}
                            t={t}
                        />
                    )}

                    {current.key === 'services' && (
                        <section>
                            <div className="modal-section-title">{t('services_utilities')} <span style={{ color: '#ef4444' }}>*</span></div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {CHALET_SERVICES.map((key) => {
                                    const active = !!checkedServices[key];
                                    return (
                                        <button
                                            type="button"
                                            key={key}
                                            onClick={() => toggleService(key)}
                                            style={{
                                                padding: '9px 14px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
                                                border: active ? '1.5px solid #185FA5' : '1px solid #d1d5db',
                                                background: active ? '#e6f1fb' : '#fff',
                                                color: active ? '#185FA5' : '#374151',
                                            }}
                                        >
                                            {t(`chalet_service_${key}`) || key}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {current.key === 'photos' && (
                        <section>
                            <div className="modal-section-title">{t('media') || 'Media'} <span style={{ color: '#ef4444' }}>*</span></div>
                            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '10px' }}>
                                {t('first_image_is_cover') || 'The first image is used as the cover photo.'}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px' }}>
                                {existingImages.map((img) => (
                                    <div key={`ex-${img.id}`} style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', backgroundImage: `url(${img.url || img.path})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', border: '1px solid #e5e7eb' }}>
                                        <button type="button" onClick={() => removeExisting(img.id)} style={{ position: 'absolute', top: '4px', insetInlineEnd: '4px', background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: '4px', width: '20px', height: '20px', color: '#fff', cursor: 'pointer' }}>
                                            <IconTrash size={12} />
                                        </button>
                                    </div>
                                ))}
                                {newFiles.map(({ preview }, idx) => (
                                    <div key={`new-${idx}`} style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', backgroundImage: `url(${preview})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', border: '2px solid #185FA5' }}>
                                        <button type="button" onClick={() => removeNew(idx)} style={{ position: 'absolute', top: '4px', insetInlineEnd: '4px', background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: '4px', width: '20px', height: '20px', color: '#fff', cursor: 'pointer' }}>
                                            <IconTrash size={12} />
                                        </button>
                                    </div>
                                ))}
                                {(existingImages.length + newFiles.length) < 15 && (
                                    <div onClick={() => galInputRef.current?.click()} style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', border: '1.5px dashed #cbd5e1', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <IconPlus size={20} color="#64748b" />
                                        <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>{existingImages.length + newFiles.length}/15</span>
                                    </div>
                                )}
                            </div>
                            <input ref={galInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleGallery} />
                        </section>
                    )}

                    {current.key === 'review' && (
                        <ReviewStep
                            t={t}
                            lang={lang}
                            data={{
                                name, chaletType, capacity, bedrooms, bathrooms, livingRooms,
                                gouvernate, state,
                                rentFullDay, rentHalfDay, rentWeekend, minDays,
                                servicesCount: Object.values(checkedServices).filter(Boolean).length,
                                photosCount: existingImages.length + newFiles.length,
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
                                {isLoading ? (t('saving') || 'Saving…') : (isEdit ? (t('save_changes') || 'Save Changes') : (t('add_chalet') || 'Add Chalet'))}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/** ReviewStep — a compact read-only summary of the chalet before submitting. */
function ReviewStep({ t, lang, data, onEditStep }) {
    const rows = [
        { label: t('chalet_name') || 'Name', value: data.name, step: 0 },
        { label: t('chalet_type') || 'Type', value: t(`chalet_type_${String(data.chaletType).toLowerCase()}`) || data.chaletType, step: 0 },
        { label: t('capacity') || 'Capacity', value: data.capacity, step: 0 },
        { label: `${t('beds') || 'Bedrooms'} / ${t('bath') || 'Bathrooms'}`, value: `${data.bedrooms || 0} / ${data.bathrooms || 0}`, step: 0 },
        { label: t('location') || 'Location', value: [localizeWilayat(data.state, lang), localizeGovernorate(data.gouvernate, lang)].filter(Boolean).join(', '), step: 2 },
        { label: t('full_day') || 'Full Day Rate', value: data.rentFullDay ? `${data.rentFullDay} ${t('OMR') || 'OMR'}` : '', step: 3 },
        { label: t('half_day') || 'Half Day Rate', value: data.rentHalfDay ? `${data.rentHalfDay} ${t('OMR') || 'OMR'}` : '', step: 3 },
        { label: t('min_days') || 'Minimum Days', value: data.minDays, step: 3 },
        { label: t('services_utilities') || 'Services', value: `${data.servicesCount} ${t('selected') || 'selected'}`, step: 4 },
        { label: t('media') || 'Photos', value: `${data.photosCount} ${t('photos') || 'photos'}`, step: 5 },
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
