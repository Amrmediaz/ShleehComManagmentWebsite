import React, { useState } from 'react';
import { getAmenityMeta, localizeGovernorate, localizeWilayat } from '../../../core/utils/Constants/building_constants.js';
import AmenityChip from '../AmenityChip.jsx';
import '../../styles/Buildingdetails.css';

/**
 * BuildingHeader Component
 * Hero banner for a building's detail view: cover photo with a gradient
 * scrim (badges/title/address overlaid), followed by a light stats/amenities
 * panel — replaces the old fully-darkened photo + plain badge treatment.
 */
const BuildingHeader = ({ building, lang, t, onEditClick, onImageError }) => {
    const [imageLoadError, setImageLoadError] = useState(false);

    const raw = building.raw || {};
    const coverImg = building.coverImg;
    const isActive = building.isActive;
    const name = lang === 'ar' ? building.nameAr || building.nameEn : building.nameEn || building.nameAr;
    // building.address is a precomposed "wilayat, governorate" string in raw
    // English — rebuild it from the separate fields so it localizes properly.
    const address = [localizeWilayat(building.wilayat, lang), localizeGovernorate(building.governorate, lang)]
        .filter(Boolean)
        .join(', ') || building.address;

    const handleImageError = (e) => {
        setImageLoadError(true);
        if (onImageError) onImageError(e);
    };

    // Cache busting logic: Appends a timestamp to ensure fresh image retrieval
    const getCacheBustedUrl = (url) => {
        if (!url) return url;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}t=${Date.now()}`;
    };

    return (
        <div style={{ '--ph-accent': '#185FA5', '--ph-accent-light': '#e6f1fb' }}>
            <div className="ph-hero">
                {coverImg && !imageLoadError ? (
                    <div className="ph-hero__media">
                        <img
                            key={coverImg}
                            src={getCacheBustedUrl(coverImg)}
                            alt="building-cover"
                            loading="eager"
                            onError={handleImageError}
                        />
                    </div>
                ) : (
                    <div className="ph-hero__media ph-hero__media--gradient" />
                )}
                <div className="ph-hero__scrim" />

                <div className="ph-hero__top">
                    <div className="ph-hero__badges">
                        <span className={`ph-badge ${isActive ? 'ph-badge--active' : 'ph-badge--inactive'}`}>
                            <i className={`fa-solid ${isActive ? 'fa-circle-check' : 'fa-circle-xmark'}`} />
                            {isActive ? t('operational') || 'Active' : t('inactive') || 'Inactive'}
                        </span>

                        {raw.isExclusive && (
                            <span className="ph-badge ph-badge--info">
                                <i className="fa-solid fa-star" style={{ color: '#d97706' }} />
                                {t('exclusive') || 'Exclusive'}
                            </span>
                        )}

                        {raw.stopBook && (
                            <span className="ph-badge ph-badge--inactive">
                                {t('booking_stopped') || 'Booking Stopped'}
                            </span>
                        )}
                    </div>
                </div>

                <div className="ph-hero__bottom">
                    <h1 className="ph-title">{name}</h1>
                    <p className="ph-subtitle">
                        <i className="fa-solid fa-location-dot" />
                        {address}
                        {raw.location && ` — ${raw.location}`}
                    </p>
                </div>
            </div>

            <div className="ph-panel">
                {/* Stats */}
                <div className="ph-stats">
                    <div className="ph-stat">
                        <span className="ph-stat__icon"><i className="fa-solid fa-layer-group" /></span>
                        <span className="ph-stat__text">
                            <span className="ph-stat__value">{building.floors}</span>
                            <span className="ph-stat__label">{t('total_floors') || 'Floors'}</span>
                        </span>
                    </div>

                    <div className="ph-stat">
                        <span className="ph-stat__icon"><i className="fa-solid fa-door-closed" /></span>
                        <span className="ph-stat__text">
                            <span className="ph-stat__value">{building.flats}</span>
                            <span className="ph-stat__label">{t('total_flats') || 'Flats'}</span>
                        </span>
                    </div>

                    {raw.minimumRent && (
                        <div className="ph-stat">
                            <span className="ph-stat__icon"><i className="fa-solid fa-money-bill" /></span>
                            <span className="ph-stat__text">
                                <span className="ph-stat__value">{t('OMR')} {raw.minimumRent}–{raw.maxRent}</span>
                                <span className="ph-stat__label">{t('price_range') || 'Price range'}</span>
                            </span>
                        </div>
                    )}

                    {raw.minDays && (
                        <div className="ph-stat">
                            <span className="ph-stat__icon"><i className="fa-solid fa-calendar-days" /></span>
                            <span className="ph-stat__text">
                                <span className="ph-stat__value">{raw.minDays} {t('days') || 'days'}</span>
                                <span className="ph-stat__label">{t('min_days') || 'Min stay'}</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Services */}
                {building.services?.length > 0 && (
                    <>
                        <div className="ph-divider" />
                        <div className="ph-services">
                            {building.services.map((service, index) => {
                                const meta = getAmenityMeta(service);
                                return (
                                    <AmenityChip
                                        key={`service-${index}-${service}`}
                                        Icon={meta?.Icon}
                                        bg={meta?.bg || 'var(--ph-accent-light)'}
                                        color={meta?.color || 'var(--ph-accent)'}
                                        label={meta ? (t(`service_${meta.key}`) || service) : service}
                                    />
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Actions */}
                <div className="ph-actions">
                    <button className="ph-edit-btn" onClick={onEditClick}>
                        <i className="fa-solid fa-pen" />
                        {t('edit_building') || 'Edit Building'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BuildingHeader;
