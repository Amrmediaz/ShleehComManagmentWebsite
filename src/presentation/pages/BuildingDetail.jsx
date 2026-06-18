import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import EditBuildingModal from '../components/EditBuildingModal.jsx';
import EditRoomModal from '../components/EditRoomModal.jsx';
import AddRoomModal from "../components/AddRoomModal.jsx";
import { GetOwnerBuildingsFlatUseCase } from "../../core/useCases/GetBuildingsFlatUseCase.js";
import { GetOwnerFlatUseCase } from "../../core/useCases/GetFlatByIdUseCase.js";

const DetailRow = ({ icon, label, value }) => {
    if (!value && value !== 0) return null;
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--slate-100, #f1f5f9)' }}>
            <i className={icon} style={{ color: '#6366f1', width: '18px', marginTop: '2px', flexShrink: 0 }}></i>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{value}</div>
            </div>
        </div>
    );
};

const SectionCard = ({ title, icon, children }) => (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc' }}>
            <i className={icon} style={{ color: '#6366f1' }}></i>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{title}</h3>
        </div>
        <div style={{ padding: '4px 20px 12px' }}>{children}</div>
    </div>
);

export default function BuildingDetail({ building, onUpdateBuilding }) {
    const { t, lang } = useTranslation();
  
    // ===== ALL STATE HOOKS (MUST BE AT TOP) =====
    const [localBuilding, setLocalBuilding] = useState(building);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [flats, setFlats] = useState([]);
    const [loadingFlats, setLoadingFlats] = useState(false);
    const [imageLoadError, setImageLoadError] = useState(false);
    const [buildingRefreshTrigger, setBuildingRefreshTrigger] = useState(0);
    const [editingFlat, setEditingFlat] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editLoadingFlat, setEditLoadingFlat] = useState(false);

    // ===== EFFECTS =====
    useEffect(() => {
        if (building) {
            console.log('[BuildingDetail] Building updated from props:', {
                id: building?.id,
                raw_id: building?.raw?.id,
                name: building?.nameEn,
                hasCoverImg: !!building?.coverImg,
            });

            const coverImg = building.coverImg || building.raw?.coverimg;
            const images = building.images || (building.raw?.buldingImages?.map(img => ({
                id: img.id,
                url: img.path
            })) || []);

            // ✅ CRITICAL: Ensure building has ID at top level
            const enrichedBuilding = {
                ...building,
                id: building?.id || building?.raw?.id,  // ✅ Ensure ID is at top level
                coverImg: coverImg,
                images: images,
            };

            console.log('[BuildingDetail] Enriched Building with ID:', {
                id: enrichedBuilding.id,
                raw_id: enrichedBuilding.raw?.id,
                coverImg: enrichedBuilding.coverImg,
                imagesCount: enrichedBuilding.images?.length || 0
            });

            setLocalBuilding(enrichedBuilding);
            setImageLoadError(false);
        }
    }, [building, building?.coverImg, building?.raw?.coverimg, building?.raw?.buldingImages, building?.id, building?.nameEn]);

    useEffect(() => {
        if (building?.id) {
            fetchFlats();
        }
    }, [building?.id, buildingRefreshTrigger]);

    // ===== HANDLERS =====
    const fetchFlats = async () => {
        if (!building?.id) return;
        try {
            setLoadingFlats(true);
            const result = await GetOwnerBuildingsFlatUseCase.execute(building.id);
            const flatsData = Array.isArray(result) ? result : [];
            console.log("FLATS DATA:", flatsData);
            setFlats(flatsData);
        } catch (err) {
            console.error('[BuildingDetail] Failed to fetch flats:', err);
            setFlats([]);
        } finally {
            setLoadingFlats(false);
        }
    };

    // ✅ NEW: Function to check building ID before opening modal
    const handleEditBuilding = () => {
        console.log('[BuildingDetail] handleEditBuilding called');

        // Simple check - no variable scope issues
        if (!localBuilding?.id && !localBuilding?.raw?.id) {
            console.error('[BuildingDetail] ERROR: Building ID is missing!');
            alert('Error: Building ID is missing. Please refresh the page.');
            return;
        }

        console.log('[BuildingDetail] Opening edit modal');
        setIsEditOpen(true);  // ✅ Opens modal with building data
    };

    const handleUpdate = (updatedRaw) => {
        console.log('[BuildingDetail] handleUpdate called with:', updatedRaw);

        const updated = {
            ...localBuilding,
            id: localBuilding.id || localBuilding.raw?.id,  // ✅ Preserve ID
            nameAr: updatedRaw.nameAr,
            nameEn: updatedRaw.nameEn,
            isActive: updatedRaw.isActive,
            floors: updatedRaw.totalFloor,
            flats: updatedRaw.totalFlats,
            governorate: updatedRaw.gouvernate,
            wilayat: updatedRaw.state,
            address: updatedRaw.gouvernate,
            coverImg: updatedRaw.coverimg || localBuilding.coverImg,
            services: updatedRaw.buldingService?.map(s => s.serviceName) || [],
            images: updatedRaw.buldingImages?.map(img => ({ id: img.id, url: img.path })) || localBuilding.images,
            raw: { ...localBuilding.raw, ...updatedRaw },
        };

        console.log('[BuildingDetail] Updated building:', {
            id: updated.id,
            raw_id: updated.raw?.id,
            nameEn: updated.nameEn
        });

        setLocalBuilding(updated);
        if (onUpdateBuilding) onUpdateBuilding(updated);
        setIsEditOpen(false);
    };

    const handleEditFlat = async (flat) => {
        setEditLoadingFlat(true);
        try {
            console.log('[BuildingDetail] Fetching flat data for ID:', flat.id);
            const freshFlatData = await GetOwnerFlatUseCase.execute(flat.id);

            console.log('=== DEBUG: Fresh flat data ===');
            console.log('Type:', typeof freshFlatData);
            console.log('Is Array:', Array.isArray(freshFlatData));
            console.log('Full response:', freshFlatData);
            if (Array.isArray(freshFlatData) && freshFlatData.length > 0) {
                console.log('First item:', freshFlatData[0]);
            }
            console.log('==============================');

            if (freshFlatData && freshFlatData.length > 0) {
                console.log('[BuildingDetail] Setting editingFlat to:', freshFlatData[0]);
                setEditingFlat(freshFlatData[0]); // Get first result
                setIsEditModalOpen(true);
            } else if (freshFlatData && typeof freshFlatData === 'object' && !Array.isArray(freshFlatData)) {
                // Handle case where API returns single object instead of array
                console.log('[BuildingDetail] Setting editingFlat to single object:', freshFlatData);
                setEditingFlat(freshFlatData);
                setIsEditModalOpen(true);
            } else {
                console.error('[BuildingDetail] No flat data returned');
                alert('Failed to load flat data. Check console for details.');
            }
        } catch (err) {
            console.error('[BuildingDetail] Error loading flat:', err);
            alert('Error loading flat: ' + err.message);
        } finally {
            setEditLoadingFlat(false);
        }
    };

    const handleDeleteFlat = (flatId) => {
        if (confirm('Are you sure you want to delete this flat?')) {
            console.log('Delete flat:', flatId);
            // TODO: call delete API
        }
    };

    const handleAddFlat = () => {
        setIsModalOpen(true);
    };

    const handleImageError = () => {
        console.error('[BuildingDetail] Failed to load cover image:', localBuilding.coverImg);
        setImageLoadError(true);
    };

    // ===== RENDER =====
    if (!building || !localBuilding) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '12px', color: '#64748b' }}>
                <i className="fa-solid fa-building" style={{ fontSize: '32px', opacity: 0.3 }}></i>
                <p style={{ margin: 0 }}>{t('loading_building_details')}</p>
            </div>
        );
    }

    const raw = localBuilding.raw || {};

    const tabs = [
        { key: 'details', label: t('details') || 'Details', icon: 'fa-solid fa-circle-info' },
        { key: 'flats', label: t('flats') || 'Flats', icon: 'fa-solid fa-building' },
        { key: 'images', label: t('images') || 'Images', icon: 'fa-solid fa-images' },
    ];

    return (
        <div className="building-detail-container">

            {/* ── Hero Banner ── */}
            <div className="building-header-banner" style={{ position: 'relative', overflow: 'hidden', minHeight: '300px', backgroundColor: '#f1f5f9' }}>
                {localBuilding.coverImg && !imageLoadError ? (
                    <>
                        <div
                            key={`banner-${localBuilding.id}-${localBuilding.coverImg}`}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage: `url(${localBuilding.coverImg})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: 'brightness(0.35)',
                                zIndex: 0,
                                backgroundRepeat: 'no-repeat',
                            }}
                        />
                        <img
                            src={localBuilding.coverImg}
                            alt="banner"
                            style={{ display: 'none' }}
                            onLoad={() => console.log('[BuildingDetail] Cover image loaded successfully')}
                            onError={(e) => {
                                console.error('[BuildingDetail] Cover image failed to load:', localBuilding.coverImg);
                                handleImageError();
                            }}
                        />
                    </>
                ) : (
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', zIndex: 0 }} />
                )}
                <div style={{ position: 'relative', zIndex: 1, padding: '40px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span className={`badge ${localBuilding.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {localBuilding.isActive ? t('operational') || 'Active' : t('inactive') || 'Inactive'}
                        </span>
                        {raw.isExclusive && (
                            <span className="badge" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                                <i className="fa-solid fa-star" style={{ marginInlineEnd: '4px' }}></i>
                                {t('exclusive') || 'Exclusive'}
                            </span>
                        )}
                        {raw.stopBook && (
                            <span className="badge badge-danger">
                                {t('booking_stopped') || 'Booking Stopped'}
                            </span>
                        )}
                    </div>

                    <h1 style={{ margin: '0 0 6px', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                        {lang === 'ar' ? (localBuilding.nameAr || localBuilding.nameEn) : (localBuilding.nameEn || localBuilding.nameAr)}
                    </h1>

                    <p style={{ margin: '0 0 16px', opacity: 0.9, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                        <i className="fa-solid fa-location-dot" style={{ marginInlineEnd: '6px' }}></i>
                        {localBuilding.address}
                        {raw.location && ` — ${raw.location}`}
                    </p>

                    <div className="meta-stats-row" style={{ color: '#fff' }}>
                        <span className="meta-stat-item"><i className="fa-solid fa-layer-group" style={{ marginInlineEnd: '6px' }}></i><strong>{localBuilding.floors}</strong> {t('total_floors') || 'Floors'}</span>
                        <span className="meta-stat-item"><i className="fa-solid fa-door-closed" style={{ marginInlineEnd: '6px' }}></i><strong>{localBuilding.flats}</strong> {t('total_flats') || 'Flats'}</span>
                        {raw.minimumRent && <span className="meta-stat-item"><i className="fa-solid fa-money-bill" style={{ marginInlineEnd: '6px' }}></i>OMR {raw.minimumRent} – {raw.maxRent}</span>}
                        {raw.minDays && <span className="meta-stat-item"><i className="fa-solid fa-calendar-days" style={{ marginInlineEnd: '6px' }}></i>{t('min_days') || 'Min'} {raw.minDays} {t('days') || 'days'}</span>}
                    </div>

                    {localBuilding.services?.length > 0 && (
                        <div className="services-tags-wrapper" style={{ marginTop: '16px' }}>
                            {localBuilding.services.map((service, index) => (
                                <span key={`service-${index}-${service}`} className="badge badge-info" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <i className="fa-solid fa-check" style={{ marginInlineEnd: '6px' }}></i>
                                    {t(`service_${service.toLowerCase()}`) || service}
                                </span>
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                        {/* ✅ Updated button to call new handler */}
                        <button
                            className="btn btn-secondary"
                            onClick={handleEditBuilding}
                            style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '8px 16px' }}
                        >
                            <i className="fa-solid fa-pen" style={{ marginInlineEnd: '6px' }}></i>
                            {t('edit_building') || 'Edit Building'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div style={{ display: 'flex', gap: '4px', margin: '24px 0 20px', borderBottom: '2px solid #e2e8f0' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: '10px 18px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: activeTab === tab.key ? '600' : '400',
                            color: activeTab === tab.key ? '#6366f1' : '#64748b',
                            borderBottom: activeTab === tab.key ? '2px solid #6366f1' : '2px solid transparent',
                            marginBottom: '-2px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'color 0.2s',
                        }}
                    >
                        <i className={tab.icon}></i>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Tab: Details ── */}
            {activeTab === 'details' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                    <SectionCard title={t('location') || 'Location'} icon="fa-solid fa-map-pin">
                        <DetailRow icon="fa-solid fa-map" label={t('governorate') || 'Governorate'} value={localBuilding.governorate} />
                        <DetailRow icon="fa-solid fa-location-dot" label={t('wilayat') || 'Wilayat'} value={localBuilding.wilayat} />
                        <DetailRow icon="fa-solid fa-road" label={t('address') || 'Address'} value={raw.location} />
                        <DetailRow icon="fa-solid fa-near-me" label={t('near_to') || 'Near To'} value={raw.nearTo} />
                        {raw.lat && raw.lng && (
                            <div style={{ padding: '12px 0' }}>
                                <a href={`https://maps.google.com/?q=${raw.lat},${raw.lng}`} target="_blank" rel="noreferrer"
                                   style={{ color: '#6366f1', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <i className="fa-solid fa-map-location-dot"></i>
                                    {t('view_on_map') || 'View on Google Maps'}
                                </a>
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard title={t('pricing') || 'Pricing'} icon="fa-solid fa-money-bill-wave">
                        <DetailRow icon="fa-solid fa-arrow-down" label={t('min_rent') || 'Min Rent'} value={raw.minimumRent ? `OMR ${raw.minimumRent}` : null} />
                        <DetailRow icon="fa-solid fa-arrow-up" label={t('max_rent') || 'Max Rent'} value={raw.maxRent ? `OMR ${raw.maxRent}` : null} />
                        <DetailRow icon="fa-solid fa-calendar-minus" label={t('min_days') || 'Minimum Days'} value={raw.minDays} />
                        <DetailRow icon="fa-solid fa-shield-halved" label={t('accept_deposit') || 'Accepts Deposit'} value={raw.acceptDownPay ? (t('yes') || 'Yes') : (t('no') || 'No')} />
                        <DetailRow icon="fa-solid fa-credit-card" label={t('online_pay') || 'Online Payment'} value={raw.onlinePay ? (t('yes') || 'Yes') : (t('no') || 'No')} />
                    </SectionCard>

                    <SectionCard title={t('check_in_out') || 'Check-in / Check-out'} icon="fa-solid fa-clock">
                        <DetailRow icon="fa-solid fa-right-to-bracket" label={t('check_in') || 'Check-in'} value={raw.check_In} />
                        <DetailRow icon="fa-solid fa-right-from-bracket" label={t('check_out') || 'Check-out'} value={raw.check_Out} />
                        <DetailRow icon="fa-solid fa-ban" label={t('booking_stopped') || 'Booking Stopped'} value={raw.stopBook ? (t('yes') || 'Yes') : (t('no') || 'No')} />
                    </SectionCard>

                    <SectionCard title={t('contact') || 'Contact'} icon="fa-solid fa-phone">
                        <DetailRow icon="fa-solid fa-phone" label={t('management_phone') || 'Management Phone'} value={raw.managmentPhone} />
                        <DetailRow icon="fa-solid fa-mobile" label={t('worker_phone') || 'Worker Phone'} value={raw.workerPhone} />
                        <DetailRow icon="fa-solid fa-hashtag" label={t('building_number') || 'Building No.'} value={raw.buldinNumber} />
                        <DetailRow icon="fa-solid fa-calendar-plus" label={t('year_built') || 'Year Built'} value={raw.yearBulit} />
                    </SectionCard>

                    <SectionCard title={t('description') || 'Description'} icon="fa-solid fa-file-lines">
                        {(raw.buldingDescrptionEn || raw.buldingDescrptionAr) && (
                            <div style={{ padding: '12px 0', fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                                {lang === 'ar' ? (raw.buldingDescrptionAr || raw.buldingDescrptionEn) : (raw.buldingDescrptionEn || raw.buldingDescrptionAr)}
                            </div>
                        )}
                        {(raw.additional_detailsEn || raw.additional_detailsAr) && (
                            <>
                                <div style={{ fontSize: '12px', color: '#94a3b8', margin: '8px 0 4px' }}>{t('additional_details') || 'Additional Details'}</div>
                                <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                                    {lang === 'ar' ? (raw.additional_detailsAr || raw.additional_detailsEn) : (raw.additional_detailsEn || raw.additional_detailsAr)}
                                </div>
                            </>
                        )}
                    </SectionCard>

                    <SectionCard title={t('policies') || 'Policies'} icon="fa-solid fa-scroll">
                        {(raw.buildingPolicyEn || raw.buildingPolicyAr) && (
                            <>
                                <div style={{ fontSize: '12px', color: '#94a3b8', padding: '12px 0 4px' }}>{t('building_policy') || 'Building Policy'}</div>
                                <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                                    {lang === 'ar' ? (raw.buildingPolicyAr || raw.buildingPolicyEn) : (raw.buildingPolicyEn || raw.buildingPolicyAr)}
                                </div>
                            </>
                        )}
                        {(raw.cancelation_policyEn || raw.cancelation_policyAr) && (
                            <>
                                <div style={{ fontSize: '12px', color: '#94a3b8', padding: '12px 0 4px' }}>{t('cancellation_policy') || 'Cancellation Policy'}</div>
                                <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                                    {lang === 'ar' ? (raw.cancelation_policyAr || raw.cancelation_policyEn) : (raw.cancelation_policyEn || raw.cancelation_policyAr)}
                                </div>
                            </>
                        )}
                    </SectionCard>
                </div>
            )}

            {/* ── Tab: Flats ── */}
            {activeTab === 'flats' && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                            {flats.length > 0 ? `${flats.length} ${t('flats') || 'flats'}` : ''}
                        </p>
                        <button
                            onClick={handleAddFlat}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '13px',
                                fontWeight: 500,
                                color: '#fff',
                                background: '#6366f1',
                                border: '0.5px solid #4f46e5',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                transition: 'background 0.12s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                            onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
                        >
                            <i className="ti ti-plus" style={{ fontSize: '15px' }}></i>
                            {t('add_flat') || 'Add Flat'}
                        </button>
                    </div>

                    {loadingFlats ? (
                        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-tertiary)' }}>
                            <i className="ti ti-loader-2" style={{ fontSize: '28px', display: 'block', marginBottom: '10px', opacity: 0.4, animation: 'spin 1s linear infinite' }}></i>
                            <p style={{ margin: 0, fontSize: '14px' }}>{t('loading') || 'Loading flats…'}</p>
                        </div>
                    ) : flats.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-tertiary)' }}>
                            <i className="ti ti-building" style={{ fontSize: '28px', display: 'block', marginBottom: '10px', opacity: 0.4 }}></i>
                            <p style={{ margin: 0, fontSize: '14px' }}>{t('no_flats') || 'No flats found'}</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', padding: '4px 0' }}>
                            {flats.map((flat, index) => {
                                const name = flat.nameEn || flat.nameAr || `Flat ${index + 1}`;
                                const desc = flat.descrptionEn || flat.descrptionAr || '';
                                const available = flat.status === 'available';

                                const chips = [
                                    flat.bedsNumber && { icon: 'ti-bed', label: `${flat.bedsNumber} ${Number(flat.bedsNumber) > 1 ? t('beds') || 'beds' : t('bed') || 'bed'}` },
                                    flat.bathroomsNumber && { icon: 'ti-bath', label: `${flat.bathroomsNumber} ${t('bath') || 'bath'}` },
                                    flat.balconiesNumber && { icon: 'ti-building', label: `${flat.balconiesNumber} ${t('balcony') || 'balcony'}` },
                                    flat.visitors_count && { icon: 'ti-users', label: `${t('up_to') || 'Up to'} ${flat.visitors_count}` },
                                    flat.flatFloor && { icon: 'ti-layers', label: `${t('floor') || 'Floor'} ${flat.flatFloor}` },
                                    flat.flatNumber && { icon: 'ti-hash', label: `${t('flat_number') || 'No.'} ${flat.flatNumber}` },
                                ].filter(Boolean);

                                return (
                                    <div
                                        key={`flat-${flat.id ?? index}`}
                                        style={{
                                            background: '#fff',
                                            border: '0.5px solid #e2e8f0',
                                            borderRadius: '14px',
                                            overflow: 'hidden',
                                            transition: 'box-shadow 0.15s, border-color 0.15s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = '#c7d2fe';
                                            e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(99,102,241,0.07)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {/* Cover image */}
                                        <div style={{ position: 'relative' }}>
                                            {flat.coverimg ? (
                                                <img
                                                    key={`flat-img-${flat.id}-${flat.coverimg}`}
                                                    src={flat.coverimg}
                                                    alt={name}
                                                    loading="lazy"
                                                    style={{ width: '100%', height: '172px', objectFit: 'cover', display: 'block' }}
                                                    onError={(e) => {
                                                        console.error('Failed to load flat image:', flat.coverimg);
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div style={{ width: '100%', height: '172px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                                    <i className="ti ti-photo" style={{ fontSize: '36px' }}></i>
                                                </div>
                                            )}
                                            {flat.status && (
                                                <span style={{
                                                    position: 'absolute', top: '10px', right: '10px',
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    background: available ? 'rgba(234,243,222,0.95)' : 'rgba(252,235,235,0.95)',
                                                    color: available ? '#3B6D11' : '#A32D2D',
                                                    fontSize: '11px', fontWeight: 600, padding: '4px 10px',
                                                    borderRadius: '20px', backdropFilter: 'blur(4px)',
                                                }}>
                                                    <i className={`ti ${available ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: '12px' }}></i>
                                                    {available ? (t('available') || 'Available') : (t('unavailable') || 'Unavailable')}
                                                </span>
                                            )}
                                        </div>

                                        {/* Body */}
                                        <div style={{ padding: '14px 16px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <p style={{ margin: '0 0 3px', fontWeight: 600, fontSize: '15px', color: '#1e293b' }}>{name}</p>

                                            {desc && (
                                                <p style={{
                                                    margin: '0 0 10px', fontSize: '13px', color: '#94a3b8',
                                                    lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                }} title={desc}>
                                                    {desc}
                                                </p>
                                            )}

                                            {/* Chips */}
                                            {chips.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                                                    {chips.map(({ icon, label }) => (
                                                        <span key={label} style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                            fontSize: '11px', color: '#64748b', background: '#f8fafc',
                                                            border: '0.5px solid #e2e8f0', borderRadius: '6px', padding: '3px 8px',
                                                        }}>
                                                            <i className={`ti ${icon}`} style={{ fontSize: '12px', color: '#a5b4c8' }}></i>
                                                            {label}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div style={{ flex: 1 }} />

                                            {/* Price row */}
                                            <div style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '10px 0', borderTop: '0.5px solid #f1f5f9', marginTop: '4px',
                                            }}>
                                                <div>
                                                    <span style={{ fontSize: '17px', fontWeight: 600, color: '#1e293b' }}>
                                                        OMR {Number(flat.price_per_night).toFixed(2)}
                                                    </span>
                                                    <span style={{ fontSize: '12px', color: '#94a3b8', marginInlineStart: '3px' }}>
                                                        / {t('night') || 'night'}
                                                    </span>
                                                    {flat.weekend_price_per_night && (
                                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                                            OMR {Number(flat.weekend_price_per_night).toFixed(2)} · {t('weekends') || 'weekends'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action buttons */}
                                            <div style={{
                                                display: 'flex', gap: '8px',
                                                padding: '10px 0 14px',
                                                borderTop: '0.5px solid #f1f5f9',
                                            }}>
                                                <button
                                                    onClick={() => handleEditFlat(flat)}
                                                    style={{
                                                        flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                        fontSize: '13px', fontWeight: 500, color: '#4f46e5',
                                                        background: '#eef2ff', border: '0.5px solid #c7d2fe',
                                                        borderRadius: '8px', padding: '7px 0', cursor: 'pointer',
                                                        transition: 'background 0.12s',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#e0e7ff'}
                                                    onMouseLeave={e => e.currentTarget.style.background = '#eef2ff'}
                                                >
                                                    <i className="ti ti-edit" style={{ fontSize: '14px' }}></i>
                                                    {t('edit') || 'Edit'}
                                                </button>

                                                {/*<button*/}
                                                {/*    onClick={() => handleDeleteFlat(flat.id)}*/}
                                                {/*    style={{*/}
                                                {/*        flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',*/}
                                                {/*        fontSize: '13px', fontWeight: 500, color: '#dc2626',*/}
                                                {/*        background: '#fef2f2', border: '0.5px solid #fecaca',*/}
                                                {/*        borderRadius: '8px', padding: '7px 0', cursor: 'pointer',*/}
                                                {/*        transition: 'background 0.12s',*/}
                                                {/*    }}*/}
                                                {/*    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}*/}
                                                {/*    onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}*/}
                                                {/*>*/}
                                                {/*    <i className="ti ti-trash" style={{ fontSize: '14px' }}></i>*/}
                                                {/*    {t('delete') || 'Delete'}*/}
                                                {/*</button>*/}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── Tab: Images ── */}
            {activeTab === 'images' && (
                <div>
                    {localBuilding.coverImg && !imageLoadError && (
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ color: '#64748b', fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {t('cover_image') || 'Cover Image'}
                            </h4>
                            <img
                                key={`cover-image-${localBuilding.coverImg}`}
                                src={localBuilding.coverImg}
                                alt={localBuilding.nameEn}
                                style={{ width: '100%', maxHeight: '360px', objectFit: 'cover', borderRadius: '12px' }}
                                onError={(e) => {
                                    console.error('Failed to load cover image:', localBuilding.coverImg);
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                    {localBuilding.images?.length > 0 && (
                        <div>
                            <h4 style={{ color: '#64748b', fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {t('gallery') || 'Gallery'} ({localBuilding.images.length})
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                {localBuilding.images.map((img, index) => (
                                    <img
                                        key={`img-${img.id}-${index}-${img.url}`}
                                        src={img.url}
                                        alt=""
                                        style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        onError={(e) => {
                                            console.error('Failed to load gallery image:', img.url);
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {!localBuilding.coverImg && (!localBuilding.images || localBuilding.images.length === 0) && (
                        <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                            <i className="fa-solid fa-images" style={{ fontSize: '32px', opacity: 0.3, display: 'block', marginBottom: '12px' }}></i>
                            <p style={{ margin: 0 }}>{t('no_images') || 'No images uploaded'}</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Modals ── */}
            {/* ✅ EditBuildingModal with proper building object */}
            <EditBuildingModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                building={localBuilding}
                onUpdate={handleUpdate}
            />

            {isModalOpen && (
                <AddRoomModal
                    id={building.id}
                    onClose={() => setIsModalOpen(false)}
                    onSave={(newRoom) => {
                        const updated = {
                            ...localBuilding,
                            roomTypes: [...(localBuilding.roomTypes || []), newRoom],
                        };
                        setLocalBuilding(updated);
                        if (onUpdateBuilding) onUpdateBuilding(updated);
                        setIsModalOpen(false);
                        fetchFlats();
                    }}
                />
            )}

            {isEditModalOpen && editingFlat && (
                <EditRoomModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingFlat(null);
                    }}
                    flat={editingFlat}
                    onUpdate={(updatedFlat) => {
                        console.log('[BuildingDetail] Flat updated:', updatedFlat);
                        setIsEditModalOpen(false);
                        setEditingFlat(null);
                        fetchFlats();
                    }}
                />
            )}

            {editLoadingFlat && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(2px)',
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        padding: '40px',
                        textAlign: 'center',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '3px solid #e2e8f0',
                            borderTop: '3px solid #6366f1',
                            borderRadius: '50%',
                            margin: '0 auto 16px',
                            animation: 'spin 0.8s linear infinite',
                        }} />
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                            {t('loading') || 'Loading flat details...'}
                        </p>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}