import React, { useState } from 'react';
import {
    IconWifi, IconPool, IconRipple, IconDeviceGamepad2, IconBallBasketball,
    IconSmokingNo, IconGrill, IconPaw,
} from '@tabler/icons-react';
import AmenityChip from '../AmenityChip.jsx';
import { localizeGovernorate, localizeWilayat } from '../../../core/utils/Constants/building_constants.js';
import '../../styles/Buildingdetails.css';

// Chalet services are a fixed, small vocabulary (see AddChaletModal's
// CHALET_SERVICES) — unlike buildings there's no reverse-lookup table, so
// this maps each raw key straight to an icon + warm-toned color.
const CHALET_AMENITY_UI = {
    wifi: { Icon: IconWifi, bg: '#fdf0e2', color: '#9c5209' },
    menPool: { Icon: IconPool, bg: '#e6f1fb', color: '#185FA5' },
    womenPool: { Icon: IconRipple, bg: '#e6f1fb', color: '#185FA5' },
    childGames: { Icon: IconDeviceGamepad2, bg: '#fdf0e2', color: '#9c5209' },
    games: { Icon: IconBallBasketball, bg: '#fdf0e2', color: '#9c5209' },
    noSmoking: { Icon: IconSmokingNo, bg: '#fef2f2', color: '#b91c1c' },
    grill: { Icon: IconGrill, bg: '#fdf0e2', color: '#9c5209' },
    animals: { Icon: IconPaw, bg: '#fdf0e2', color: '#9c5209' },
};

/**
 * ChaletHeader
 * Hero banner for the chalet detail view — mirrors BuildingHeader's
 * structure/classes with the warm chalet accent color.
 */
const ChaletHeader = ({ chalet, t, lang, onBack, onEditClick }) => {
    const [imageLoadError, setImageLoadError] = useState(false);
    const coverImg = chalet.coverImg;

    return (
        <div style={{ '--ph-accent': '#c2680f', '--ph-accent-light': '#fdf0e2' }}>
            <div className="ph-hero">
                {coverImg && !imageLoadError ? (
                    <div className="ph-hero__media">
                        <img
                            key={coverImg}
                            src={coverImg}
                            alt="chalet-cover"
                            loading="eager"
                            onError={() => setImageLoadError(true)}
                        />
                    </div>
                ) : (
                    <div className="ph-hero__media ph-hero__media--gradient" />
                )}
                <div className="ph-hero__scrim" />

                <div className="ph-hero__top">
                    <button onClick={onBack} className="ph-back-btn">
                        <i className="fa-solid fa-arrow-left" />
                        {t('back') || 'Back'}
                    </button>

                    <div className="ph-hero__badges">
                        <span className={`ph-badge ${chalet.isActive ? 'ph-badge--active' : 'ph-badge--inactive'}`}>
                            <i className={`fa-solid ${chalet.isActive ? 'fa-circle-check' : 'fa-circle-xmark'}`} />
                            {chalet.isActive ? t('operational') || 'Active' : t('inactive') || 'Inactive'}
                        </span>
                        {chalet.chaletType && (
                            <span className="ph-badge ph-badge--info">
                                <i className="fa-solid fa-house-chimney" />
                                {t(`chalet_type_${String(chalet.chaletType).toLowerCase()}`) || chalet.chaletType}
                            </span>
                        )}
                        {chalet.stopBook && (
                            <span className="ph-badge ph-badge--inactive">{t('booking_stopped') || 'Booking Stopped'}</span>
                        )}
                    </div>
                </div>

                <div className="ph-hero__bottom">
                    <h1 className="ph-title">{chalet.name}</h1>
                    <p className="ph-subtitle">
                        <i className="fa-solid fa-location-dot" />
                        {localizeWilayat(chalet.state, lang)}{chalet.gouvernate ? `, ${localizeGovernorate(chalet.gouvernate, lang)}` : ''}
                    </p>
                </div>
            </div>

            <div className="ph-panel">
                <div className="ph-stats">
                    {chalet.capacity && (
                        <div className="ph-stat">
                            <span className="ph-stat__icon"><i className="fa-solid fa-users" /></span>
                            <span className="ph-stat__text">
                                <span className="ph-stat__value">{chalet.capacity}</span>
                                <span className="ph-stat__label">{t('guests') || 'Guests'}</span>
                            </span>
                        </div>
                    )}
                    {chalet.bedrooms && (
                        <div className="ph-stat">
                            <span className="ph-stat__icon"><i className="fa-solid fa-bed" /></span>
                            <span className="ph-stat__text">
                                <span className="ph-stat__value">{chalet.bedrooms}</span>
                                <span className="ph-stat__label">{t('beds') || 'Beds'}</span>
                            </span>
                        </div>
                    )}
                    {chalet.bathrooms && (
                        <div className="ph-stat">
                            <span className="ph-stat__icon"><i className="fa-solid fa-bath" /></span>
                            <span className="ph-stat__text">
                                <span className="ph-stat__value">{chalet.bathrooms}</span>
                                <span className="ph-stat__label">{t('bath') || 'Bath'}</span>
                            </span>
                        </div>
                    )}
                    {chalet.rentFullDay && (
                        <div className="ph-stat">
                            <span className="ph-stat__icon"><i className="fa-solid fa-money-bill" /></span>
                            <span className="ph-stat__text">
                                <span className="ph-stat__value">{t('OMR')} {chalet.rentFullDay}</span>
                                <span className="ph-stat__label">{t('full_day') || 'per day'}</span>
                            </span>
                        </div>
                    )}
                    {!!chalet.minDays && (
                        <div className="ph-stat">
                            <span className="ph-stat__icon"><i className="fa-solid fa-calendar-days" /></span>
                            <span className="ph-stat__text">
                                <span className="ph-stat__value">{chalet.minDays} {t('days') || 'days'}</span>
                                <span className="ph-stat__label">{t('min_days') || 'Min stay'}</span>
                            </span>
                        </div>
                    )}
                </div>

                {chalet.services?.length > 0 && (
                    <>
                        <div className="ph-divider" />
                        <div className="ph-services">
                            {chalet.services.map((service, index) => {
                                const meta = CHALET_AMENITY_UI[service];
                                return (
                                    <AmenityChip
                                        key={`chalet-service-${index}-${service}`}
                                        Icon={meta?.Icon}
                                        bg={meta?.bg || 'var(--ph-accent-light)'}
                                        color={meta?.color || 'var(--ph-accent)'}
                                        label={t(`chalet_service_${service}`) || service}
                                    />
                                );
                            })}
                        </div>
                    </>
                )}

                <div className="ph-actions">
                    <button className="ph-edit-btn" onClick={onEditClick}>
                        <i className="fa-solid fa-pen" />
                        {t('edit') || 'Edit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChaletHeader;
