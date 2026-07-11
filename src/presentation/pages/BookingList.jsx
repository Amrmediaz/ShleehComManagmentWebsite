import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { GetOwnerBuildingsFlatUseCase } from '../../core/useCases/GetBuildingsFlatUseCase.js';
import { GetBookingDetailsUseCase } from '../../core/useCases/GetBookingDetailsUseCase.js';
import BookingList from '../components/BookingList.jsx';
import '../styles/Buildingdetails.css'; // ✅ CORRECT - Separate CSS file

/**
 * BookingListPage
 *
 * Clean Architecture Implementation:
 * ├─ Component (BookingListPage.jsx) - UI & State
 * ├─ UseCase (GetOwnerBuildingsFlatUseCase) - Business logic
 * ├─ UseCase (GetBookingDetailsUseCase) - Business logic
 * ├─ Repository (GetBookingDetailsRepository) - Data handling
 * ├─ API (buildingApiClient) - HTTP requests
 * └─ Entity (BookingDetailsEntity) - Data model
 *
 * Features:
 * - Building info display
 * - Flat selector with UseCase
 * - Booking list integration
 * - Booking details modal
 * - Full error handling
 * - Bilingual support (EN/AR)
 * - RTL layout
 */
export default function BookingListPage({ building }) {
    const { t, lang } = useTranslation();
    const isRTL = lang === 'ar';

    // ──── STATE ────
    const [flats, setFlats] = useState([]);
    const [selectedFlatId, setSelectedFlatId] = useState(null);
    const [selectedFlatName, setSelectedFlatName] = useState('');
    const [loadingFlats, setLoadingFlats] = useState(true);
    const [error, setError] = useState(null);

    // ──── MODAL STATE ────
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailsError, setDetailsError] = useState(null);

    // ──── LOAD FLATS (UseCase) ────
    useEffect(() => {
        console.log('='.repeat(60));
        console.log('[BookingListPage] Loading flats for building:', building);

        if (!building?.id && !building?.raw?.id) {
            console.log('[BookingListPage] ⚠️ No building ID');
            setLoadingFlats(false);
            return;
        }

        const loadFlats = async () => {
            setLoadingFlats(true);
            setError(null);

            try {
                const buildingId = building?.id || building?.raw?.id;
                console.log('[BookingListPage] 🔄 Executing GetOwnerBuildingsFlatUseCase');

                // ✅ Using UseCase (not direct API call)
                const result = await GetOwnerBuildingsFlatUseCase.execute(buildingId);
                const flatsData = Array.isArray(result) ? result : [];

                console.log('[BookingListPage] ✅ Loaded', flatsData.length, 'flats');
                setFlats(flatsData);
                setSelectedFlatId(null);
                setSelectedFlatName('');
                setError(null);

            } catch (err) {
                console.error('[BookingListPage] ❌ Error loading flats:', err);
                setError(err.message || 'Failed to load flats');
                setFlats([]);
            } finally {
                setLoadingFlats(false);
                console.log('='.repeat(60));
            }
        };

        loadFlats();
    }, [building?.id, building?.raw?.id]);

    // ──── FETCH BOOKING DETAILS (UseCase) ────
    const handleViewBookingDetails = async (bookingId) => {
        console.log('[BookingListPage] Opening modal for booking:', bookingId);
        setIsModalOpen(true);
        setLoadingDetails(true);
        setDetailsError(null);
        setBookingDetails(null);

        try {
            console.log('[BookingListPage] 🔄 Executing GetBookingDetailsUseCase');

            // ✅ Using UseCase (not direct API call)
            const details = await GetBookingDetailsUseCase.execute(bookingId);

            console.log('[BookingListPage] ✅ Got booking details:', details);
            setBookingDetails(details);

        } catch (err) {
            console.error('[BookingListPage] ❌ Error fetching details:', err);
            setDetailsError(err.message || 'An error occurred while fetching booking details');
        } finally {
            setLoadingDetails(false);
        }
    };

    // ──── RENDER ────
    if (!building) {
        return (
            <div className="booking-list-page">
                <div className="booking-list-page__header">
                    <h1 className="booking-list-page__title">📋 {t('booking_list')}</h1>
                    <p className="booking-list-page__subtitle">{t('view_all_bookings')}</p>
                </div>
                <div className="booking-list-page__empty-state">
                    <div className="booking-list-page__empty-icon">🏢</div>
                    <p>{t('select_building')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`booking-list-page ${isRTL ? 'booking-list-page--rtl' : ''}`}>

            {/* ──── HEADER ──── */}
            <div className="booking-list-page__header">
                <h1 className="booking-list-page__title">📋 {t('booking_list')}</h1>
                <p className="booking-list-page__subtitle">{t('view_all_bookings')}</p>
            </div>

            {/* ──── BUILDING INFO ──── */}
            <div className="booking-list-page__building-info">
                🏢 {building?.nameEn || building?.nameAr || building?.name || 'Building'}
            </div>

            {/* ──── ERROR ──── */}
            {error && (
                <div className="booking-list-page__error">
                    ❌ {error}
                </div>
            )}

            {/* ──── LOADING ──── */}
            {loadingFlats && (
                <div className="booking-list-page__loading">
                    <div className="booking-list-page__spinner"></div>
                    <p>{t('loading')}</p>
                </div>
            )}

            {/* ──── CONTENT ──── */}
            {!loadingFlats && (
                <>
                    {flats.length > 0 ? (
                        <>
                            {/* Selector */}
                            <div className="booking-list-page__selector">
                                <label className="booking-list-page__selector-label">
                                    {t('select_flat')}:
                                </label>
                                <select
                                    value={selectedFlatId || ''}
                                    onChange={(e) => {
                                        const flatId = e.target.value ? Number(e.target.value) : null;
                                        const flat = flatId ? flats.find(f => f.id === flatId) : null;
                                        setSelectedFlatId(flatId);
                                        setSelectedFlatName(flat?.nameEn || flat?.nameAr || '');
                                    }}
                                    className="booking-list-page__select"
                                >
                                    <option value="">{t('choose_flat')}</option>
                                    {flats.map(flat => (
                                        <option key={flat.id} value={flat.id}>
                                            {flat.nameEn || flat.nameAr}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Booking List */}
                            {selectedFlatId ? (
                                <BookingList
                                    flatId={selectedFlatId}
                                    flatName={selectedFlatName}
                                    autoLoad={true}
                                    onViewBooking={handleViewBookingDetails}
                                />
                            ) : (
                                <div className="booking-list-page__empty-state">
                                    <div className="booking-list-page__empty-icon">👆</div>
                                    <p>{t('select_flat_to_view_bookings')}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="booking-list-page__empty-state">
                            <div className="booking-list-page__empty-icon">🏠</div>
                            <p>{t('no_flats')}</p>
                        </div>
                    )}
                </>
            )}

            {/* ──── DETAILS MODAL ──── */}
            {isModalOpen && (
                <div className="booking-list-page__modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="booking-list-page__modal" onClick={(e) => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="booking-list-page__modal-header">
                            <h3 className="booking-list-page__modal-title">
                                {t('booking_details')}
                            </h3>
                            <button
                                className="booking-list-page__modal-close"
                                onClick={() => setIsModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="booking-list-page__modal-body">
                            {loadingDetails && (
                                <div className="booking-list-page__loading">
                                    <div className="booking-list-page__spinner"></div>
                                    <p>{t('loading_details')}</p>
                                </div>
                            )}

                            {detailsError && (
                                <div className="booking-list-page__error">❌ {detailsError}</div>
                            )}

                            {bookingDetails && (
                                <div className="booking-list-page__details">
                                    <div className="booking-list-page__detail-row">
                                        <span className="booking-list-page__detail-label">{t('booking_id')}:</span>
                                        <span className="booking-list-page__detail-value">#{bookingDetails.id}</span>
                                    </div>

                                    <div className="booking-list-page__detail-row">
                                        <span className="booking-list-page__detail-label">{t('customer_name')}:</span>
                                        <span className="booking-list-page__detail-value">{bookingDetails.name}</span>
                                    </div>

                                    <div className="booking-list-page__detail-row">
                                        <span className="booking-list-page__detail-label">{t('phone')}:</span>
                                        <span className="booking-list-page__detail-value">{bookingDetails.phone}</span>
                                    </div>

                                    <div className="booking-list-page__detail-row">
                                        <span className="booking-list-page__detail-label">{t('cost')}:</span>
                                        <span className="booking-list-page__detail-value">
                                            {bookingDetails.cost} {t('OMR')}
                                        </span>
                                    </div>

                                    <div className="booking-list-page__detail-row">
                                        <span className="booking-list-page__detail-label">{t('days_count')}:</span>
                                        <span className="booking-list-page__detail-value">{bookingDetails.daysCount}</span>
                                    </div>

                                    <div className="booking-list-page__detail-row">
                                        <span className="booking-list-page__detail-label">{t('insurance')}:</span>
                                        <span className="booking-list-page__detail-value">
                                            {bookingDetails.insurance} {t('OMR')}
                                        </span>
                                    </div>

                                    <div className="booking-list-page__detail-row">
                                        <span className="booking-list-page__detail-label">{t('paid_amount')}:</span>
                                        <span className="booking-list-page__detail-value">{bookingDetails.paidAmount}</span>
                                    </div>

                                    <div className="booking-list-page__detail-row">
                                        <span className="booking-list-page__detail-label">{t('total_cost')}:</span>
                                        <span className="booking-list-page__detail-value">
                                            {bookingDetails.getTotalCost()} {t('OMR')}
                                        </span>
                                    </div>

                                    <div className="booking-list-page__detail-row">
                                        <span className="booking-list-page__detail-label">{t('payment_percentage')}:</span>
                                        <span className="booking-list-page__detail-value">
                                            {bookingDetails.getPaymentPercentage()}%
                                        </span>
                                    </div>

                                    {/* Booked Days */}
                                    {bookingDetails.bookedDays && bookingDetails.bookedDays.length > 0 && (
                                        <div className="booking-list-page__booked-days">
                                            <h4 className="booking-list-page__booked-days-title">
                                                📅 {t('booked_days')}:
                                            </h4>
                                            <div className="booking-list-page__booked-days-list">
                                                {bookingDetails.bookedDays.map((bDay, idx) => (
                                                    <span key={idx} className="booking-list-page__day-badge">
                                                        {bDay.day} {bDay.isFullDay ? `(${t('full_day')})` : ''}
                                                    </span>
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
}