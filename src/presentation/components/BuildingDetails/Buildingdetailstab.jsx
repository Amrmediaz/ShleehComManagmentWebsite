import React from 'react';
import DetailRow from './DetailRow.jsx';
import SectionCard from './SectionCard.jsx';
import RialSymbol from '../OmaniRial.jsx';
import { getGoogleMapsUrl } from '../../../core/utils/helper/Helpers.js';
import '../../styles/Buildingdetails.css';

/**
 * BuildingDetailsTab Component
 * Displays detailed building information in organized sections
 *
 * @component
 * @param {Object} props
 * @param {Object} props.building - Building data
 * @param {string} props.lang - Current language (ar/en)
 * @param {Function} props.t - Translation function
 * @returns {React.ReactElement}
 */
const BuildingDetailsTab = ({ building, lang, t }) => {
    const raw = building.raw || {};

    const renderPrice = (amount) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            {amount}
            <RialSymbol style={{ width: '0.85em', height: '0.85em' }} />
        </span>
    );

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

            {/* Location Section */}
            <SectionCard title={t('location') || 'Location'} icon="fa-solid fa-map-pin">
                <DetailRow icon="fa-solid fa-map" label={t('governorate') || 'Governorate'} value={building.governorate} />
                <DetailRow icon="fa-solid fa-location-dot" label={t('wilayat') || 'Wilayat'} value={building.wilayat} />
                <DetailRow icon="fa-solid fa-road" label={t('address') || 'Address'} value={raw.location} />
                <DetailRow icon="fa-solid fa-near-me" label={t('near_to') || 'Near To'} value={raw.nearTo} />

                {raw.lat && raw.lng && (
                    <div style={{ padding: '12px 0' }}>
                        <a
                            href={getGoogleMapsUrl(raw.lat, raw.lng)}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                color: '#6366f1',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                textDecoration: 'none',
                            }}
                        >
                            <i className="fa-solid fa-map-location-dot" />
                            {t('view_on_map') || 'View on Google Maps'}
                        </a>
                    </div>
                )}
            </SectionCard>

            {/* Pricing Section */}
            <SectionCard title={t('pricing') || 'Pricing'} icon="fa-solid fa-money-bill-wave">
                <DetailRow icon="fa-solid fa-arrow-down" label={t('min_rent') || 'Min Rent'} value={raw.minimumRent ? renderPrice(raw.minimumRent) : null} />
                <DetailRow icon="fa-solid fa-arrow-up" label={t('max_rent') || 'Max Rent'} value={raw.maxRent ? renderPrice(raw.maxRent) : null} />
                <DetailRow icon="fa-solid fa-calendar-minus" label={t('min_days') || 'Minimum Days'} value={raw.minDays} />
                <DetailRow icon="fa-solid fa-shield-halved" label={t('accept_deposit') || 'Accepts Deposit'} value={raw.acceptDownPay ? t('yes') || 'Yes' : t('no') || 'No'} />
                <DetailRow icon="fa-solid fa-credit-card" label={t('online_pay') || 'Online Payment'} value={raw.onlinePay ? t('yes') || 'Yes' : t('no') || 'No'} />
            </SectionCard>

            {/* Check-in/Check-out Section */}
            <SectionCard title={t('check_in_out') || 'Check-in / Check-out'} icon="fa-solid fa-clock">
                <DetailRow icon="fa-solid fa-right-to-bracket" label={t('check_in') || 'Check-in'} value={raw.check_In} />
                <DetailRow icon="fa-solid fa-right-from-bracket" label={t('check_out') || 'Check-out'} value={raw.check_Out} />
                <DetailRow icon="fa-solid fa-ban" label={t('booking_stopped') || 'Booking Stopped'} value={raw.stopBook ? t('yes') || 'Yes' : t('no') || 'No'} />
            </SectionCard>

            {/* Contact Section */}
            <SectionCard title={t('contact') || 'Contact'} icon="fa-solid fa-phone">
                <DetailRow icon="fa-solid fa-phone" label={t('management_phone') || 'Management Phone'} value={raw.managmentPhone} />
                <DetailRow icon="fa-solid fa-mobile" label={t('worker_phone') || 'Worker Phone'} value={raw.workerPhone} />
                <DetailRow icon="fa-solid fa-hashtag" label={t('building_number') || 'Building No.'} value={raw.buldinNumber} />
                <DetailRow icon="fa-solid fa-calendar-plus" label={t('year_built') || 'Year Built'} value={raw.yearBulit} />
            </SectionCard>

            {/* Description Section */}
            <SectionCard title={t('description') || 'Description'} icon="fa-solid fa-file-lines">
                {(raw.buldingDescrptionEn || raw.buldingDescrptionAr) && (
                    <div style={{ padding: '12px 0', fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                        {lang === 'ar' ? raw.buldingDescrptionAr || raw.buldingDescrptionEn : raw.buldingDescrptionEn || raw.buldingDescrptionAr}
                    </div>
                )}
                {(raw.additional_detailsEn || raw.additional_detailsAr) && (
                    <>
                        <div style={{ fontSize: '12px', color: '#94a3b8', margin: '8px 0 4px' }}>{t('additional_details') || 'Additional Details'}</div>
                        <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                            {lang === 'ar' ? raw.additional_detailsAr || raw.additional_detailsEn : raw.additional_detailsEn || raw.additional_detailsAr}
                        </div>
                    </>
                )}
            </SectionCard>

            {/* Policies Section */}
            <SectionCard title={t('policies') || 'Policies'} icon="fa-solid fa-scroll">
                {(raw.buildingPolicyEn || raw.buildingPolicyAr) && (
                    <>
                        <div style={{ fontSize: '12px', color: '#94a3b8', padding: '12px 0 4px' }}>{t('building_policy') || 'Building Policy'}</div>
                        <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                            {lang === 'ar' ? raw.buildingPolicyAr || raw.buildingPolicyEn : raw.buildingPolicyEn || raw.buildingPolicyAr}
                        </div>
                    </>
                )}
                {(raw.cancelation_policyEn || raw.cancelation_policyAr) && (
                    <>
                        <div style={{ fontSize: '12px', color: '#94a3b8', padding: '12px 0 4px' }}>{t('cancellation_policy') || 'Cancellation Policy'}</div>
                        <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                            {lang === 'ar' ? raw.cancelation_policyAr || raw.cancelation_policyEn : raw.cancelation_policyEn || raw.cancelation_policyAr}
                        </div>
                    </>
                )}
            </SectionCard>
        </div>
    );
};

export default BuildingDetailsTab;