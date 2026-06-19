import React, { useState } from 'react';
import '../../styles/Buildingdetails.css';

/**
 * BuildingHeader Component
 * Displays building hero banner with cover image, name, and key information
 */
const BuildingHeader = ({ building, lang, t, onEditClick, onImageError }) => {
    const [imageLoadError, setImageLoadError] = useState(false);

    const raw = building.raw || {};
    const coverImg = building.coverImg;
    const isActive = building.isActive;
    const name = lang === 'ar' ? building.nameAr || building.nameEn : building.nameEn || building.nameAr;
    const address = building.address;

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

    const imageSrc = coverImg ? getCacheBustedUrl(coverImg) : null;

    return (
        <div className="building-header">
            {/* Background Image or Gradient */}
            {coverImg && !imageLoadError ? (
                <div className="building-header__background">
                    <img
                        src={imageSrc}
                        alt="building-cover"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                        onError={handleImageError}
                    />
                </div>
            ) : (
                <div className="building-header__background building-header__gradient" />
            )}

            {/* Content */}
            <div className="building-header__content">
                {/* Badges */}
                <div className="building-header__badges">
                    <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`}>
                        {isActive ? t('operational') || 'Active' : t('inactive') || 'Inactive'}
                    </span>

                    {raw.isExclusive && (
                        <span className="badge badge-info">
                            <i className="fa-solid fa-star" style={{ marginInlineEnd: '4px' }} />
                            {t('exclusive') || 'Exclusive'}
                        </span>
                    )}

                    {raw.stopBook && <span className="badge badge-danger">{t('booking_stopped') || 'Booking Stopped'}</span>}
                </div>

                {/* Title */}
                <h1 className="building-header__title">{name}</h1>

                {/* Subtitle */}
                <p className="building-header__subtitle">
                    <i className="fa-solid fa-location-dot" style={{ marginInlineEnd: '6px' }} />
                    {address}
                    {raw.location && ` — ${raw.location}`}
                </p>

                {/* Meta Stats */}
                <div className="building-header__meta">
                    <span className="meta-stat-item">
                        <i className="fa-solid fa-layer-group" style={{ marginInlineEnd: '6px' }} />
                        <strong>{building.floors}</strong> {t('total_floors') || 'Floors'}
                    </span>

                    <span className="meta-stat-item">
                        <i className="fa-solid fa-door-closed" style={{ marginInlineEnd: '6px' }} />
                        <strong>{building.flats}</strong> {t('total_flats') || 'Flats'}
                    </span>

                    {raw.minimumRent && (
                        <span className="meta-stat-item">
                            <i className="fa-solid fa-money-bill" style={{ marginInlineEnd: '6px' }} />
                            OMR {raw.minimumRent} – {raw.maxRent}
                        </span>
                    )}

                    {raw.minDays && (
                        <span className="meta-stat-item">
                            <i className="fa-solid fa-calendar-days" style={{ marginInlineEnd: '6px' }} />
                            {t('min_days') || 'Min'} {raw.minDays} {t('days') || 'days'}
                        </span>
                    )}
                </div>

                {/* Services */}
                {building.services?.length > 0 && (
                    <div className="building-header__services">
                        {building.services.map((service, index) => (
                            <span key={`service-${index}-${service}`} className="badge badge-info">
                                <i className="fa-solid fa-check" style={{ marginInlineEnd: '6px' }} />
                                {t(`service_${service.toLowerCase()}`) || service}
                            </span>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="building-header__actions">
                    <button className="btn btn-secondary" onClick={onEditClick}>
                        <i className="fa-solid fa-pen" style={{ marginInlineEnd: '6px' }} />
                        {t('edit_building') || 'Edit Building'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BuildingHeader;