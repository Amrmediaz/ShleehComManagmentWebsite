import React from 'react';
import { useChaletBookings } from '../../hooks/useChaletBookings.js';
import RialSymbol from '../OmaniRial.jsx';
import { Skeleton } from '../Skeleton.jsx';
import '../../styles/Buildingdetails.css';

/**
 * ChaletBookingsTab
 * Cross-chalet bookings list (mirrors the mobile app's BookingListScreen —
 * not filtered per chalet) with a detail drawer per booking.
 */
const ChaletBookingsTab = ({ t }) => {
    const {
        bookings, isLoading, error, hasMore, loadMore,
        selectedBooking, detailsLoading, openBookingDetails, closeBookingDetails,
    } = useChaletBookings();

    return (
        <div>
            {error && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                    {error}
                </div>
            )}

            {isLoading && bookings.length === 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                    {[0, 1, 2, 3].map((i) => <Skeleton key={i} height="108px" style={{ borderRadius: '14px' }} />)}
                </div>
            ) : !isLoading && bookings.length === 0 ? (
                <div className="empty-state">
                    <i className="ti ti-calendar-off empty-state__icon" />
                    <p className="empty-state__text">{t('no_bookings') || 'No bookings'}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                    {bookings.map((b) => (
                        <div
                            key={b.id}
                            onClick={() => openBookingDetails(b.id)}
                            style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '16px', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <strong style={{ fontSize: '14px', color: '#111827' }}>{b.name}</strong>
                                <i className="ti ti-chevron-right" style={{ color: '#9ca3af' }} />
                            </div>
                            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12.5px', color: '#6b7280' }}>
                                <span><i className="ti ti-phone" /> {b.phone}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <i className="ti ti-cash" /> {b.coast} <RialSymbol style={{ width: '0.85em', height: '0.85em' }} />
                                    &nbsp;·&nbsp;{b.noOFDays} {t('days') || 'days'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                        onClick={loadMore}
                        disabled={isLoading}
                        style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: '13px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
                    >
                        {isLoading ? (t('loading') || 'Loading…') : (t('load_more') || 'Load more')}
                    </button>
                </div>
            )}

            {selectedBooking && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '12px' }}
                    onClick={closeBookingDetails}
                >
                    <div
                        style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', maxHeight: 'calc(100vh - 24px)', overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{t('booking_details') || 'Booking Details'}</h3>
                            <button onClick={closeBookingDetails} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#9ca3af' }}>×</button>
                        </div>

                        <div style={{ padding: '20px' }}>
                            {detailsLoading || selectedBooking.loading ? (
                                <p style={{ color: '#9ca3af', textAlign: 'center' }}>{t('loading_details') || 'Loading…'}</p>
                            ) : selectedBooking.error ? (
                                <p style={{ color: '#dc2626' }}>{selectedBooking.error}</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: '#374151' }}>
                                    <Row label={t('booking_id') || 'Booking ID'} value={selectedBooking.id} />
                                    <Row label={t('customer_name') || 'Customer'} value={selectedBooking.name} />
                                    <Row label={t('phone') || 'Phone'} value={selectedBooking.phone} />
                                    <Row label={t('days_count') || 'Days'} value={selectedBooking.noOFDays} />
                                    <Row label={t('cost') || 'Cost'} value={selectedBooking.coast} />
                                    <Row label={t('paid_amount') || 'Paid'} value={selectedBooking.paidamount} />
                                    <Row label={t('insurance') || 'Insurance'} value={selectedBooking.insuranceamount} />
                                    {Array.isArray(selectedBooking.bookingDays) && selectedBooking.bookingDays.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{t('booked_days') || 'Booked Days'}</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                {selectedBooking.bookingDays.map((d, i) => (
                                                    <div key={i} style={{ background: '#f9fafb', borderRadius: '8px', padding: '8px 12px', fontSize: '12.5px' }}>
                                                        {d.day} · {d.isFullDay ? (t('full_day') || 'Full day') : (t('half_day') || 'Half day')}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Row = ({ label, value }) => (
    !value && value !== 0 ? null : (
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>{label}</span>
            <strong>{value}</strong>
        </div>
    )
);

export default ChaletBookingsTab;
