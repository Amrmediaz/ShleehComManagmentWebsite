import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext.jsx';
import { AddFlatUseCase } from '../../../core/useCases/AddFlatUseCase';
import { fileUploadApiClient } from '/src/data/FileUploadClient.js';
import { IconX, IconPlus, IconTrash, IconDeviceFloppy } from '@tabler/icons-react';

export default function AddRoomModal({id, onClose, buildingId, buildingName }) {
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        nameAr:                  '',
        nameEn:                  buildingName || '',
        description:             '',
        visitors_count:          '',
        insurance_amount:        '',
        count:                   '',
        price_per_night:         '',
        weekend_price_per_night: '',
        tolits_number:           '',
        beds_number:             '',
        unit_breakdown_id:       '',
        hotelbuildingID : id
    });
    const UNIT_TYPES = [
        { id: 1, en: "studio", ar: "استوديو" },
        { id: 2, en: "one_br", ar: "غرفة_وصالة" },
        { id: 3, en: "two_br", ar: "غرفتين_وصالة" },
        { id: 4, en: "three_br", ar: "ثلاث_غرف_وصالة" },
        { id: 5, en: "four_br", ar: "أربع_غرف_وصالة" },
        { id: 6, en: "five_plus_br", ar: "خمس_غرف_وصالة_فأكثر" },
        { id: 7, en: "loft", ar: "صالة_مفتوحة_لوفت" },
        { id: 8, en: "duplex", ar: "دوبلكس" },
        { id: 9, en: "triplex", ar: "تريبلكس" },
        { id: 10, en: "penthouse", ar: "بنتهاوس" },
        { id: 11, en: "garden_apartment", ar: "شقة_أرضية_بحديقة" },
        { id: 12, en: "basement_apartment", ar: "شقة_قبو" },
        { id: 13, en: "serviced_apartment", ar: "شقة_مفروشة_بخدمات" }
    ];
    const [selectedElectronics, setSelectedElectronics] = useState([]);
    const [coverFile,           setCoverFile]           = useState(null);
    const [coverPreview,        setCoverPreview]        = useState(null);
    const [galFiles,            setGalFiles]            = useState([]);

    const [isLoading,     setIsLoading]     = useState(false);
    const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });
    const [errors,        setErrors]        = useState({});

    const coverInputRef   = useRef();
    const galleryInputRef = useRef();

    const electronicsOptions = [
        { id: '1',              label: t('smart_tv')        || 'Smart TV' },
        { id: '2',              label: t('air_conditioner') || 'Air Conditioner' },
        { id: '3',          label: t('refrigerator')    || 'Refrigerator' },
        { id: '4', label: t('washing_machine') || 'Washing Machine' },
        { id: '5',       label: t('microwave')       || 'Microwave' },
        { id: '6',            label: t('iron')            || 'Iron' },
        { id: '7',          label: t('kettle')          || 'Kettle' },
        { id: '8',            label: t('oven')            || 'Electric Oven' },
    ];

    useEffect(() => {
        return () => {
            if (coverPreview) URL.revokeObjectURL(coverPreview);
            galFiles.forEach(({ preview }) => URL.revokeObjectURL(preview));
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // clear inline error as user types
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const toggleElectronic = (id) =>
        setSelectedElectronics(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (coverPreview) URL.revokeObjectURL(coverPreview);
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        const entries = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
        setGalFiles(prev => [...prev, ...entries].slice(0, 6));
        e.target.value = '';
    };

    const removeGalleryImage = (index) => {
        URL.revokeObjectURL(galFiles[index].preview);
        setGalFiles(prev => prev.filter((_, i) => i !== index));
    };

    // inline field-level validation — returns error map
    const validateLocally = () => {
        const e = {};
        if (!formData.nameAr.trim())               e.nameAr               = t('error_name_ar_required')   || 'Arabic name is required';
        if (!formData.nameEn.trim())               e.nameEn               = t('error_name_en_required')   || 'English name is required';
        if (!formData.count || Number(formData.count) < 1)
            e.count                = t('error_count_required')     || 'Total count is required';
        if (!formData.unit_breakdown_id)           e.unit_breakdown_id    = t('error_unit_type_required') || 'Unit type is required';
        if (!formData.price_per_night || Number(formData.price_per_night) < 0)
            e.price_per_night      = t('error_base_rate_required') || 'Base rate is required';
        if (!formData.weekend_price_per_night || Number(formData.weekend_price_per_night) < 0)
            e.weekend_price_per_night = t('error_weekend_rate_required') || 'Weekend rate is required';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage({ text: '', isError: false });

        // 1. Local inline validation first
        const fieldErrors = validateLocally();
        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
        }
        setErrors({});
        setIsLoading(true);

        try {
            // 2. Upload cover
            let coverimg = '';
            if (coverFile) {
                const res = JSON.parse(await fileUploadApiClient.uploadFile(coverFile));
                if (res?.status) {
                    coverimg = 'https://shleeh.com/' + res.message.replace(/^\//, '');
                } else {
                    console.error('[AddRoomModal] Cover upload failed');
                }
            }

            // 3. Upload gallery
            const flatImages = [];
            for (const { file } of galFiles) {
                try {
                    const res = JSON.parse(await fileUploadApiClient.uploadFile(file));
                    if (res?.status) {
                        flatImages.push({ id: 0, path: 'https://shleeh.com/' + res.message.replace(/^\//, ''), flatId: 0 });
                    }
                } catch (err) {
                    console.error('[AddRoomModal] Gallery upload error:', err);
                }
            }

            // 4. Build payload — keys match FlatEntity constructor exactly
            
            const payload = {
                hotelbuildingID:         id || 0,
                nameAr:                  formData.nameAr.trim(),
                nameEn:                  formData.nameEn.trim(),
                descrptionAr:            formData.description || '',
                descrptionEn:            formData.description || '',
                visitors_count:          formData.visitors_count || '',
                bedsNumber:              formData.beds_number   || '',
                bathroomsNumber:         formData.tolits_number || '',
                count:                   formData.count,
                occupied:                0,
                price_per_night:         parseFloat(formData.price_per_night)         || 0,
                weekend_price_per_night: parseFloat(formData.weekend_price_per_night) || 0,
                insurance_amount:        parseFloat(formData.insurance_amount)        || 0,
                value1:                  formData.unit_breakdown_id || '',
                coverimg,
                flatImages,
                electronic_devices: selectedElectronics.map(eleId => {
                    // Find the object from your constant list using the ID
                    const option = electronicsOptions.find(opt => opt.id === eleId);
                    return {
                        id:0, // Or 0, depending on your DB
                        serviceName: option ? option.label : "Unknown",
                        flatId: 0 // Mirroring your successful flatImages structure
                    };
                }),
                isActive:                true,
                isDeleted:               false,
                stopBook:                false,
                showComments:            true,
            };
            console.log(payload);

            // 5. Use case: validate → FlatEntity → API
            const { validationError, result } = await AddFlatUseCase.execute(payload);

            if (validationError) {
                setStatusMessage({ text: t(validationError) || validationError, isError: true });
                return;
            }

            if (result?.status === true) {
                setStatusMessage({ text: t('flat_added_success') || 'Flat added successfully!', isError: false });
                setTimeout(() => onClose(), 1400);
            } else {
                setStatusMessage({ text: result?.message || t('flat_add_failed') || 'Failed to add flat.', isError: true });
            }

        } catch (err) {
            console.error('[AddRoomModal] Unexpected error:', err);
            setStatusMessage({ text: t('server_error') || 'Server error, please try again.', isError: true });
        } finally {
            setIsLoading(false);
        }
    };

    // ── Styles ────────────────────────────────────────────────────
    const inpStyle = (fieldName) => ({
        width: '100%', padding: '10px 12px', border: `1px solid ${errors[fieldName] ? '#ef4444' : '#d1d5db'}`,
        borderRadius: '8px', fontSize: '13px', background: '#ffffff',
        color: '#111827', boxSizing: 'border-box', marginTop: '4px',
    });
    const lblStyle = { fontSize: '12px', fontWeight: 500, color: '#4b5563', display: 'block' };
    const errStyle = { fontSize: '11px', color: '#ef4444', marginTop: '3px' };
    const reqStar  = <span style={{ color: '#ef4444' }}> *</span>;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '12px', boxSizing: 'border-box' }}>
            <div style={{ background: 'white', borderRadius: '16px', maxWidth: '640px', width: '100%', maxHeight: 'calc(100vh - 24px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>

                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                        {t('add_flat_type')}
                    </h2>
                    <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: '4px' }}>
                        <IconX size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1, boxSizing: 'border-box' }}>

                    {/* Status banner */}
                    {statusMessage.text && (
                        <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: statusMessage.isError ? '#fef2f2' : '#f0fdf4', color: statusMessage.isError ? '#dc2626' : '#16a34a', border: `1px solid ${statusMessage.isError ? '#fecaca' : '#bbf7d0'}` }}>
                            {statusMessage.text}
                        </div>
                    )}

                    {/* Names — AR + EN side by side */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={lblStyle}>{t('flat_type_name_ar') || 'Flat Name (AR)'}{reqStar}</label>
                            <input
                                name="nameAr"
                                type="text"
                                value={formData.nameAr}
                                placeholder="استوديو مع إطلالة"
                                onChange={handleChange}
                                style={{ ...inpStyle('nameAr'), direction: 'rtl', textAlign: 'right' }}
                            />
                            {errors.nameAr && <div style={errStyle}>{errors.nameAr}</div>}
                        </div>
                        <div>
                            <label style={lblStyle}>{t('flat_type_name_en') || 'Flat Name (EN)'}{reqStar}</label>
                            <input
                                name="nameEn"
                                type="text"
                                value={formData.nameEn}
                                placeholder="Studio with view"
                                onChange={handleChange}
                                style={{ ...inpStyle('nameEn'), direction: 'ltr' }}
                            />
                            {errors.nameEn && <div style={errStyle}>{errors.nameEn}</div>}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label style={lblStyle}>{t('additional_details')}</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            placeholder={t('description_placeholder')}
                            onChange={handleChange}
                            style={{ ...inpStyle('description'), height: '60px', resize: 'none', fontFamily: 'inherit' }}
                        />
                    </div>

                    {/* Count + Unit type */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', alignItems: 'flex-start' }}>

                        {/* Unit Type Selection */}
                        <div>
                            <label style={lblStyle}>{t('select_unit_type')}{reqStar}</label>
                            <select
                                name="unit_breakdown_id"
                                value={formData.unit_breakdown_id}
                                onChange={handleChange}
                                style={inpStyle('unit_breakdown_id')}
                            >
                                <option value="">-- {t('select_unit_type')} --</option>
                                {UNIT_TYPES.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {t(type.en) || type.en}
                                    </option>
                                ))}
                            </select>
                            {errors.unit_breakdown_id && <div style={errStyle}>{errors.unit_breakdown_id}</div>}
                        </div>

                        {/* Total Count */}
                        <div>
                            <label style={lblStyle}>{t('total')}{reqStar}</label>
                            <input
                                name="count"
                                type="number"
                                value={formData.count}
                                placeholder="6"
                                onChange={handleChange}
                                style={inpStyle('count')}
                            />
                            {errors.count && <div style={errStyle}>{errors.count}</div>}
                        </div>

                    </div>

                    {/* Capacity / beds / toilets */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                        <div>
                            <label style={lblStyle}>{t('capacity')}</label>
                            <input name="visitors_count" type="text" value={formData.visitors_count} placeholder="4 Adults" onChange={handleChange} style={inpStyle('visitors_count')} />
                        </div>
                        <div>
                            <label style={lblStyle}>{t('beds_number')}</label>
                            <input name="beds_number" type="number" value={formData.beds_number} placeholder="2" onChange={handleChange} style={inpStyle('beds_number')} />
                        </div>
                        <div>
                            <label style={lblStyle}>{t('toilets_number')}</label>
                            <input name="tolits_number" type="number" value={formData.tolits_number} placeholder="1" onChange={handleChange} style={inpStyle('tolits_number')} />
                        </div>
                    </div>

                    {/* Electronics */}
                    <div>
                        <label style={lblStyle}>{t('apartment_electronics') || 'In-Unit Electronics'}</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                            {electronicsOptions.map((item) => {
                                const isSelected = selectedElectronics.includes(item.id);
                                return (
                                    <div key={item.id} onClick={() => toggleElectronic(item.id)} style={{ padding: '6px 12px', borderRadius: '20px', border: isSelected ? '1px solid #185FA5' : '1px solid #e5e7eb', background: isSelected ? '#eff6ff' : '#f9fafb', color: isSelected ? '#185FA5' : '#4b5563', fontSize: '12px', fontWeight: isSelected ? '600' : '400', cursor: 'pointer', userSelect: 'none', transition: 'all 0.15s ease' }}>
                                        {item.label}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Prices */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={lblStyle}>{t('base_rate')}{reqStar}</label>
                            <input name="price_per_night" type="number" step="0.001" value={formData.price_per_night} placeholder="40.000" onChange={handleChange} style={inpStyle('price_per_night')} />
                            {errors.price_per_night && <div style={errStyle}>{errors.price_per_night}</div>}
                        </div>
                        <div>
                            <label style={lblStyle}>{t('weekend_rate')}{reqStar}</label>
                            <input name="weekend_price_per_night" type="number" step="0.001" value={formData.weekend_price_per_night} placeholder="55.000" onChange={handleChange} style={inpStyle('weekend_price_per_night')} />
                            {errors.weekend_price_per_night && <div style={errStyle}>{errors.weekend_price_per_night}</div>}
                        </div>
                    </div>

                    {/* Insurance */}
                    <div>
                        <label style={lblStyle}>{t('insurance_amount')}</label>
                        <input name="insurance_amount" type="number" step="0.001" value={formData.insurance_amount} placeholder="20.000" onChange={handleChange} style={inpStyle('insurance_amount')} />
                    </div>

                    {/* Media */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label style={lblStyle}>{t('cover_image')}</label>

                            <div
                                onClick={() => coverInputRef.current.click()}
                                style={{
                                    border: '1.5px dashed #cbd5e1',
                                    borderRadius: '10px',
                                    width: '120px',
                                    height: '120px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    background: coverPreview
                                        ? `center/cover url(${coverPreview})`
                                        : '#f8fafc',
                                    transition: 'all 0.2s',
                                    marginTop: '4px',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#185FA5'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                            >
                                {!coverPreview && (
                                    <span
                                        style={{
                                            fontSize: '12px',
                                            color: '#64748b',
                                            textAlign: 'center',
                                            padding: '8px'
                                        }}
                                    >
                {t('click_upload')}
            </span>
                                )}
                            </div>

                            <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleCoverChange}
                            />
                        </div>

                        <div>
                            <label style={lblStyle}>{t('media')}</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px', marginTop: '4px' }}>
                                {galFiles.map(({ preview }, index) => (
                                    <div key={index} style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', background: `center/cover url(${preview})`, position: 'relative', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                        <button type="button" onClick={() => removeGalleryImage(index)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: '4px', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', padding: 0 }}>
                                            <IconTrash size={10} />
                                        </button>
                                    </div>
                                ))}
                                {galFiles.length < 6 && (
                                    <div onClick={() => galleryInputRef.current.click()} style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', border: '1.5px dashed #cbd5e1', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                         onMouseEnter={e => { e.currentTarget.style.borderColor = '#185FA5'; e.currentTarget.style.background = '#f0f6ff'; }}
                                         onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}>
                                        <IconPlus size={16} color="#64748b" />
                                        <span style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>{galFiles.length}/6</span>
                                    </div>
                                )}
                            </div>
                            <input ref={galleryInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleGalleryChange} />
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: '12px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} disabled={isLoading} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: '13px', cursor: 'pointer' }}>
                            {t('cancel')}
                        </button>
                        <button type="submit" disabled={isLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isLoading ? '#93c0e4' : '#185FA5', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
                            <IconDeviceFloppy size={16} />
                            {isLoading ? t('saving') || 'Saving…' : t('add_flat_type')}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}