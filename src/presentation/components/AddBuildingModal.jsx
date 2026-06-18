import React, { useState, useRef } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { AddBuildingUseCase } from '../../core/useCases/AddBuildingUseCase';
import { fileUploadApiClient } from '/src/data/FileUploadClient.js';
import {
    IconShieldLock, IconWifi, IconCar, IconElevator,
    IconSnowflake, IconBarbell, IconRipple, IconBolt, IconCamera,
    IconX, IconPlus, IconChevronDown, IconCreditCard, IconTrash,
    IconStar, IconBuilding, IconPhone,
} from '@tabler/icons-react';

// ─── Static Data ────────────────────────────────────────────────────────────

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

// ─── AmenityTile (fully controlled) ─────────────────────────────────────────

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

// ─── Main Modal ──────────────────────────────────────────────────────────────

export default function AddBuildingModal({ isOpen, onClose, ownerId: ownerIdProp }) {
    // Resolve owner ID: prop → localStorage('ownerId') → localStorage('userId') → 0
    const resolvedOwnerId = Number(
        ownerIdProp ||
        localStorage.getItem('ownerId') ||
        localStorage.getItem('userId') ||
        localStorage.getItem('user_id') ||
        0
    );
    const { t, lang } = useTranslation();
    const isRTL = lang === 'ar';

    // Basic Info
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

    // Unit types
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);

    // Location
    const [gouvernate, setGovernorate] = useState('');
    const [state, setWilayat] = useState('');
    const [location, setLocation] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [nearTo, setNearTo] = useState('');

    // Contact
    const [managmentPhone, setManagmentPhone] = useState('');
    const [workerPhone, setWorkerPhone] = useState('');

    // Financials
    const [minimumRent, setMinimumRent] = useState('');
    const [maxRent, setMaxRent] = useState('');
    const [minDays, setMinDays] = useState('');
    const [acceptDownPay, setAcceptDownPay] = useState(false);
    const [isExclusive, setIsExclusive] = useState(false);

    // Policy
    const [check_In, setCheckIn] = useState('14:00');
    const [check_Out, setCheckOut] = useState('11:00');
    const [cancelation_policyAr, setCancelPolicyAr] = useState('');
    const [cancelation_policyEn, setCancelPolicyEn] = useState('');
    const [buildingPolicyAr, setBuildingPolicyAr] = useState('');
    const [buildingPolicyEn, setBuildingPolicyEn] = useState('');

    // Media
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [galFiles, setGalFiles] = useState([]);
    const coverInputRef = useRef();
    const galInputRef = useRef();

    // Amenities
    const [checkedAmenities, setCheckedAmenities] = useState({});

    // UI
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ tokenKey: '', isError: false, fallback: '' });

    if (!isOpen) return null;

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

    const toggleAmenity = (key) =>
        setCheckedAmenities(prev => ({ ...prev, [key]: !prev[key] }));

    const addUnitType = (unit) => {
        if (!selectedUnits.find(u => u.id === unit.id)) setSelectedUnits(prev => [...prev, { ...unit }]);
        setUnitDropdownOpen(false);
    };
    const removeUnitType = (id) => setSelectedUnits(prev => prev.filter(u => u.id !== id));
    const availableUnits = UNIT_TYPES.filter(u => !selectedUnits.find(s => s.id === u.id));

    const handleCover = (e) => {
        const file = e.target.files[0];
        if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); }
    };

    const handleGallery = (e) => {
        const files = Array.from(e.target.files);
        const newEntries = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
        setGalFiles(prev => [...prev, ...newEntries].slice(0, 8));
        e.target.value = '';
    };

    const removeGalImage = (index) => setGalFiles(prev => prev.filter((_, i) => i !== index));

    const handleSubmit = async () => {
        setStatusMessage({ tokenKey: '', isError: false, fallback: '' });
        setIsLoading(true);
        try {
            // Step 1: Upload cover image → get URL (same as Flutter _addChalet pattern)
            let coverimg = '';
            if (coverFile) {
                const responseString = await fileUploadApiClient.uploadFile(coverFile);

                // Parse the JSON string into an actual object
                const uploadedCover = JSON.parse(responseString);

                if (uploadedCover && uploadedCover.status) {
                    // Now you can safely access the property
                    coverimg = "https://shleeh.com/"+ uploadedCover.message.replace(/^\//, '');
                } else {
                    console.error('[AddBuildingModal] Cover image upload failed');
                }
            }

            // Step 2: Upload gallery images → get URL array
            const buldingImages = [];

            for (const { file } of galFiles) {
                const responseString = await fileUploadApiClient.uploadFile(file);

                try {
                    // Parse the JSON string into an object
                    const response = JSON.parse(responseString);

                    if (response && response.status) {
                        // Clean the path (remove leading slash)
                        const cleanPath = "https://shleeh.com/"+ response.message.replace(/^\//, '');

                        buldingImages.push({
                            id: 0,
                            path: cleanPath,
                            hotelbuildingID: 0
                        });
                    } else {
                        console.warn('[AddBuildingModal] A gallery image returned status false, skipping');
                    }
                } catch (e) {
                    console.error('[AddBuildingModal] Failed to parse gallery image response:', e);
                }
            }

            const buildingFlatType = selectedUnits.map(unit => ({ id: 0, typeId: unit.id, hotelbuildingID: 0 }));

            const buldingService = Object.entries(checkedAmenities)
                .filter(([, v]) => v)
                .map(([key]) => ({ id: 0, serviceName: AMENITY_SERVICE_MAP[key] || key, hotelbuildingID: 0 }));

            const buildingPayment_methods = [
                { id: 0, type: 'online', hotelbuildingID: 0 },
                ...(acceptDownPay ? [{ id: 0, type: 'partial', hotelbuildingID: 0 }] : []),
            ];

            const formData = {
                nameAr, nameEn, totalFloor, totalFlats, yearBulit, buldinNumber,
                buldingDescrptionAr, buldingDescrptionEn, additional_detailsAr, additional_detailsEn,
                minimumRent, maxRent, minDays,
                gouvernate, state, location, lat, lng, nearTo,
                managmentPhone, workerPhone,
                buildingPolicyAr, buildingPolicyEn, cancelation_policyAr, cancelation_policyEn,
                onlinePay: true, acceptDownPay, isExclusive,
                check_In, check_Out, coverimg,
                buldingImages, buildingFlatType, buldingService, buildingPayment_methods,
                ownerId: resolvedOwnerId, isActive: true, isDeleted: false, stopBook: false, bulidstatus: 0,
                value1: '', value2: '', value3: '',
            };

            const { validationError, result } = await AddBuildingUseCase.execute(formData);

            if (validationError) {
                setStatusMessage({ tokenKey: validationError, isError: true });
                return;
            }

            if (result && result.status === true) {
                setStatusMessage({ tokenKey: 'building_added_success', isError: false });
                setTimeout(() => onClose(), 1400);
            } else {
                setStatusMessage({ tokenKey: 'building_add_failed', isError: true, fallback: result?.message || 'Failed to add building' });
            }
        } catch {
            setStatusMessage({ tokenKey: 'server_error', isError: true });
        } finally {
            setIsLoading(false);
        }
    };

    // ── Shared style tokens ──────────────────────────────────────
    const inp = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', backgroundColor: '#fff', color: '#111827', boxSizing: 'border-box', textAlign: isRTL ? 'right' : 'left', direction: isRTL ? 'rtl' : 'ltr', appearance: 'none', WebkitAppearance: 'none' };
    const selectStyle = { ...inp, backgroundColor: '#fff', backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: isRTL ? 'left 12px center' : 'right 12px center', backgroundSize: '16px', paddingLeft: isRTL ? '36px' : '12px', paddingRight: isRTL ? '12px' : '36px' };
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
                            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{t('add_property_title')}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{t('register_asset')}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: '4px' }}>
                        <IconX size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1, boxSizing: 'border-box' }}>

                    {statusMessage.tokenKey && (
                        <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: statusMessage.isError ? '#fef2f2' : '#f0fdf4', color: statusMessage.isError ? '#dc2626' : '#16a34a', border: `1px solid ${statusMessage.isError ? '#fecaca' : '#bbf7d0'}`, textAlign: isRTL ? 'right' : 'left' }}>
                            {statusMessage.fallback || t(statusMessage.tokenKey)}
                        </div>
                    )}

                    {/* 1. BASIC INFO */}
                    <section>
                        <div style={secTitle}>{t('basic_info')}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                <div>
                                    <label style={lbl}>{isRTL ? 'اسم المبنى (عربي)' : 'Building Name (Arabic)'} <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input style={{ ...inp, direction: 'rtl' }} type="text" placeholder="الهداية للعقارات" value={nameAr} onChange={e => setNameAr(e.target.value)} />
                                </div>
                                <div>
                                    <label style={lbl}>{isRTL ? 'اسم المبنى (إنجليزي)' : 'Building Name (English)'} <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input style={{ ...inp, direction: 'ltr' }} type="text" placeholder="Al-Hidaya Building" value={nameEn} onChange={e => setNameEn(e.target.value)} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                                <div><label style={lbl}>{t('total_floors')}</label><input style={inp} type="number" placeholder="12" min="1" value={totalFloor} onChange={e => setTotalFloor(e.target.value)} /></div>
                                <div><label style={lbl}>{t('total_flats')}</label><input style={inp} type="number" placeholder="48" min="1" value={totalFlats} onChange={e => setTotalFlats(e.target.value)} /></div>
                                <div><label style={lbl}>{t('year_built')}</label><input style={inp} type="number" placeholder="2018" min="1900" value={yearBulit} onChange={e => setYearBulit(e.target.value)} /></div>
                                <div><label style={lbl}>{isRTL ? 'رقم المبنى' : 'Building No.'}</label><input style={inp} type="text" placeholder="B-01" value={buldinNumber} onChange={e => setBuldinNumber(e.target.value)} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                <div><label style={lbl}>{isRTL ? 'وصف المبنى (عربي)' : 'Description (Arabic)'}</label><textarea style={{ ...textarea, direction: 'rtl' }} placeholder="وصف المبنى..." value={buldingDescrptionAr} onChange={e => setDescAr(e.target.value)} /></div>
                                <div><label style={lbl}>{isRTL ? 'وصف المبنى (إنجليزي)' : 'Description (English)'}</label><textarea style={{ ...textarea, direction: 'ltr' }} placeholder="Building description..." value={buldingDescrptionEn} onChange={e => setDescEn(e.target.value)} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                <div><label style={lbl}>{isRTL ? 'تفاصيل إضافية (عربي)' : 'Additional Details (Arabic)'}</label><textarea style={{ ...textarea, direction: 'rtl' }} placeholder="تفاصيل إضافية..." value={additional_detailsAr} onChange={e => setAddDetailsAr(e.target.value)} /></div>
                                <div><label style={lbl}>{isRTL ? 'تفاصيل إضافية (إنجليزي)' : 'Additional Details (English)'}</label><textarea style={{ ...textarea, direction: 'ltr' }} placeholder="Additional details..." value={additional_detailsEn} onChange={e => setAddDetailsEn(e.target.value)} /></div>
                            </div>
                        </div>
                    </section>

                    <div style={divider} />

                    {/* 2. UNIT TYPES */}
                    <section>
                        <div style={secTitle}>{t('available_room_types')} <span style={{ color: '#ef4444' }}>*</span></div>
                        <div style={{ position: 'relative' }}>
                            <button type="button" onClick={() => { if (availableUnits.length > 0) setUnitDropdownOpen(p => !p); }} disabled={availableUnits.length === 0}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', background: availableUnits.length === 0 ? '#f9fafb' : '#fff', cursor: availableUnits.length === 0 ? 'not-allowed' : 'pointer', fontSize: '13px', color: '#374151', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                <span style={{ textAlign: isRTL ? 'right' : 'left', flexGrow: 1 }}>{availableUnits.length === 0 ? t('all_room_types') : t('add_room_type')}</span>
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
                        <div style={secTitle}>{t('location')}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                                <div>
                                    <label style={lbl}>{t('governorate')} <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select style={selectStyle} value={gouvernate} onChange={e => { setGovernorate(e.target.value); setWilayat(''); }}>
                                        <option value="">{isRTL ? 'اختر محافظة...' : 'Select governorate…'}</option>
                                        {Object.keys(WILAYATS).map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={lbl}>{t('wilayat')} <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select style={{ ...selectStyle, backgroundColor: !gouvernate ? '#f9fafb' : '#fff' }} value={state} onChange={e => setWilayat(e.target.value)} disabled={!gouvernate}>
                                        <option value="">{gouvernate ? (isRTL ? 'اختر ولاية...' : 'Select wilayat…') : (isRTL ? 'اختر المحافظة أولاً' : 'Select governorate first')}</option>
                                        {gouvernate && (WILAYATS[gouvernate] || []).map(w => <option key={w} value={w}>{w}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={lbl}>{isRTL ? 'العنوان التفصيلي' : 'Detailed Address'} <span style={{ color: '#ef4444' }}>*</span></label>
                                <input style={inp} type="text" placeholder={isRTL ? 'الشارع، المبنى، الحي...' : 'Street, building, area…'} value={location} onChange={e => setLocation(e.target.value)} />
                            </div>
                            <div>
                                <label style={lbl}>{isRTL ? 'قريب من' : 'Near To'}</label>
                                <input style={inp} type="text" placeholder={isRTL ? 'قريب من مول، مستشفى...' : 'Near mall, hospital…'} value={nearTo} onChange={e => setNearTo(e.target.value)} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div><label style={lbl}>{isRTL ? 'خط العرض' : 'Latitude'}</label><input style={{ ...inp, direction: 'ltr' }} type="text" placeholder="23.5880" value={lat} onChange={e => setLat(e.target.value)} /></div>
                                <div><label style={lbl}>{isRTL ? 'خط الطول' : 'Longitude'}</label><input style={{ ...inp, direction: 'ltr' }} type="text" placeholder="58.3829" value={lng} onChange={e => setLng(e.target.value)} /></div>
                            </div>
                        </div>
                    </section>

                    <div style={divider} />

                    {/* 4. CONTACT — added from API fields */}
                    <section>
                        <div style={secTitle}>{isRTL ? 'بيانات التواصل' : 'Contact Information'}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                            <div>
                                <label style={lbl}>{isRTL ? 'هاتف الإدارة' : 'Management Phone'}</label>
                                <input style={{ ...inp, direction: 'ltr' }} type="tel" placeholder="+968 9X XXX XXXX" value={managmentPhone} onChange={e => setManagmentPhone(e.target.value)} />
                            </div>
                            <div>
                                <label style={lbl}>{isRTL ? 'هاتف العمال' : 'Worker Phone'}</label>
                                <input style={{ ...inp, direction: 'ltr' }} type="tel" placeholder="+968 9X XXX XXXX" value={workerPhone} onChange={e => setWorkerPhone(e.target.value)} />
                            </div>
                        </div>
                    </section>

                    <div style={divider} />

                    {/* 5. FINANCIALS */}
                    <section>
                        <div style={secTitle}>{t('financials')}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                                <div><label style={lbl}>{t('min_rent')} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({isRTL ? 'ر.ع/سنوياً' : 'OMR/yr'})</span></label><input style={inp} type="number" placeholder="150" min="0" value={minimumRent} onChange={e => setMinimumRent(e.target.value)} /></div>
                                <div><label style={lbl}>{t('max_rent')} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({isRTL ? 'ر.ع/سنوياً' : 'OMR/yr'})</span></label><input style={inp} type="number" placeholder="800" min="0" value={maxRent} onChange={e => setMaxRent(e.target.value)} /></div>
                                <div><label style={lbl}>{isRTL ? 'الأيام الأدنى' : 'Min Days'}</label><input style={inp} type="number" placeholder="1" min="1" value={minDays} onChange={e => setMinDays(e.target.value)} /></div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '12px', border: '1px solid #185FA5', background: '#F4F9FD', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                    <IconCreditCard size={20} color="#185FA5" />
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0C447C', flexGrow: 1, textAlign: isRTL ? 'right' : 'left' }}>{isRTL ? 'الدفع الإلكتروني عبر الإنترنت' : 'Online Digital Payment'}</span>
                                    <input type="checkbox" checked readOnly style={{ accentColor: '#185FA5' }} />
                                </div>
                                <label style={checkRow}>
                                    <input type="checkbox" checked={acceptDownPay} onChange={e => setAcceptDownPay(e.target.checked)} style={{ accentColor: '#185FA5', width: '16px', height: '16px' }} />
                                    <span style={{ fontSize: '13px', color: '#374151', textAlign: isRTL ? 'right' : 'left' }}>{t('partial_payment_option')}</span>
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

                    {/* 6. POLICY */}
                    <section>
                        <div style={secTitle}>{t('complex_status')}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                                <div><label style={lbl}>{t('check_in')}</label><input style={inp} type="time" value={check_In} onChange={e => setCheckIn(e.target.value)} /></div>
                                <div><label style={lbl}>{t('check_out')}</label><input style={inp} type="time" value={check_Out} onChange={e => setCheckOut(e.target.value)} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                <div><label style={lbl}>{isRTL ? 'سياسة الإلغاء (عربي)' : 'Cancellation Policy (Arabic)'}</label><textarea style={{ ...textarea, direction: 'rtl' }} placeholder="سياسة الإلغاء..." value={cancelation_policyAr} onChange={e => setCancelPolicyAr(e.target.value)} /></div>
                                <div><label style={lbl}>{isRTL ? 'سياسة الإلغاء (إنجليزي)' : 'Cancellation Policy (English)'}</label><textarea style={{ ...textarea, direction: 'ltr' }} placeholder="Cancellation policy..." value={cancelation_policyEn} onChange={e => setCancelPolicyEn(e.target.value)} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                <div><label style={lbl}>{isRTL ? 'سياسة المبنى (عربي)' : 'Building Policy (Arabic)'}</label><textarea style={{ ...textarea, direction: 'rtl' }} placeholder="قواعد المبنى..." value={buildingPolicyAr} onChange={e => setBuildingPolicyAr(e.target.value)} /></div>
                                <div><label style={lbl}>{isRTL ? 'سياسة المبنى (إنجليزي)' : 'Building Policy (English)'}</label><textarea style={{ ...textarea, direction: 'ltr' }} placeholder="Building rules..." value={buildingPolicyEn} onChange={e => setBuildingPolicyEn(e.target.value)} /></div>
                            </div>
                        </div>
                    </section>

                    <div style={divider} />

                    {/* 7. MEDIA */}
                    <section>
                        <div style={secTitle}>{t('media')}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={lbl}>
                                    {t('cover_image')} <span style={{ color: '#ef4444' }}>*</span>
                                </label>

                                <div
                                    onClick={() => coverInputRef.current.click()}
                                    style={{
                                        border: '1.5px dashed #d1d5db',
                                        borderRadius: '10px',
                                        width: '120px',
                                        height: '120px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        backgroundColor: coverPreview ? 'transparent' : '#f9fafb',
                                        backgroundImage: coverPreview ? `url(${coverPreview})` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        transition: 'border 0.2s',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#185FA5'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d5db'}
                                >
                                    {!coverPreview && (
                                        <span
                                            style={{
                                                fontSize: '12px',
                                                color: '#9ca3af',
                                                textAlign: 'center',
                                                padding: '8px'
                                            }}
                                        >
                {isRTL
                    ? 'اضغط لرفع صورة الغلاف الرئيسية'
                    : 'Click to upload main cover image'}
            </span>
                                    )}
                                </div>

                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleCover}
                                />
                            </div>
                            <div>
                                <label style={lbl}>{isRTL ? 'مجموعة الصور (المعرض)' : 'Property Photo Gallery'}</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                                    {galFiles.map(({ preview }, index) => (
                                        <div key={index} style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', backgroundImage: `url(${preview})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                            <button type="button" onClick={() => removeGalImage(index)}
                                                    style={{ position: 'absolute', top: '4px', right: isRTL ? 'auto' : '4px', left: isRTL ? '4px' : 'auto', background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', padding: 0 }}>
                                                <IconTrash size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {galFiles.length < 8 && (
                                        <div onClick={() => galInputRef.current.click()}
                                             style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', border: '1.5px dashed #cbd5e1', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                             onMouseEnter={e => { e.currentTarget.style.borderColor = '#185FA5'; e.currentTarget.style.background = '#f0f6ff'; }}
                                             onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}>
                                            <IconPlus size={20} color="#64748b" />
                                            <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>{galFiles.length}/8</span>
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
                        <div style={secTitle}>{t('services_utilities')}</div>
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
                        {t('cancel')}
                    </button>
                    <button onClick={handleSubmit} disabled={isLoading}
                            style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: isLoading ? '#93c0e4' : '#185FA5', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
                        {isLoading ? (isRTL ? 'جاري الحفظ...' : 'Saving…') : (t('save') || (isRTL ? 'حفظ' : 'Save'))}
                    </button>
                </div>

            </div>
        </div>
    );
}