import React, { useRef, useEffect, useState } from 'react';
import { WILAYATS_BILINGUAL } from '../../../core/utils/Constants/building_constants.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/AddBuildingModal.css';

/**
 * Enhanced LocationSection Component with Bilingual Support
 * - Select governorate & wilayat (Arabic & English)
 * - Click on map to set location
 * - Manual lat/lng input
 * - Address details
 * - Interactive map with marker
 * - Get current location (geolocation) as floating icon on map
 * - Switchable map layers: street / satellite / hybrid / terrain
 */

// ── Map layer definitions ──
// street:    standard OpenStreetMap tiles (original behavior)
// satellite: Esri World Imagery (pure aerial photography, no labels)
// hybrid:    Esri World Imagery + a labels/boundaries overlay on top
// terrain:   OpenTopoMap (elevation/contour style)
const MAP_LAYERS = {
    street: {
        labelAr: 'خريطة',
        labelEn: 'Street',
        icon: '🗺️',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
    },
    satellite: {
        labelAr: 'قمر صناعي',
        labelEn: 'Satellite',
        icon: '🛰️',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics',
        maxZoom: 19,
    },
    hybrid: {
        labelAr: 'مختلط',
        labelEn: 'Hybrid',
        icon: '🌍',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles © Esri',
        maxZoom: 19,
        // Overlay adds place names/roads/boundaries on top of the imagery.
        overlayUrl:
            'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    },
    terrain: {
        labelAr: 'تضاريس',
        labelEn: 'Terrain',
        icon: '⛰️',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap',
        maxZoom: 17,
    },
};

export default function LocationSection({
                                            gouvernate,
                                            setGovernorate,
                                            state,
                                            setWilayat,
                                            location,
                                            setLocation,
                                            lat,
                                            setLat,
                                            lng,
                                            setLng,
                                            nearTo,
                                            setNearTo,
                                            t,
                                            isRTL,
                                            lang,
                                        }) {
    const mapRef = useRef(null);
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);
    const markerRef = useRef(null);
    const baseLayerRef = useRef(null);
    const overlayLayerRef = useRef(null);
    const [showMap, setShowMap] = useState(false);
    const [mapError, setMapError] = useState('');
    const [geoLoading, setGeoLoading] = useState(false);
    const [mapLayerType, setMapLayerType] = useState('street');

    /**
     * Swap the active base layer (and overlay, for hybrid) on the map.
     * Safe to call any time the map instance already exists.
     */
    const applyMapLayer = (type) => {
        if (!mapInstance.current) return;
        const config = MAP_LAYERS[type] || MAP_LAYERS.street;

        if (baseLayerRef.current) {
            mapInstance.current.removeLayer(baseLayerRef.current);
            baseLayerRef.current = null;
        }
        if (overlayLayerRef.current) {
            mapInstance.current.removeLayer(overlayLayerRef.current);
            overlayLayerRef.current = null;
        }

        baseLayerRef.current = L.tileLayer(config.url, {
            attribution: config.attribution,
            maxZoom: config.maxZoom,
        }).addTo(mapInstance.current);

        if (config.overlayUrl) {
            overlayLayerRef.current = L.tileLayer(config.overlayUrl, {
                maxZoom: config.maxZoom,
            }).addTo(mapInstance.current);
        }
    };

    const handleLayerChange = (type) => {
        setMapLayerType(type);
        applyMapLayer(type);
    };

    // Initialize map only when showMap is true
    useEffect(() => {
        if (showMap && mapRef.current && !mapInstance.current) {
            try {
                // Initialize Leaflet map centered on Salalah (default)
                const defaultLat = lat ? parseFloat(lat) : 17.0151;
                const defaultLng = lng ? parseFloat(lng) : 54.0924;

                mapInstance.current = L.map(mapRef.current).setView(
                    [defaultLat, defaultLng],
                    10
                );

                // Add the currently-selected base layer (defaults to street).
                applyMapLayer(mapLayerType);

                // Add marker if coordinates exist
                if (lat && lng) {
                    addMarker(parseFloat(lat), parseFloat(lng));
                }

                // Handle map click to set coordinates
                mapInstance.current.on('click', (e) => {
                    const { lat: clickLat, lng: clickLng } = e.latlng;
                    setLat(clickLat.toFixed(4));
                    setLng(clickLng.toFixed(4));
                    addMarker(clickLat, clickLng);
                });

                setMapError('');
            } catch (error) {
                console.error('[LocationSection] Map initialization error:', error);
                setMapError(isRTL ? 'خطأ في تحميل الخريطة' : 'Error loading map');
            }
        }

        return () => {
            // Cleanup when map is hidden
            if (!showMap && mapInstance.current) {
                mapInstance.current.off();
                mapInstance.current.remove();
                mapInstance.current = null;
                baseLayerRef.current = null;
                overlayLayerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showMap]);

    // Update marker when coordinates change
    useEffect(() => {
        if (mapInstance.current && lat && lng) {
            const latNum = parseFloat(lat);
            const lngNum = parseFloat(lng);

            if (!isNaN(latNum) && !isNaN(lngNum)) {
                // Pan to new coordinates
                mapInstance.current.setView([latNum, lngNum], 10);
                addMarker(latNum, lngNum);
            }
        }
    }, [lat, lng]);

    /**
     * Add or update marker on map
     */
    const addMarker = (markerLat, markerLng) => {
        if (!mapInstance.current) return;

        // Remove existing marker
        if (markerRef.current) {
            mapInstance.current.removeLayer(markerRef.current);
        }

        // Add new marker
        markerRef.current = L.marker([markerLat, markerLng], {
            icon: L.icon({
                iconUrl:
                    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl:
                    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
            }),
        })
            .addTo(mapInstance.current)
            .bindPopup(
                `<div style="text-align: ${isRTL ? 'right' : 'left'}">
          <strong>${isRTL ? 'الموقع' : 'Location'}</strong><br>
          Lat: ${markerLat.toFixed(4)}<br>
          Lng: ${markerLng.toFixed(4)}
        </div>`
            );
    };

    /**
     * Handle coordinate input change
     */
    const handleCoordinateChange = (type, value) => {
        const numValue = parseFloat(value);

        if (type === 'lat') {
            if (value === '' || (!isNaN(numValue) && numValue >= -90 && numValue <= 90)) {
                setLat(value);
            }
        } else if (type === 'lng') {
            if (value === '' || (!isNaN(numValue) && numValue >= -180 && numValue <= 180)) {
                setLng(value);
            }
        }
    };

    /**
     * Center map on current coordinates
     */
    const centerMapOnCoordinates = () => {
        if (lat && lng && mapInstance.current) {
            const latNum = parseFloat(lat);
            const lngNum = parseFloat(lng);

            if (!isNaN(latNum) && !isNaN(lngNum)) {
                mapInstance.current.setView([latNum, lngNum], 12);
            }
        }
    };

    /**
     * Use Salalah as default location
     */
    const setDefaultLocation = () => {
        setLat('17.0151');
        setLng('54.0924');
        if (mapInstance.current) {
            mapInstance.current.setView([17.0151, 54.0924], 10);
            addMarker(17.0151, 54.0924);
        }
    };

    /**
     * Get current location via geolocation
     */
    const getCurrentLocation = () => {
        setGeoLoading(true);

        if (!navigator.geolocation) {
            alert(isRTL ? 'الجيولوكيشن غير مدعوم' : 'Geolocation not supported');
            setGeoLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLat(latitude.toFixed(4));
                setLng(longitude.toFixed(4));
                setGeoLoading(false);

                // Center map if it's open
                if (mapInstance.current) {
                    mapInstance.current.setView([latitude, longitude], 13);
                    addMarker(latitude, longitude);
                }
            },
            (error) => {
                setGeoLoading(false);
                let msg = isRTL ? 'لم نتمكن من الحصول على الموقع' : 'Could not get location';

                if (error.code === error.PERMISSION_DENIED) {
                    msg = isRTL ? 'السماح بالموقع مرفوض' : 'Location permission denied';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    msg = isRTL ? 'الموقع غير متاح' : 'Location unavailable';
                } else if (error.code === error.TIMEOUT) {
                    msg = isRTL ? 'انتهت مهلة زمنية' : 'Location request timeout';
                }

                alert(msg);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    return (
        <section>
            <div className="modal-section-title">{t('location')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Governorate & Wilayat */}
                <div className="modal-grid-3">
                    <div>
                        <label className="modal-label">
                            {t('governorate')} <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                            className="modal-select"
                            value={gouvernate}
                            onChange={(e) => {
                                setGovernorate(e.target.value);
                                setWilayat('');
                            }}
                        >
                            <option value="">{isRTL ? 'اختر محافظة...' : 'Select governorate…'}</option>
                            {Object.keys(WILAYATS_BILINGUAL).map((govKey) => (
                                <option key={govKey} value={govKey}>
                                    {isRTL
                                        ? WILAYATS_BILINGUAL[govKey].ar
                                        : WILAYATS_BILINGUAL[govKey].en
                                    }
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="modal-label">
                            {t('wilayat')} <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                            className="modal-select"
                            style={{ backgroundColor: !gouvernate ? '#f9fafb' : '#fff' }}
                            value={state}
                            onChange={(e) => setWilayat(e.target.value)}
                            disabled={!gouvernate}
                        >
                            <option value="">
                                {gouvernate
                                    ? isRTL
                                        ? 'اختر ولاية...'
                                        : 'Select wilayat…'
                                    : isRTL
                                        ? 'اختر المحافظة أولاً'
                                        : 'Select governorate first'}
                            </option>
                            {gouvernate &&
                                WILAYATS_BILINGUAL[gouvernate] &&
                                WILAYATS_BILINGUAL[gouvernate].wilayats.map((wilayat, idx) => (
                                    <option key={idx} value={wilayat.en}>
                                        {isRTL ? wilayat.ar : wilayat.en}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>

                {/* Detailed Address */}
                <div>
                    <label className="modal-label">
                        {isRTL ? 'العنوان التفصيلي' : 'Detailed Address'}
                        <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                        className="modal-input"
                        type="text"
                        placeholder={isRTL ? 'الشارع، المبنى، الحي...' : 'Street, building, area…'}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>

                {/* Near To */}
                <div>
                    <label className="modal-label">
                        {isRTL ? 'قريب من' : 'Near To'}
                    </label>
                    <input
                        className="modal-input"
                        type="text"
                        placeholder={isRTL ? 'قريب من مول، مستشفى...' : 'Near mall, hospital…'}
                        value={nearTo}
                        onChange={(e) => setNearTo(e.target.value)}
                    />
                </div>

                {/* Map Toggle */}
                <div>
                    <button
                        type="button"
                        onClick={() => setShowMap(!showMap)}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            background: showMap ? '#f0f6ff' : '#fff',
                            color: '#185FA5',
                            cursor: 'pointer',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                        }}
                    >
                        {showMap
                            ? isRTL
                                ? '✕ إخفاء الخريطة'
                                : '✕ Hide Map'
                            : isRTL
                                ? '🗺 عرض الخريطة التفاعلية'
                                : '🗺 Show Interactive Map'}
                    </button>
                </div>

                {/* Map Container with Floating Buttons */}
                {showMap && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {mapError && (
                            <div
                                style={{
                                    padding: '10px 12px',
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                            >
                                {mapError}
                            </div>
                        )}

                        {/* Map with Floating Buttons */}
                        <div
                            ref={mapContainer}
                            style={{
                                position: 'relative',
                                height: '300px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Leaflet Map */}
                            <div
                                ref={mapRef}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                }}
                            />

                            {/* Layer Switcher — opposite corner from the geolocation button */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: isRTL ? 'auto' : '10px',
                                    left: isRTL ? '10px' : 'auto',
                                    zIndex: 1000,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px',
                                    background: '#fff',
                                    padding: '4px',
                                    borderRadius: '10px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    border: '1px solid #e5e7eb',
                                }}
                            >
                                {Object.entries(MAP_LAYERS).map(([key, layer]) => {
                                    const active = mapLayerType === key;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => handleLayerChange(key)}
                                            title={isRTL ? layer.labelAr : layer.labelEn}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 8px',
                                                border: 'none',
                                                borderRadius: '7px',
                                                background: active ? '#185FA5' : 'transparent',
                                                color: active ? '#fff' : '#374151',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: active ? 600 : 500,
                                                whiteSpace: 'nowrap',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            <span style={{ fontSize: '14px' }}>{layer.icon}</span>
                                            <span>{isRTL ? layer.labelAr : layer.labelEn}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Floating Location Button on Map */}
                            <button
                                type="button"
                                onClick={getCurrentLocation}
                                disabled={geoLoading}
                                style={{
                                    position: 'absolute',
                                    bottom: '12px',
                                    right: isRTL ? '12px' : 'auto',
                                    left: isRTL ? 'auto' : '12px',
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    background: geoLoading ? '#e0e7ff' : '#fff',
                                    border: '1px solid #d1d5db',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    cursor: geoLoading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    opacity: geoLoading ? 0.7 : 1,
                                    transition: 'all 0.2s',
                                    zIndex: 1000,
                                }}
                                title={isRTL ? 'استخدم موقعي الحالي' : 'Use my current location'}
                            >
                                {geoLoading ? (
                                    <span style={{
                                        animation: 'spin 1s linear infinite',
                                        display: 'inline-block'
                                    }}>
                                        🔄
                                    </span>
                                ) : (
                                    '📍'
                                )}
                            </button>
                        </div>

                        <div
                            style={{
                                fontSize: '11px',
                                color: '#6b7280',
                                padding: '8px',
                                background: '#f9fafb',
                                borderRadius: '6px',
                                textAlign: isRTL ? 'right' : 'left',
                            }}
                        >
                            {isRTL
                                ? '💡 انقر على الخريطة لتعيين الموقع أو اضغط أيقونة الموقع — يمكنك أيضاً تغيير نوع الخريطة من الأعلى'
                                : '💡 Click on the map to set location or press the location icon — you can also switch the map type from the top control'}
                        </div>
                    </div>
                )}

                {/* Coordinates Input */}
                <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                    <div
                        style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '8px',
                            textAlign: isRTL ? 'right' : 'left',
                        }}
                    >
                        {isRTL ? 'إحداثيات الموقع' : 'Location Coordinates'}
                    </div>

                    <div className="modal-grid-4">
                        <div>
                            <label className="modal-label">{isRTL ? 'خط العرض' : 'Latitude'}</label>
                            <input
                                className="modal-input"
                                type="text"
                                style={{ direction: 'ltr' }}
                                placeholder="23.6100"
                                value={lat}
                                onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                            />
                            {lat && (
                                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                                    {parseFloat(lat) >= -90 && parseFloat(lat) <= 90
                                        ? '✓ Valid'
                                        : '✗ Invalid'}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="modal-label">{isRTL ? 'خط الطول' : 'Longitude'}</label>
                            <input
                                className="modal-input"
                                type="text"
                                style={{ direction: 'ltr' }}
                                placeholder="58.5400"
                                value={lng}
                                onChange={(e) => handleCoordinateChange('lng', e.target.value)}
                            />
                            {lng && (
                                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                                    {parseFloat(lng) >= -180 && parseFloat(lng) <= 180
                                        ? '✓ Valid'
                                        : '✗ Invalid'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        {showMap && (
                            <button
                                type="button"
                                onClick={centerMapOnCoordinates}
                                disabled={!lat || !lng}
                                style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    background: lat && lng ? '#fff' : '#f9fafb',
                                    color: lat && lng ? '#185FA5' : '#9ca3af',
                                    cursor: lat && lng ? 'pointer' : 'not-allowed',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                }}
                            >
                                {isRTL ? '📍 توسيط على الإحداثيات' : '📍 Center on Coordinates'}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={setDefaultLocation}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                background: '#fff',
                                color: '#185FA5',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 500,
                                transition: 'all 0.2s',
                            }}
                        >
                            {isRTL ? '📍 ظفار (الافتراضي)' : '📍 Salalah (Default)'}
                        </button>
                    </div>
                </div>

                {/* Info Box */}
                <div
                    style={{
                        padding: '10px 12px',
                        background: '#e6f1fb',
                        border: '1px solid #c7ddf5',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#0c447c',
                        textAlign: isRTL ? 'right' : 'left',
                    }}
                >
                    <strong>{isRTL ? 'ملاحظات:' : 'Notes:'}</strong>
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: isRTL ? '0' : '20px', paddingRight: isRTL ? '20px' : '0' }}>
                        <li>{isRTL ? 'انقر على الخريطة لتعيين الموقع تلقائياً' : 'Click on map to auto-set coordinates'}</li>
                        <li>{isRTL ? 'أو أدخل الإحداثيات يدوياً' : 'Or enter coordinates manually'}</li>
                        <li>{isRTL ? 'يمكنك التبديل بين خريطة الشوارع والقمر الصناعي والتضاريس' : 'You can switch between street, satellite, and terrain views'}</li>
                        <li>{isRTL ? 'نطاق خط العرض: -90 إلى 90' : 'Latitude range: -90 to 90'}</li>
                        <li>{isRTL ? 'نطاق خط الطول: -180 إلى 180' : 'Longitude range: -180 to 180'}</li>
                    </ul>
                </div>

                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </section>
    );
}