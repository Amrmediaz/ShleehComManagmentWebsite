import React from 'react';
import SectionCard from '../BuildingDetails/SectionCard.jsx';
import DetailRow from '../BuildingDetails/DetailRow.jsx';
import RialSymbol from '../OmaniRial.jsx';
import { getGoogleMapsUrl } from '../../../core/utils/helper/Helpers.js';
import { localizeGovernorate, localizeWilayat } from '../../../core/utils/Constants/building_constants.js';
import '../../styles/Buildingdetails.css';

/**
 * ChaletDetailsTab
 * Full read-only breakdown of a chalet's characteristics, pricing, policies
 * and location — reuses the same SectionCard/DetailRow building blocks as
 * BuildingDetailsTab for visual consistency.
 */
const ChaletDetailsTab = ({ chalet, t, lang }) => {
    const renderPrice = (amount) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            {amount}
            <RialSymbol style={{ width: '0.85em', height: '0.85em' }} />
        </span>
    );

    // Characteristics are stored as raw option keys ("small_family",
    // "coastal", …) matching the chalet_<key> dictionary entries — some
    // fields (suitableFor/landscape/outdoorSpace) are multi-select and come
    // back as a ", "-joined string, others (safety/atmosphere/bestSeason)
    // are a single key.
    const translateOne = (key) => (key ? (t(`chalet_${key}`) || key) : key);
    const translateList = (value) => (
        value ? value.split(',').map((v) => v.trim()).filter(Boolean).map(translateOne).join(', ') : value
    );
    const translateType = (value) => (value ? (t(`chalet_type_${String(value).toLowerCase()}`) || value) : value);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

            <SectionCard title={t('characteristics') || 'Characteristics'} icon="fa-solid fa-list-check">
                <DetailRow icon="fa-solid fa-house-chimney" label={t('chalet_type') || 'Type'} value={translateType(chalet.chaletType)} />
                <DetailRow icon="fa-solid fa-users" label={t('capacity') || 'Capacity'} value={chalet.capacity} />
                <DetailRow icon="fa-solid fa-bed" label={t('beds') || 'Bedrooms'} value={chalet.bedrooms} />
                <DetailRow icon="fa-solid fa-bath" label={t('bath') || 'Bathrooms'} value={chalet.bathrooms} />
                <DetailRow icon="fa-solid fa-couch" label={t('living_rooms') || 'Living Rooms'} value={chalet.livingRooms} />
                <DetailRow icon="fa-solid fa-user-group" label={t('suitable_for') || 'Suitable For'} value={translateList(chalet.suitableFor)} />
            </SectionCard>

            <SectionCard title={t('atmosphere_section') || 'Setting & Atmosphere'} icon="fa-solid fa-mountain-sun">
                <DetailRow icon="fa-solid fa-mountain" label={t('landscape') || 'Landscape'} value={translateList(chalet.landscape)} />
                <DetailRow icon="fa-solid fa-tree" label={t('outdoor_space') || 'Outdoor Space'} value={translateList(chalet.outdoorSpace)} />
                <DetailRow icon="fa-solid fa-shield-halved" label={t('safety') || 'Safety'} value={translateOne(chalet.safety)} />
                <DetailRow icon="fa-solid fa-wind" label={t('atmosphere') || 'Atmosphere'} value={translateOne(chalet.atmosphere)} />
                <DetailRow icon="fa-solid fa-sun" label={t('best_season') || 'Best Season'} value={translateOne(chalet.bestSeason)} />
            </SectionCard>

            <SectionCard title={t('pricing') || 'Pricing'} icon="fa-solid fa-money-bill-wave">
                <DetailRow icon="fa-solid fa-calendar-day" label={t('full_day') || 'Full Day'} value={chalet.rentFullDay ? renderPrice(chalet.rentFullDay) : null} />
                <DetailRow icon="fa-solid fa-clock" label={t('half_day') || 'Half Day'} value={chalet.rentHalfDay ? renderPrice(chalet.rentHalfDay) : null} />
                <DetailRow icon="fa-solid fa-calendar-week" label={t('weekends') || 'Weekend'} value={chalet.rentWeekend ? renderPrice(chalet.rentWeekend) : null} />
                <DetailRow icon="fa-solid fa-tags" label={t('off_day_full') || 'Off-day Full'} value={chalet.offDayPriceFullDay ? renderPrice(chalet.offDayPriceFullDay) : null} />
                <DetailRow icon="fa-solid fa-tags" label={t('off_day_half') || 'Off-day Half'} value={chalet.offDayPriceHalfDay ? renderPrice(chalet.offDayPriceHalfDay) : null} />
                <DetailRow icon="fa-solid fa-calendar-minus" label={t('min_days') || 'Minimum Days'} value={chalet.minDays} />
                <DetailRow icon="fa-solid fa-shield-halved" label={t('insurance') || 'Insurance'} value={chalet.insuranceAmount ? renderPrice(chalet.insuranceAmount) : null} />
                <DetailRow icon="fa-solid fa-hand-holding-dollar" label={t('accept_deposit') || 'Accepts Deposit'} value={chalet.acceptDeposit ? (t('yes') || 'Yes') : (t('no') || 'No')} />
            </SectionCard>

            <SectionCard title={t('location') || 'Location'} icon="fa-solid fa-map-pin">
                <DetailRow icon="fa-solid fa-map" label={t('governorate') || 'Governorate'} value={localizeGovernorate(chalet.gouvernate, lang)} />
                <DetailRow icon="fa-solid fa-location-dot" label={t('wilayat') || 'Wilayat'} value={localizeWilayat(chalet.state, lang)} />
                {chalet.lat && chalet.lng && (
                    <div style={{ padding: '12px 0' }}>
                        <a
                            href={getGoogleMapsUrl(chalet.lat, chalet.lng)}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#6366f1', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                        >
                            <i className="fa-solid fa-map-location-dot" />
                            {t('view_on_map') || 'View on Google Maps'}
                        </a>
                    </div>
                )}
            </SectionCard>

            <SectionCard title={t('description') || 'Description'} icon="fa-solid fa-file-lines">
                {chalet.buildingDescription && (
                    <div style={{ padding: '12px 0', fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                        {chalet.buildingDescription}
                    </div>
                )}
                {chalet.note && (
                    <>
                        <div style={{ fontSize: '12px', color: '#94a3b8', margin: '8px 0 4px' }}>{t('policies') || 'Policies'}</div>
                        <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>{chalet.note}</div>
                    </>
                )}
            </SectionCard>

            <SectionCard title={t('rating') || 'Rating'} icon="fa-solid fa-star">
                <DetailRow icon="fa-solid fa-star" label={t('rate_average') || 'Average Rating'} value={chalet.rateAverage ? `${chalet.rateAverage} / 5` : null} />
                <DetailRow icon="fa-solid fa-ban" label={t('booking_stopped') || 'Booking Stopped'} value={chalet.stopBook ? (t('yes') || 'Yes') : (t('no') || 'No')} />
            </SectionCard>
        </div>
    );
};

export default ChaletDetailsTab;
