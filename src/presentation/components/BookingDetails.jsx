// ──── ADD THESE TO YOUR STATE ────
import RialSymbol from "./OmaniRial.jsx";

const [detailsModalOpen, setDetailsModalOpen] = useState(false);
const [selectedBooking, setSelectedBooking] = useState(null);
const [loadingDetails, setLoadingDetails] = useState(false);
const [detailsError, setDetailsError] = useState(null);

const handleViewDetails = async (bookingId) => {
    setLoadingDetails(true);
    setDetailsError(null);
    setDetailsModalOpen(true);
    setSelectedBooking(null);

    try {
        const response = await fetch(
            `https://shleeh.com/api/FlatsCustomer/GetBookingDetailes?bookingID=${bookingId}`
        );
        const data = await response.json();

        if (data.status && data.message) {
            setSelectedBooking(data.message);
        } else {
            setDetailsError('Failed to load booking details');
        }
    } catch (err) {
        setDetailsError(err.message || 'Failed to load booking details');
    } finally {
        setLoadingDetails(false);
    }
};

const modalStyles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
    modal: { background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto', direction: isRTL ? 'rtl' : 'ltr' },
    modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
    modalTitle: { fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 },
    closeBtn: { background: 'none', border: '1px solid #d1d5db', borderRadius: '8px', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#6b7280' },
    detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' },
    detailCard: { background: '#f9fafb', borderRadius: '8px', padding: '12px 14px', border: '1px solid #e5e7eb' },
    detailLabel: { fontSize: '12px', color: '#9ca3af', margin: '0 0 4px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' },
    detailValue: { fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' },
    sectionLabel: { fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' },
    daysList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' },
    dayBadge: { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 10px', fontSize: '13px', fontWeight: 500 },
    paidRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' },
    noteBox: { background: '#f9fafb', borderLeft: '3px solid #185FA5', borderRadius: '0 8px 8px 0', padding: '10px 14px', marginBottom: '20px', fontSize: '13px', color: '#4b5563' },
    detailsBtn: { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer', color: '#1d4ed8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' },
};

{detailsModalOpen && (
    <div style={modalStyles.overlay} onClick={() => setDetailsModalOpen(false)}>
        <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={modalStyles.modalHeader}>
                <h2 style={modalStyles.modalTitle}>
                    📋 {t('booking_details') || 'Booking details'}
                </h2>
                <button style={modalStyles.closeBtn} onClick={() => setDetailsModalOpen(false)} aria-label="Close">✕</button>
            </div>

            {loadingDetails && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                    <div style={styles.spinner}></div>
                    <p style={{ marginTop: '12px' }}>{t('loading') || 'Loading...'}</p>
                </div>
            )}

            {detailsError && !loadingDetails && (
                <div style={styles.errorContainer}>❌ {detailsError}</div>
            )}

            {selectedBooking && !loadingDetails && (
                <>
                    <div style={modalStyles.detailGrid}>
                        <div style={modalStyles.detailCard}>
                            <p style={modalStyles.detailLabel}>{t('guest_name') || 'Guest name'}</p>
                            <p style={modalStyles.detailValue}>{selectedBooking.name}</p>
                        </div>
                        <div style={modalStyles.detailCard}>
                            <p style={modalStyles.detailLabel}>{t('phone') || 'Phone'}</p>
                            <p style={{ ...modalStyles.detailValue, fontSize: '13px' }}>{selectedBooking.phone}</p>
                        </div>
                        <div style={modalStyles.detailCard}>
                            <p style={modalStyles.detailLabel}>{t('total_cost') || 'Total cost'}</p>
                            <p style={modalStyles.detailValue}>
                                {selectedBooking.coast}
                                <RialSymbol style={{ width: '0.85em', height: '0.85em' }} />
                            </p>
                        </div>
                        <div style={modalStyles.detailCard}>
                            <p style={modalStyles.detailLabel}>{t('duration') || 'Duration'}</p>
                            <p style={modalStyles.detailValue}>{selectedBooking.noOFDays} {t('nights') || 'night(s)'}</p>
                        </div>
                        <div style={modalStyles.detailCard}>
                            <p style={modalStyles.detailLabel}>{t('insurance') || 'Insurance'}</p>
                            <p style={modalStyles.detailValue}>
                                {selectedBooking.insuranceamount}
                                <RialSymbol style={{ width: '0.85em', height: '0.85em' }} />
                            </p>
                        </div>
                        <div style={modalStyles.detailCard}>
                            <p style={modalStyles.detailLabel}>{t('booking_date') || 'Booking date'}</p>
                            <p style={{ ...modalStyles.detailValue, fontSize: '12px' }}>
                                {new Date(selectedBooking.crreatedDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {selectedBooking.hotelbuildingBookingDays?.length > 0 && (
                        <>
                            <p style={modalStyles.sectionLabel}>{t('booked_days') || 'Booked days'}</p>
                            <div style={modalStyles.daysList}>
                                {selectedBooking.hotelbuildingBookingDays.map((d, i) => (
                                    <span key={i} style={modalStyles.dayBadge}>📅 {d.day}</span>
                                ))}
                            </div>
                        </>
                    )}

                    <div style={modalStyles.paidRow}>
                        <span style={{ fontSize: '13px', color: '#15803d', fontWeight: 500 }}>
                            💵 {t('amount_paid') || 'Amount paid'}
                        </span>
                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {selectedBooking.paidamount}
                            <RialSymbol style={{ width: '0.85em', height: '0.85em' }} />
                        </span>
                    </div>

                    {selectedBooking.note && (
                        <div style={modalStyles.noteBox}>
                            <span style={{ fontWeight: 600, color: '#374151' }}>{t('note') || 'Note'}:{' '}</span>
                            {selectedBooking.note}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            style={{ ...modalStyles.detailsBtn, background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }}
                            onClick={() => setDetailsModalOpen(false)}
                        >
                            {t('close') || 'Close'}
                        </button>
                    </div>
                </>
            )}
        </div>
    </div>
)}