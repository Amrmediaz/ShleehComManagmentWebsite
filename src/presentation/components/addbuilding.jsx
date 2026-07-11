import React, { useState, useRef } from 'react';
import { useTranslation } from '../context/LanguageContext';
import {
    IconShieldLock, IconWifi, IconCar, IconElevator,
    IconSnowflake, IconBarbell, IconRipple, IconBolt, IconCamera,
    IconX, IconPlus, IconChevronDown, IconCreditCard, IconTrash,
    IconPercentage, IconStar
} from '@tabler/icons-react';

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

function AmenityTile({ item, t, lang }) {
    const [checked, setChecked] = useState(false);
    const { Icon } = item;
    const isRTL = lang === 'ar';

    return (
        <label
            onClick={(e) => {
                if (e.target.type === 'checkbox') return;
                setChecked(p => !p);
            }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexDirection: isRTL ? 'row-reverse' : 'row',
                padding: '10px 12px',
                borderRadius: '12px',
                cursor: 'pointer',
                border: checked ? `1.5px solid ${item.color}` : '1px solid #eef0f3',
                background: checked ? item.bg : '#ffffff',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                flex: '1 1 calc(50% - 12px)',
                minWidth: '145px',
                boxSizing: 'border-box'
            }}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={() => setChecked(p => !p)}
                style={{
                    width: '16px',
                    height: '16px',
                    accentColor: item.color,
                    cursor: 'pointer',
                    flexShrink: 0,
                    margin: 0
                }}
            />

            <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: checked ? '#ffffff' : item.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}>
                <Icon size={18} color={item.color} stroke={2} />
            </div>

            <span style={{
                fontSize: 'clamp(11px, 2.8vw, 13px)',
                fontWeight: 550,
                color: checked ? '#111827' : '#4b5563',
                textAlign: isRTL ? 'right' : 'left',
                lineHeight: 1.2,
                wordBreak: 'break-word',
                hyphens: 'auto',
                flexGrow: 1
            }}>
                {t(item.key)}
            </span>
        </label>
    );
}

export default function AddPropertyModal({ isOpen, onClose }) {
    const { t, lang } = useTranslation();
    const isRTL = lang === 'ar';

    const [coverPreview, setCoverPreview] = useState(null);
    const coverInputRef = useRef();

    // حالات إدارة معرض الصور (المجموعة)
    const [galFiles, setGalFiles] = useState([]);
    const galInputRef = useRef();

    const [selectedUnits, setSelectedUnits] = useState([]);
    const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);
    const [governorate, setGovernorate] = useState('');
    const [wilayat, setWilayat] = useState('');
    const [cancelPolicy, setCancelPolicy] = useState('');
    const [minBookingDays, setMinBookingDays] = useState('');

    if (!isOpen) return null;

    const addUnitType = (unit) => {
        if (!selectedUnits.find(u => u.id === unit.id)) {
            setSelectedUnits(prev => [...prev, { ...unit }]);
        }
        setUnitDropdownOpen(false);
    };
    const removeUnitType = (id) => setSelectedUnits(prev => prev.filter(u => u.id !== id));
    const availableUnits = UNIT_TYPES.filter(u => !selectedUnits.find(s => s.id === u.id));

    const handleGovernorateChange = (e) => {
        setGovernorate(e.target.value);
        setWilayat('');
    };

    const handleCover = (e) => {
        const file = e.target.files[0];
        if (file) setCoverPreview(URL.createObjectURL(file));
    };

    // معالجة إضافة الصور متعددة للمعرض
    const handleGallery = (e) => {
        const files = Array.from(e.target.files);
        const fileURLs = files.map(file => URL.createObjectURL(file));
        setGalFiles(prev => [...prev, ...fileURLs].slice(0, 8)); // حد أقصى 8 صور
        e.target.value = '';
    };

    const removeGalImage = (index) => {
        setGalFiles(prev => prev.filter((_, i) => i !== index));
    };

    const inp = {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '13px',
        background: '#fff',
        color: '#111827',
        boxSizing: 'border-box',
        textAlign: isRTL ? 'right' : 'left',
        direction: isRTL ? 'rtl' : 'ltr',
        appearance: 'none',
        WebkitAppearance: 'none'
    };

    const selectStyle = {
        ...inp,
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: isRTL ? 'left 12px center' : 'right 12px center',
        backgroundSize: '16px',
        paddingLeft: isRTL ? '36px' : '12px',
        paddingRight: isRTL ? '12px' : '36px'
    };

    const lbl = { fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: '6px', display: 'block', textAlign: isRTL ? 'right' : 'left' };
    const secTitle = { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9ca3af', marginBottom: '12px', textAlign: isRTL ? 'right' : 'left' };
    const divider = { height: '1px', background: '#f3f4f6', margin: '4px 0' };

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

    return (
        <div style={{ display: 'flex', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '12px', boxSizing: 'border-box' }}>
            <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '720px', width: '100%', maxHeight: 'calc(100vh - 24px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', direction: isRTL ? 'rtl' : 'ltr', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>

                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: isRTL ? 'row-reverse' : 'row', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="ti ti-building-skyscraper" style={{ fontSize: '18px', color: '#185FA5' }} />
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

                {/* Scrollable Form Body */}
                <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1, boxSizing: 'border-box' }}>

                    {/* ── 1. BASIC INFO ── */}
                    {/*<section>*/}
                    {/*    <div style={secTitle}>{t('basic_info')}</div>*/}
                    {/*    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>*/}
                    {/*        <div>*/}
                    {/*            <label style={lbl}>{t('building_name')} <span style={{ color: '#ef4444' }}>*</span></label>*/}
                    {/*            <input style={inp} type="text" placeholder={t('placeholder_name')} />*/}
                    {/*        </div>*/}
                    {/*        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>*/}
                    {/*            <div><label style={lbl}>{t('total_floors')}</label><input style={inp} type="number" placeholder="12" /></div>*/}
                    {/*            <div><label style={lbl}>{t('total_flats')}</label><input style={inp} type="number" placeholder="48" /></div>*/}
                    {/*            <div><label style={lbl}>{t('year_built')}</label><input style={inp} type="number" placeholder="2018" /></div>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</section>*/}

                    <div style={divider} />

                    {/* ── 2. UNIT BREAKDOWN ── */}
                    {/*<section>*/}
                    {/*    <div style={secTitle}>{t('available_room_types')}</div>*/}
                    {/*    <div style={{ position: 'relative', width: '100%' }}>*/}
                    {/*        <button*/}
                    {/*            type="button"*/}
                    {/*            onClick={() => { if (availableUnits.length > 0) setUnitDropdownOpen(p => !p); }}*/}
                    {/*            disabled={availableUnits.length === 0}*/}
                    {/*            style={{*/}
                    {/*                display: 'flex', alignItems: 'center', justifyContent: 'space-between',*/}
                    {/*                width: '100%', padding: '10px 12px',*/}
                    {/*                border: '1px solid #d1d5db', borderRadius: '8px',*/}
                    {/*                background: availableUnits.length === 0 ? '#f9fafb' : '#fff',*/}
                    {/*                cursor: availableUnits.length === 0 ? 'not-allowed' : 'pointer',*/}
                    {/*                fontSize: '13px', color: '#374151',*/}
                    {/*                flexDirection: isRTL ? 'row-reverse' : 'row'*/}
                    {/*            }}*/}
                    {/*        >*/}
                    {/*            <span style={{ textAlign: isRTL ? 'right' : 'left', flexGrow: 1 }}>*/}
                    {/*                {availableUnits.length === 0 ? t('all_room_types') : t('add_room_type')}*/}
                    {/*            </span>*/}
                    {/*            <IconChevronDown size={16} style={{ transform: unitDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />*/}
                    {/*        </button>*/}
                    
                    {/*        {unitDropdownOpen && (*/}
                    {/*            <div style={{*/}
                    {/*                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,*/}
                    {/*                background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',*/}
                    {/*                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100,*/}
                    {/*                maxHeight: '200px', overflowY: 'auto'*/}
                    {/*            }}>*/}
                    {/*                {availableUnits.map(unit => (*/}
                    {/*                    <button*/}
                    {/*                        key={unit.id}*/}
                    {/*                        type="button"*/}
                    {/*                        onClick={() => addUnitType(unit)}*/}
                    {/*                        style={{*/}
                    {/*                            display: 'flex', width: '100%', padding: '10px 14px',*/}
                    {/*                            background: 'none', border: 'none', cursor: 'pointer',*/}
                    {/*                            borderBottom: '1px solid #f3f4f6', textAlign: isRTL ? 'right' : 'left'*/}
                    {/*                        }}*/}
                    {/*                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}*/}
                    {/*                        onMouseLeave={e => e.currentTarget.style.background = 'none'}*/}
                    {/*                    >*/}
                    {/*                        <span style={{ fontSize: '13px', color: '#374151', width: '100%' }}>*/}
                    {/*                            {isRTL ? unit.ar : unit.en.replace(/_/g, ' ').replace(/\w/g, c => c.toUpperCase())}*/}
                    {/*                        </span>*/}
                    {/*                    </button>*/}
                    {/*                ))}*/}
                    {/*            </div>*/}
                    {/*        )}*/}
                    {/*    </div>*/}
                    
                    {/*    {selectedUnits.length > 0 && (*/}
                    {/*        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>*/}
                    {/*            {selectedUnits.map(unit => (*/}
                    {/*                <div key={unit.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '16px', background: '#f0f6ff', border: '1px solid #c7ddf5' }}>*/}
                    {/*                    <span style={{ fontSize: '12px', color: '#185FA5', fontWeight: 500 }}>*/}
                    {/*                        {isRTL ? unit.ar : unit.en.replace(/_/g, ' ').replace(/\w/g, c => c.toUpperCase())}*/}
                    {/*                    </span>*/}
                    {/*                    <button type="button" onClick={() => removeUnitType(unit.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#93aecb', display: 'flex', padding: 0 }}>*/}
                    {/*                        <IconX size={12} />*/}
                    {/*                    </button>*/}
                    {/*                </div>*/}
                    {/*            ))}*/}
                    {/*        </div>*/}
                    {/*    )}*/}
                    {/*</section>*/}

                    <div style={divider} />

                    {/* ── 3. LOCATION ── */}
                    <section>
                        <div style={secTitle}>{t('location')}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                                <div>
                                    <label style={lbl}>{t('governorate')} <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select style={selectStyle} value={governorate} onChange={handleGovernorateChange}>
                                        <option value="">{isRTL ? 'اختر محافظة...' : 'Select governorate…'}</option>
                                        {Object.keys(WILAYATS).map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={lbl}>{t('wilayat')} <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select
                                        style={{ ...selectStyle, background: !governorate ? '#f9fafb' : '#fff' }}
                                        value={wilayat}
                                        onChange={e => setWilayat(e.target.value)}
                                        disabled={!governorate}
                                    >
                                        <option value="">
                                            {governorate
                                                ? (isRTL ? 'اختر ولاية...' : 'Select wilayat…')
                                                : (isRTL ? 'اختر المحافظة أولاً' : 'Select governorate first')}
                                        </option>
                                        {governorate && (WILAYATS[governorate] || []).map(w => (
                                            <option key={w} value={w}>{w}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={lbl}>{t('location')} <span style={{ color: '#ef4444' }}>*</span></label>
                                <input style={inp} type="text" placeholder={isRTL ? 'الشارع، المبنى، الحي...' : 'Street, building, area…'} />
                            </div>
                        </div>
                    </section>

                    <div style={divider} />

                    {/* ── 4. FINANCIALS & MINIMUM STAY ── */}
                    <section>
                        <div style={secTitle}>{t('financials')}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                                <div>
                                    <label style={lbl}>{t('min_rent')} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({isRTL ? 'ر.ع/شهريا' : '{t('OMR')}/yr'})</span></label>
                                    <input style={inp} type="number" placeholder="150" />
                                </div>
                                <div>
                                    <label style={lbl}>{t('max_rent')} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({isRTL ? 'ر.ع/شهريا' : '{t('OMR')}/yr'})</span></label>
                                    <input style={inp} type="number" placeholder="800" />
                                </div>
                                <div>
                                    <label style={lbl}>{isRTL ? 'الأيام الأدنى' : 'Min Days'}</label>
                                    <input style={inp} type="number" placeholder="1" />
                                </div>
                            </div>

                            {/* خيارات الدفع */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {/* الدفع الإلكتروني */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '12px', border: '1px solid #185FA5', background: '#F4F9FD', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                    <IconCreditCard size={20} color="#185FA5" />
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0C447C', flexGrow: 1, textAlign: isRTL ? 'right' : 'left' }}>
                    {isRTL ? 'الدفع الإلكتروني عبر الإنترنت' : 'Online Digital Payment'}
                </span>
                                    <input type="checkbox" checked={true} readOnly={true} style={{ accentColor: '#185FA5' }} />
                                </div>

                                {/* الخيار الجديد: دفع 25% مقدم */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '12px', border: '1px solid #d1d5db', cursor: 'pointer', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                    <input type="checkbox" style={{ accentColor: '#185FA5', width: '16px', height: '16px' }} />
                                    <span style={{ fontSize: '13px', color: '#374151', textAlign: isRTL ? 'right' : 'left' }}>
                    {t('partial_payment_option')}
                </span>
                                </label>
                                <label style={checkboxRowStyle}>
                                    <IconStar size={20} color="#6b7280" />
                                    <span style={{ fontSize: '13px', color: '#374151', flexGrow: 1, textAlign: isRTL ? 'right' : 'left' }}>{isRTL ? 'عقار حصري' : 'Exclusive Property'}</span>
                                    <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#185FA5', cursor: 'pointer' }} />
                                </label>
                            </div>
                        </div>

                    </section>

                    <div style={divider} />

                    {/* ── 5. POLICY ── */}
                    <section>
                        <div style={secTitle}>{t('complex_status')}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                                <div><label style={lbl}>{t('check_in')}</label><input style={inp} type="time" defaultValue="14:00" /></div>
                                <div><label style={lbl}>{t('check_out')}</label><input style={inp} type="time" defaultValue="11:00" /></div>
                            </div>
                            <div>
                                <label style={lbl}>{isRTL ? 'سياسة الإلغاء' : 'Cancellation Policy'}</label>
                                <select style={selectStyle} value={cancelPolicy} onChange={e => setCancelPolicy(e.target.value)}>
                                    <option value="">{isRTL ? 'اختر السياسة...' : 'Select policy…'}</option>
                                    <option value="flexible">{isRTL ? 'مرن - يوم واحد' : 'Flexible – 1 day'}</option>
                                    <option value="non_refundable">{isRTL ? 'غير قابل للاسترداد' : 'Non-refundable'}</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <div style={divider} />

                    {/* ── 6. MEDIA (صورة الغلاف ومعرض الصور الجديد) ── */}
                    <section>
                        <div style={secTitle}>{t('media')}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {/* حقل صورة الغلاف الرئيسي */}
                            <div>
                                <label style={lbl}>{t('cover_image')}</label>
                                <div onClick={() => coverInputRef.current.click()} style={{ border: '1.5px dashed #d1d5db', borderRadius: '10px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: coverPreview ? `center/cover url(${coverPreview})` : '#f9fafb', position: 'relative', transition: 'border 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#185FA5'} onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d5db'}>
                                    {!coverPreview && <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isRTL ? 'اضغط لرفع صورة الغلاف الرئيسية' : 'Click to upload main cover image'}</span>}
                                </div>
                                <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCover} />
                            </div>

                            {/* الحقل الجديد: معرض الصور المضاف أسفل الغلاف */}
                            <div>
                                <label style={lbl}>{isRTL ? 'مجموعة الصور (المعرض)' : 'Property Photo Gallery'}</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>

                                    {/* عرض الصور المرفوعة مسبقاً في المعرض */}
                                    {galFiles.map((url, index) => (
                                        <div key={index} style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', background: `center/cover url(${url})`, position: 'relative', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                            <button type="button" onClick={() => removeGalImage(index)} style={{ position: 'absolute', top: '4px', left: isRTL ? '4px' : 'auto', right: isRTL ? 'auto' : '4px', background: 'rgba(239, 68, 68, 0.9)', border: 'none', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', padding: 0 }}>
                                                <IconTrash size={12} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* زر إضافة المزيد من الصور للمعرض */}
                                    {galFiles.length < 8 && (
                                        <div onClick={() => galInputRef.current.click()} style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', border: '1.5px dashed #cbd5e1', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#185FA5'; e.currentTarget.style.background = '#f0f6ff'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}>
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

                    {/* ── 7. SERVICES & UTILITIES ── */}
                    <section>
                        <div style={secTitle}>{t('services_utilities')}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', width: '100%' }}>
                            {amenities.map(item => (
                                <AmenityTile key={item.key} item={item} t={t} lang={lang} />
                            ))}
                        </div>
                    </section>

                </div>

                {/* Footer Controls */}
                <div style={{ padding: '14px 20px', background: '#f9fafb', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', flexDirection: isRTL ? 'row-reverse' : 'row', flexShrink: 0 }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: '13px', cursor: 'pointer' }}>
                        {t('cancel')}
                    </button>
                    <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#185FA5', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                        {t('save') || (isRTL ? 'حفظ' : 'Save')}
                    </button>
                </div>

            </div>
        </div>
    );
}