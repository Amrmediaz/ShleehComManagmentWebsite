import React, { useState, useRef , useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext.jsx';
import { fileUploadApiClient } from '../../data/FileUploadClient.js';
import { BuildingRepository } from '../../data/repositories/BuildingRepository.js';
import {EditBuildingUseCase} from "../../core/useCases/EditBuildingUseCase.js"
import {
    IconShieldLock, IconWifi, IconCar, IconElevator,
    IconSnowflake, IconBarbell, IconRipple, IconBolt, IconCamera,
    IconX, IconPlus, IconChevronDown, IconCreditCard, IconTrash,
    IconStar, IconBuilding, IconPhone,
} from '@tabler/icons-react';
import {AddBuildingUseCase} from "../../core/useCases/AddBuildingUseCase.js";

// ─── Static Data (same as AddBuildingModal) ──────────────────────────────────

const WILAYATS = {
    'Muscat': ['Muscat', 'Muttrah', 'Bausher', 'Al Amerat', 'Qurayyat', 'As Seeb'],
    'Dhofar': ['Salalah', 'Thumrait', 'Mirbat', 'Rakhyut', 'Dalkut', 'Shalim', 'Al Mazyunah', 'Muqshin'],
    'Musandam': ['Khasab', 'Bukha', 'Daba', 'Shinas', 'Lima'],
    'Al Buraimi': ['Al Buraimi', 'Mahda', 'As Sinainah'],
    'Ad Dakhiliyah': ['Nizwa', 'Bahla', 'Manah', 'Al Hamra', 'Adam', 'Izki', 'Bidbid', 'Samail'],
    'North Al Batinah': ['Sohar', 'Shinas', 'Liwa', 'Saham', 'Al Khaburah', 'As Suwayq'],
    'South Al Batinah': ['Rustaq', 'Al Awabi', 'Nakhal', 'Wadi Al Maawil', 'Barka', 'Al Musanaa'],
    'North Al Sharqiyah': ['Ibra', 'Al Mudaybi', 'Al Qabil', 'Wadi Bani Khalid', 'Dima Wa Al Tayeen'],
    'South Al Sharqiyah': ['Sur', 'Jalan Bani Bu Ali', 'Jalan Bani Bu Hassan', 'Masirah', 'Al Kamil Wal Wafi'],
    'Ad Dhahirah': ['Ibri', 'Yanqul', 'Dank'],
    'Al Wusta': ['Haima', 'Duqm', 'Mahout', 'Al Jazir'],
};

const UNIT_TYPES = [
    { id: 1, en: 'studio', ar: 'استوديو' },
    { id: 2, en: 'one_br', ar: 'غرفة وصالة' },
    { id: 3, en: 'two_br', ar: 'غرفتين وصالة' },
    { id: 4, en: 'three_br', ar: 'ثلاث غرف وصالة' },
    { id: 5, en: 'four_br', ar: 'أربع غرف وصالة' },
    { id: 6, en: 'five_plus_br', ar: 'خمس غرف وصالة فأكثر' },
    { id: 7, en: 'loft', ar: 'صالة مفتوحة لوفت' },
    { id: 8, en: 'duplex', ar: 'دوبلكس' },
    { id: 9, en: 'triplex', ar: 'تريبلكس' },
    { id: 10, en: 'penthouse', ar: 'بنتهاوس' },
    { id: 11, en: 'garden_apartment', ar: 'شقة أرضية بحديقة' },
    { id: 12, en: 'basement_apartment', ar: 'شقة قبو' },
    { id: 13, en: 'serviced_apartment', ar: 'شقة مفروشة بخدمات' },
];

const AMENITY_SERVICE_MAP = {
    sec_24: 'Security 24/7',
    wifi: 'WiFi',
    parking: 'Parking',
    elevator: 'Elevator',
    ac: 'Air Conditioning',
    gym: 'Gym',
    pool: 'Swimming Pool',
    power: 'Power Backup',
    cctv: 'CCTV',
};

// Reverse map: serviceName → amenity key
const SERVICE_TO_KEY = Object.fromEntries(
    Object.entries(AMENITY_SERVICE_MAP).map(([k, v]) => [v, k])
);

function AmenityTile({ item, checked, onChange, t, lang }) {
    const isRTL = lang === 'ar';
    const { Icon } = item;
    return (
        <label
            onClick={(e) => { if (e.target.type === 'checkbox') return; onChange(); }}
            style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                flexDirection: isRTL ? 'row-reverse' : 'row',
                padding: '10px 12px', borderRadius: '12px', cursor: 'pointer',
                border: checked ? `1.5px solid ${item.color}` : '1px solid #eef0f3',
                background: checked ? item.bg : '#ffffff',
                transition: 'all 0.2s ease', userSelect: 'none',
                flex: '1 1 calc(50% - 12px)', minWidth: '145px', boxSizing: 'border-box',
            }}
        >
            <input type="checkbox" checked={checked} onChange={onChange}
                   style={{ width: '16px', height: '16px', accentColor: item.color, cursor: 'pointer', flexShrink: 0, margin: 0 }} />
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: checked ? '#ffffff' : item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={item.color} stroke={2} />
            </div>
            <span style={{ fontSize: 'clamp(11px, 2.8vw, 13px)', fontWeight: 550, color: checked ? '#111827' : '#4b5563', textAlign: isRTL ? 'right' : 'left', lineHeight: 1.2, wordBreak: 'break-word', hyphens: 'auto', flexGrow: 1 }}>
                {t(item.key)}
            </span>
        </label>
    );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function EditBuildingModal({ isOpen, onClose, building , onUpdate}) {
    const { t, lang } = useTranslation();
    const isRTL = lang === 'ar';
  
    if (!isOpen || !building) return null;

    const raw = building.raw || {};

    // Helper to initialize checked amenities from existing services
    const initAmenities = () => {
        const checked = {};
        (building.services || []).forEach(serviceName => {
            const key = SERVICE_TO_KEY[serviceName];
            if (key) checked[key] = true;
        });
        return checked;
    };

    const initUnits = () => {
        const rawData = raw.buildingFlatType || [];

        if (rawData.length === 0) return [];

        // Group by typeId and keep only the first occurrence of each
        const unitMap = new Map();

        rawData.forEach(ft => {
            if (!unitMap.has(ft.typeId)) {
                const unit = UNIT_TYPES.find(u => u.id === ft.typeId);
                if (unit) {
                    unitMap.set(ft.typeId, { ...unit });
                }
            }
        });

        const units = Array.from(unitMap.values());

        // Log deduplication results
        console.log('[EditBuildingModal] Raw records:', rawData.length);
        console.log('[EditBuildingModal] Unique typeIds:', units.length);
        console.log('[EditBuildingModal] Duplicates removed:', rawData.length - units.length);
 
        return units;
    };

    // ── State — pre-filled from building.raw ──
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
    const [check_In, setCheckIn] = useState(raw.check_In?.slice(0, 5) || '14:00');
    const [check_Out, setCheckOut] = useState(raw.check_Out?.slice(0, 5) || '11:00');
    const [cancelation_policyAr, setCancelPolicyAr] = useState(raw.cancelation_policyAr || '');
    const [cancelation_policyEn, setCancelPolicyEn] = useState(raw.cancelation_policyEn || '');
    const [buildingPolicyAr, setBuildingPolicyAr] = useState(raw.buildingPolicyAr || '');
    const [buildingPolicyEn, setBuildingPolicyEn] = useState(raw.buildingPolicyEn || '');
    const [checkedAmenities, setCheckedAmenities] = useState(initAmenities);
    const [selectedUnits, setSelectedUnits] = useState(initUnits);
    const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);

    // Images: keep existing server images + allow replacing with new files
    const [coverFile, setCoverFile] = useState(null);                   // new file selected
    const [coverPreview, setCoverPreview] = useState(building.coverImg || null); // shown in UI
    const [existingCoverRaw, setExistingCoverRaw] = useState(raw.coverimg || ''); // raw JSON string

    // Gallery: existing images from server + new ones picked
    const [existingImages, setExistingImages] = useState(
        (raw.buldingImages || []).map(img => ({ id: img.id, path: img.path, url: img.path }))
    );
    const [galFiles, setGalFiles] = useState([]); // new files to upload

    const coverInputRef = useRef();
    const galInputRef = useRef();

    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

    useEffect(() => {
        console.log('[BuildingDetail] Component received building:');
        console.log('building:', building);
        console.log('building.id:', building?.id);
        console.log('building.raw:', building?.raw);
        console.log('building.raw?.id:', building?.raw?.id);
        console.log('Keys in building:', Object.keys(building || {}));
    }, []);
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

    const toggleAmenity = (key) => setCheckedAmenities(prev => ({ ...prev, [key]: !prev[key] }));
    const addUnitType = (unit) => { if (!selectedUnits.find(u => u.id === unit.id)) setSelectedUnits(prev => [...prev, { ...unit }]); setUnitDropdownOpen(false); };
    const removeUnitType = (id) => setSelectedUnits(prev => prev.filter(u => u.id !== id));
    const availableUnits = UNIT_TYPES.filter(u => !selectedUnits.find(s => s.id === u.id));

    const handleCover = (e) => {
        const file = e.target.files[0];
        if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); }
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
        console.log('[EditBuildingModal] handleSubmit called');
        console.log('nameAr:', nameAr);
        console.log('nameEn:', nameEn);
        console.log('gouvernate:', gouvernate);
        console.log('state:', state);

        setStatusMessage({ text: '', isError: false });

        // ✅ VALIDATION: Check required fields
        if (!nameAr || nameAr.trim() === '') {
            const errorMsg = isRTL ? 'اسم المبنى (عربي) مطلوب' : 'Building Name (Arabic) is required';
            console.log('[Validation Error]:', errorMsg);
            setStatusMessage({ text: errorMsg, isError: true });
            return;
        }
        if (!nameEn || nameEn.trim() === '') {
            const errorMsg = isRTL ? 'اسم المبنى (إنجليزي) مطلوب' : 'Building Name (English) is required';
            console.log('[Validation Error]:', errorMsg);
            setStatusMessage({ text: errorMsg, isError: true });
            return;
        }
        if (!gouvernate || gouvernate === '') {
            const errorMsg = isRTL ? 'المحافظة مطلوبة' : 'Governorate is required';
            console.log('[Validation Error]:', errorMsg);
            setStatusMessage({ text: errorMsg, isError: true });
            return;
        }
        if (!state || state === '') {
            const errorMsg = isRTL ? 'الولاية مطلوبة' : 'Wilayat is required';
            console.log('[Validation Error]:', errorMsg);
            setStatusMessage({ text: errorMsg, isError: true });
            return;
        }

        console.log('[EditBuildingModal] All validations passed, proceeding with submit');

        setIsLoading(true);
        let coverimg = existingCoverRaw;
        try {
            console.log('[DEBUG] Starting upload...');
            // Step 1: Upload new cover if changed, otherwise keep existing raw JSON string

            console.log('[DEBUG] Starting upload...');
            if (coverFile) {
                console.log('[DEBUG] Starting cover file upload...');
                let response = await fileUploadApiClient.uploadFile(coverFile);

                // Log the initial state
                console.log('[DEBUG] Raw Response Type:', typeof response);
                console.log('[DEBUG] Raw Response Value:', response);

                // 1. First parse
                let parsed = typeof response === 'string' ? JSON.parse(response) : response;
                console.log('[DEBUG] After 1st parse, type:', typeof parsed);
                console.log('[DEBUG] After 1st parse, value:', parsed);

                // 2. Check if the result is still a string
                if (typeof parsed === 'string') {
                    console.log('[DEBUG] Detected double-stringified JSON, parsing again...');
                    parsed = JSON.parse(parsed);
                    console.log('[DEBUG] After 2nd parse, value:', parsed);
                }

                // 3. Now safely access the properties
                if (parsed && parsed.status) {
                    coverimg = "https://shleeh.com/" + parsed.message.replace(/^\//, '');
                    console.log('[DEBUG] Final coverimg URL:', coverimg);
                } else {
                    console.error('[EditBuilding] Cover image upload failed. Parsed object:', parsed);
                }
            }


            // Step 2: Upload new gallery images
            const newUploadedImages = [];
            for (const { file } of galFiles) {
                const url = await fileUploadApiClient.uploadFile(file);
                if (url) newUploadedImages.push({ id: 0, path: url, hotelbuildingID: raw.id || 0 });
            }

            // Combine kept existing images + newly uploaded
            const buldingImages = [
                ...existingImages.map(img => ({ id: img.id, path: img.path, hotelbuildingID: raw.id || 0 })),
                ...newUploadedImages,
            ];

            // Deduplicate selectedUnits before creating payload
            const uniqueUnits = Array.from(new Map(selectedUnits.map(u => [u.id, u])).values());

            // Log what's being saved
            console.log('[EditBuildingModal] Original selectedUnits:', selectedUnits.length);
            console.log('[EditBuildingModal] After deduplication:', uniqueUnits.length);
            console.log('[EditBuildingModal] Unique typeIds being saved:', uniqueUnits.map(u => u.id));

            const buildingFlatType = uniqueUnits.map(unit => ({
                id: 0,  // Set to 0 so backend creates new records
                typeId: unit.id,
                hotelbuildingID: raw.id || 0
            }));

            const buldingService = Object.entries(checkedAmenities)
                .filter(([, v]) => v)
                .map(([key]) => ({ id: 0, serviceName: AMENITY_SERVICE_MAP[key] || key, hotelbuildingID: raw.id || 0 }));

            // ✅ FIXED: Define buildingId HERE before using it
            const buildingId = building?.id || building?.raw?.id || 0;
            console.log('[EditBuildingModal] Using building ID:', buildingId);

            const payload = {
                id: buildingId,  // ✅ Now properly defined
                nameAr, nameEn,
                totalFloor: Number(totalFloor),
                totalFlats: Number(totalFlats),
                yearBulit: String(yearBulit),
                minimumRent: String(minimumRent),
                maxRent: String(maxRent),
                minDays: Number(minDays),
                value1: raw.value1 || '', value2: raw.value2 || '', value3: raw.value3 || '',
                buldingDescrptionAr, buldingDescrptionEn,
                additional_detailsAr, additional_detailsEn,
                gouvernate, state, location, lat: String(lat), lng: String(lng), nearTo,
                managmentPhone, workerPhone,
                buildingPolicyAr, buildingPolicyEn,
                cancelation_policyAr, cancelation_policyEn,
                buldinNumber,
                coverimg,
                onlinePay: raw.onlinePay ?? true,
                acceptDownPay,
                check_In: check_In.length === 5 ? `${check_In}:00` : check_In,
                check_Out: check_Out.length === 5 ? `${check_Out}:00` : check_Out,
                isExclusive, isActive,
                isDeleted: false,
                stopBook,
                bulidstatus: raw.bulidstatus || 0,
                buldingImages,
                buildingFlatType,  // Only unique ones (deduped on frontend)
                buildingPayment_methods: raw.buildingPayment_methods || [],
                buldingService,
                ownerId: raw.ownerId || 0,
            };

            console.log('[EditBuildingModal] Submitting payload →', payload);
            console.log('[EditBuildingModal] Building flat types (deduplicated):', buildingFlatType);
            console.log('[EditBuildingModal] Building services:', buldingService);
            console.log('[EditBuildingModal] Building images count:', buldingImages.length);
            console.log('[EditBuildingModal] Payload JSON:', JSON.stringify(payload, null, 2));

            // ✅ Log each image path to check for double-stringified JSON
            console.log('[EditBuildingModal] Image paths:');
            buldingImages.forEach((img, i) => {
                console.log(`  [${i}] path type: ${typeof img.path}, value:`, img.path.substring(0, 100));
            });

            const { validationError, result } = await EditBuildingUseCase.execute(payload);

            // ✅ FIXED: use 'text' not 'tokenKey'
            if (validationError) {
                console.error('[EditBuildingModal] Validation error from API:', validationError);
                setStatusMessage({ text: validationError, isError: true });
                return;
            }
            if (result?.status === true) {
                setStatusMessage({ text: t('building_updated_success') || 'Building updated successfully!', isError: false });
                if (onUpdate) onUpdate(payload); // ✅ pass the submitted payload up
                setTimeout(() => onClose(), 1400);
            } else {
                console.error('[EditBuildingModal] API error response:', result);
                setStatusMessage({ text: result?.message || t('building_update_failed') || 'Update failed', isError: true });
            }
        } catch (err) {
            console.error('[EditBuildingModal] Error:', err);
            setStatusMessage({ text: err.message || t('server_error') || 'Server error', isError: true });
        } finally {
            setIsLoading(false);
        }
    };

    // ── Shared style tokens ──
    const inp = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', backgroundColor: '#fff', color: '#111827', boxSizing: 'border-box', textAlign: isRTL ? 'right' : 'left', direction: isRTL ? 'rtl' : 'ltr', appearance: 'none', WebkitAppearance: 'none' };
    const selectStyle = { ...inp, backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: isRTL ? 'left 12px center' : 'right 12px center', backgroundSize: '16px', paddingLeft: isRTL ? '36px' : '12px', paddingRight: isRTL ? '12px' : '36px' };
    const lbl = { fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: '6px', display: 'block', textAlign: isRTL ? 'right' : 'left' };
    const secTitle = { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9ca3af', marginBottom: '12px', textAlign: isRTL ? 'right' : 'left' };
    const divider = { height: '1px', background: '#f3f4f6', margin: '4px 0' };
    const textarea = { ...inp, resize: 'vertical', minHeight: '72px', fontFamily: 'inherit', lineHeight: '1.5' };
    const checkRow = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '12px', border: '1px solid #d1d5db', cursor: 'pointer', flexDirection: isRTL ? 'row-reverse' : 'row' };

    return (
        <div style={{ display: 'flex', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '12px', boxSizing: 'border-box' }}>
            <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '720px', width: '100%', maxHeight: 'calc(100vh - 24px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', direction: isRTL ? 'rtl' : 'ltr', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>

                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: isRTL ? 'row-reverse' : 'row', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IconBuilding size={18} color="#185FA5" />
                        </div>
                        <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{t('edit_building') || 'Edit Building'}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{building.nameEn || building.nameAr}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: '4px' }}>
                        <IconX size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1, boxSizing: 'border-box' }}>

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
                    <section>
                        <div style={secTitle}>{t('basic_info') || 'Basic Info'}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                <div>
                                    <label style={lbl}>{isRTL ? 'اسم المبنى (عربي)' : 'Building Name (Arabic)'} <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input style={{ ...inp, direction: 'rtl' }} type="text" value={nameAr} onChange={e => setNameAr(e.target.value)} />
                                </div>
                                <div>
                                    <label style={lbl}>{isRTL ? 'اسم المبنى (إنجليزي)' : 'Building Name (English)'} <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input style={{ ...inp, direction: 'ltr' }} type="text" value={nameEn} onChange={e => setNameEn(e.target.value)} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                                <div><label style={lbl}>{t('total_floors') || 'Floors'}</label><input style={inp} type="number" min="1" value={totalFloor} onChange={e => setTotalFloor(e.target.value)} /></div>
                                <div><label style={lbl}>{t('total_flats') || 'Flats'}</label><input style={inp} type="number" min="1" value={totalFlats} onChange={e => setTotalFlats(e.target.value)} /></div>
                                <div><label style={lbl}>{t('year_built') || 'Year Built'}</label><input style={inp} type="number" min="1900" value={yearBulit} onChange={e => setYearBulit(e.target.value)} /></div>
                                <div><label style={lbl}>{isRTL ? 'رقم المبنى' : 'Building No.'}</label><input style={inp} type="text" value={buldinNumber} onChange={e => setBuldinNumber(e.target.value)} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                <div><label style={lbl}>{isRTL ? 'وصف (عربي)' : 'Description (Arabic)'}</label><textarea style={{ ...textarea, direction: 'rtl' }} value={buldingDescrptionAr} onChange={e => setDescAr(e.target.value)} /></div>
                                <div><label style={lbl}>{isRTL ? 'وصف (إنجليزي)' : 'Description (English)'}</label><textarea style={{ ...textarea, direction: 'ltr' }} value={buldingDescrptionEn} onChange={e => setDescEn(e.target.value)} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                <div><label style={lbl}>{isRTL ? 'تفاصيل إضافية (عربي)' : 'Additional Details (Arabic)'}</label><textarea style={{ ...textarea, direction: 'rtl' }} value={additional_detailsAr} onChange={e => setAddDetailsAr(e.target.value)} /></div>
                                <div><label style={lbl}>{isRTL ? 'تفاصيل إضافية (إنجليزي)' : 'Additional Details (English)'}</label><textarea style={{ ...textarea, direction: 'ltr' }} value={additional_detailsEn} onChange={e => setAddDetailsEn(e.target.value)} /></div>
                            </div>
                        </div>
                    </section>

                    <div style={divider} />

                    {/* 2. UNIT TYPES */}
                    <section>
                        <div style={secTitle}>{t('available_room_types') || 'Unit Types'}</div>
                        <div style={{ position: 'relative' }}>
                            <button type="button" onClick={() => { if (availableUnits.length > 0) setUnitDropdownOpen(p => !p); }} disabled={availableUnits.length === 0}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', background: availableUnits.length === 0 ? '#f9fafb' : '#fff', cursor: availableUnits.length === 0 ? 'not-allowed' : 'pointer', fontSize: '13px', color: '#374151', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                <span style={{ flexGrow: 1, textAlign: isRTL ? 'right' : 'left' }}>{availableUnits.length === 0 ? (isRTL ? 'تم اختيار جميع الأنواع' : 'All types selected') : (t('add_room_type') || 'Add unit type')}</span>
                                <IconChevronDown size={16} style={{ transform: unitDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                            </button>
                            {unitDropdownOpen && (
                                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: '200px', overflowY: 'auto' }}>
                                    {availableUnits.map(unit => (
                                        <button key={unit.id} type="button" onClick={() => addUnitType(unit)}
                                                style={{ display: 'flex', width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', textAlign: isRTL ? 'right' : 'left' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                                            <span style={{ fontSize: '13px', color: '#374151', width: '100%' }}>{isRTL ? unit.ar : unit.en.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {selectedUnits.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                                {selectedUnits.map(unit => (
                                    <div key={unit.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '16px', background: '#f0f6ff', border: '1px solid #c7ddf5' }}>
                                        <span style={{ fontSize: '12px', color: '#185FA5', fontWeight: 500 }}>{isRTL ? unit.ar : unit.en.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                                        <button type="button" onClick={() => removeUnitType(unit.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#93aecb', display: 'flex', padding: 0 }}><IconX size={12} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <div style={divider} />

                    {/* 3. LOCATION */}
                    <section>
                        <div style={secTitle}>{t('location') || 'Location'}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                                <div>
                                    <label style={lbl}>{t('governorate') || 'Governorate'} <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select style={selectStyle} value={gouvernate} onChange={e => { setGovernorate(e.target.value); setWilayat(''); }}>
                                        <option value="">{isRTL ? 'اختر محافظة...' : 'Select governorate…'}</option>
                                        {Object.keys(WILAYATS).map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={lbl}>{t('wilayat') || 'Wilayat'} <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select style={{ ...selectStyle, backgroundColor: !gouvernate ? '#f9fafb' : '#fff' }} value={state} onChange={e => setWilayat(e.target.value)} disabled={!gouvernate}>
                                        <option value="">{gouvernate ? (isRTL ? 'اختر ولاية...' : 'Select wilayat…') : (isRTL ? 'اختر المحافظة أولاً' : 'Select governorate first')}</option>
                                        {gouvernate && (WILAYATS[gouvernate] || []).map(w => <option key={w} value={w}>{w}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={lbl}>{isRTL ? 'العنوان التفصيلي' : 'Detailed Address'}</label>
                                <input style={inp} type="text" value={location} onChange={e => setLocation(e.target.value)} />
                            </div>
                            <div>
                                <label style={lbl}>{isRTL ? 'قريب من' : 'Near To'}</label>
                                <input style={inp} type="text" value={nearTo} onChange={e => setNearTo(e.target.value)} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div><label style={lbl}>{isRTL ? 'خط العرض' : 'Latitude'}</label><input style={{ ...inp, direction: 'ltr' }} type="text" value={lat} onChange={e => setLat(e.target.value)} /></div>
                                <div><label style={lbl}>{isRTL ? 'خط الطول' : 'Longitude'}</label><input style={{ ...inp, direction: 'ltr' }} type="text" value={lng} onChange={e => setLng(e.target.value)} /></div>
                            </div>
                        </div>
                    </section>

                    <div style={divider} />

                    {/* 4. CONTACT */}
                    <section>
                        <div style={secTitle}>{isRTL ? 'بيانات التواصل' : 'Contact Information'}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                            <div>
                                <label style={lbl}>{isRTL ? 'هاتف الإدارة' : 'Management Phone'}</label>
                                <input style={{ ...inp, direction: 'ltr' }} type="tel" value={managmentPhone} onChange={e => setManagmentPhone(e.target.value)} />
                            </div>
                            <div>
                                <label style={lbl}>{isRTL ? 'هاتف العمال' : 'Worker Phone'}</label>
                                <input style={{ ...inp, direction: 'ltr' }} type="tel" value={workerPhone} onChange={e => setWorkerPhone(e.target.value)} />
                            </div>
                        </div>
                    </section>

                    <div style={divider} />

                    {/* 5. FINANCIALS */}
                    <section>
                        <div style={secTitle}>{t('financials') || 'Financials'}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                                <div><label style={lbl}>{t('min_rent') || 'Min Rent'} (OMR)</label><input style={inp} type="number" min="0" value={minimumRent} onChange={e => setMinimumRent(e.target.value)} /></div>
                                <div><label style={lbl}>{t('max_rent') || 'Max Rent'} (OMR)</label><input style={inp} type="number" min="0" value={maxRent} onChange={e => setMaxRent(e.target.value)} /></div>
                                <div><label style={lbl}>{isRTL ? 'الأيام الأدنى' : 'Min Days'}</label><input style={inp} type="number" min="1" value={minDays} onChange={e => setMinDays(e.target.value)} /></div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={checkRow}>
                                    <input type="checkbox" checked={acceptDownPay} onChange={e => setAcceptDownPay(e.target.checked)} style={{ accentColor: '#185FA5', width: '16px', height: '16px' }} />
                                    <span style={{ fontSize: '13px', color: '#374151', textAlign: isRTL ? 'right' : 'left' }}>{t('partial_payment_option') || 'Accept Partial Payment'}</span>
                                </label>
                                <label style={checkRow}>
                                    <IconStar size={20} color="#6b7280" />
                                    <span style={{ fontSize: '13px', color: '#374151', flexGrow: 1, textAlign: isRTL ? 'right' : 'left' }}>{isRTL ? 'عقار حصري' : 'Exclusive Property'}</span>
                                    <input type="checkbox" checked={isExclusive} onChange={e => setIsExclusive(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#185FA5', cursor: 'pointer' }} />
                                </label>
                            </div>
                        </div>
                    </section>

                    <div style={divider} />

                    {/* 6. POLICY & STATUS */}
                    <section>
                        <div style={secTitle}>{t('complex_status') || 'Policy & Status'}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                                <div><label style={lbl}>{t('check_in') || 'Check-in'}</label><input style={inp} type="time" value={check_In} onChange={e => setCheckIn(e.target.value)} /></div>
                                <div><label style={lbl}>{t('check_out') || 'Check-out'}</label><input style={inp} type="time" value={check_Out} onChange={e => setCheckOut(e.target.value)} /></div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={checkRow}>
                                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ accentColor: '#16a34a', width: '16px', height: '16px' }} />
                                    <span style={{ fontSize: '13px', color: '#374151', textAlign: isRTL ? 'right' : 'left' }}>{t('operational') || 'Active / Operational'}</span>
                                </label>
                                <label style={checkRow}>
                                    <input type="checkbox" checked={stopBook} onChange={e => setStopBook(e.target.checked)} style={{ accentColor: '#dc2626', width: '16px', height: '16px' }} />
                                    <span style={{ fontSize: '13px', color: '#374151', textAlign: isRTL ? 'right' : 'left' }}>{t('booking_stopped') || 'Stop Bookings'}</span>
                                </label>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                <div><label style={lbl}>{isRTL ? 'سياسة الإلغاء (عربي)' : 'Cancellation Policy (Arabic)'}</label><textarea style={{ ...textarea, direction: 'rtl' }} value={cancelation_policyAr} onChange={e => setCancelPolicyAr(e.target.value)} /></div>
                                <div><label style={lbl}>{isRTL ? 'سياسة الإلغاء (إنجليزي)' : 'Cancellation Policy (English)'}</label><textarea style={{ ...textarea, direction: 'ltr' }} value={cancelation_policyEn} onChange={e => setCancelPolicyEn(e.target.value)} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                <div><label style={lbl}>{isRTL ? 'سياسة المبنى (عربي)' : 'Building Policy (Arabic)'}</label><textarea style={{ ...textarea, direction: 'rtl' }} value={buildingPolicyAr} onChange={e => setBuildingPolicyAr(e.target.value)} /></div>
                                <div><label style={lbl}>{isRTL ? 'سياسة المبنى (إنجليزي)' : 'Building Policy (English)'}</label><textarea style={{ ...textarea, direction: 'ltr' }} value={buildingPolicyEn} onChange={e => setBuildingPolicyEn(e.target.value)} /></div>
                            </div>
                        </div>
                    </section>

                    <div style={divider} />

                    {/* 7. MEDIA */}
                    <section>
                        <div style={secTitle}>{t('media') || 'Media'}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Cover */}
                            <div>
                                <label style={lbl}>{t('cover_image') || 'Cover Image'}</label>
                                <div onClick={() => coverInputRef.current.click()}
                                     style={{ border: '1.5px dashed #d1d5db', borderRadius: '10px', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: 'transparent', backgroundImage: coverPreview ? `url(${coverPreview})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                    {!coverPreview && <span style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', padding: '12px' }}>{isRTL ? 'اضغط لتغيير صورة الغلاف' : 'Click to change cover image'}</span>}
                                </div>
                                <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCover} />
                            </div>
                            {/* Gallery */}
                            <div>
                                <label style={lbl}>{isRTL ? 'معرض الصور' : 'Photo Gallery'}</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                                    {/* Existing server images */}
                                    {existingImages.map(img => (
                                        <div key={img.id} style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', backgroundImage: `url(${img.url})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                            <button type="button" onClick={() => removeExistingImage(img.id)}
                                                    style={{ position: 'absolute', top: '4px', right: isRTL ? 'auto' : '4px', left: isRTL ? '4px' : 'auto', background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', padding: 0 }}>
                                                <IconTrash size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {/* New files */}
                                    {galFiles.map(({ preview }, index) => (
                                        <div key={`new-${index}`} style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', backgroundImage: `url(${preview})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden', border: '2px solid #185FA5' }}>
                                            <button type="button" onClick={() => removeNewGalImage(index)}
                                                    style={{ position: 'absolute', top: '4px', right: isRTL ? 'auto' : '4px', left: isRTL ? '4px' : 'auto', background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', padding: 0 }}>
                                                <IconTrash size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {/* Add more button */}
                                    {(existingImages.length + galFiles.length) < 8 && (
                                        <div onClick={() => galInputRef.current.click()}
                                             style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', border: '1.5px dashed #cbd5e1', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                            <IconPlus size={20} color="#64748b" />
                                            <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>{existingImages.length + galFiles.length}/8</span>
                                        </div>
                                    )}
                                </div>
                                <input ref={galInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleGallery} />
                            </div>
                        </div>
                    </section>

                    <div style={divider} />

                    {/* 8. SERVICES */}
                    <section>
                        <div style={secTitle}>{t('services_utilities') || 'Services'}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', width: '100%' }}>
                            {amenities.map(item => (
                                <AmenityTile key={item.key} item={item} checked={!!checkedAmenities[item.key]} onChange={() => toggleAmenity(item.key)} t={t} lang={lang} />
                            ))}
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div style={{ padding: '14px 20px', background: '#f9fafb', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', flexDirection: isRTL ? 'row-reverse' : 'row', flexShrink: 0 }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: '13px', cursor: 'pointer' }}>
                        {t('cancel') || 'Cancel'}
                    </button>
                    <button onClick={handleSubmit} disabled={isLoading}
                            style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: isLoading ? '#93c0e4' : '#185FA5', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: isLoading ? 'not-allowed' : 'pointer' }}>
                        {isLoading ? (isRTL ? 'جاري الحفظ...' : 'Saving…') : (t('save_changes') || (isRTL ? 'حفظ التغييرات' : 'Save Changes'))}
                    </button>
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