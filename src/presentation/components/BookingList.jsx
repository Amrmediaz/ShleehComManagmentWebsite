import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useBookings } from '../hooks/useBookings';
import { FilterBookingsUseCase } from '../../core/useCases/FilterBookingsUseCase';
import RialSymbol from './OmaniRial.jsx';
import { Skeleton } from './Skeleton.jsx';

const filterUseCase = new FilterBookingsUseCase();

/**
 * BookingList Component
 * Complete booking list with search, filter, and professional table
 *
 * @param {number} flatId - Flat ID to fetch bookings for (required)
 * @param {string} flatName - Display name of the flat (optional)
 * @param {boolean} autoLoad - Auto-load on mount (default: true)
 * @param {function} onViewBooking - Callback function triggered when clicking "View Details" (required)
 */
export default function BookingList({ flatId, flatName, autoLoad = true, onViewBooking }) {
    const { t, lang } = useTranslation();
    const isRTL = lang === 'ar';

    // ──── STATE ────
    const [searchName, setSearchName] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // ──── FETCH BOOKINGS ────
    const {
        bookings,
        isLoading,
        error,
        statusMessage,
        getStatusColor,
        getStatusLabel,
    } = useBookings(flatId, autoLoad);

    // ──── FILTER BOOKINGS ────
    const filteredBookings = filterUseCase.execute(bookings, {
        searchName,
        roomTypeId: 'ALL',
        status: filterStatus,
    });

    // ──── STYLES ────
    const styles = {
        container: {
            padding: '20px',
            direction: isRTL ? 'rtl' : 'ltr',
            textAlign: isRTL ? 'right' : 'left',
        },
        header: {
            marginBottom: '20px',
        },
        title: {
            fontSize: '20px',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '8px',
            margin: 0,
        },
        subtitle: {
            fontSize: '13px',
            color: '#6b7280',
            marginBottom: '0',
            margin: 0,
        },
        filterBar: {
            display: 'flex',
            gap: '12px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            flexDirection: isRTL ? 'row-reverse' : 'row',
        },
        input: {
            flex: 1,
            minWidth: '150px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '13px',
            direction: isRTL ? 'rtl' : 'ltr',
            textAlign: isRTL ? 'right' : 'left',
        },
        select: {
            minWidth: '120px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '13px',
            cursor: 'pointer',
            direction: isRTL ? 'rtl' : 'ltr',
            textAlign: isRTL ? 'right' : 'left',
        },
        statusMessage: (isError) => ({
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '16px',
            background: isError ? '#fef2f2' : '#f0fdf4',
            color: isError ? '#dc2626' : '#16a34a',
            border: `1px solid ${isError ? '#fecaca' : '#bbf7d0'}`,
            textAlign: isRTL ? 'right' : 'left',
        }),
        loadingContainer: {
            textAlign: 'center',
            padding: '40px 20px',
            color: '#9ca3af',
        },
        tableWrapper: {
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
        },
        thead: {
            background: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
        },
        th: {
            padding: '12px 14px',
            textAlign: isRTL ? 'right' : 'left',
            fontSize: '12px',
            fontWeight: 600,
            color: '#4b5563',
            borderRight: isRTL ? '1px solid #e5e7eb' : 'none',
            borderLeft: !isRTL ? '1px solid #e5e7eb' : 'none',
        },
        td: {
            padding: '14px',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '13px',
            color: '#374151',
            textAlign: isRTL ? 'right' : 'left',
            borderRight: isRTL ? '1px solid #e5e7eb' : 'none',
            borderLeft: !isRTL ? '1px solid #e5e7eb' : 'none',
        },
        guestCell: {
            fontWeight: 600,
            color: '#111827',
        },
        phoneCell: {
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '4px',
        },
        priceCell: {
            fontWeight: 600,
            color: '#185FA5',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
        },
        badge: (color) => ({
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            backgroundColor: color.bg,
            color: color.text,
            border: `1px solid ${color.border}`,
        }),
        actionButton: {
            padding: '6px 12px',
            backgroundColor: '#185FA5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
        },
        emptyState: {
            textAlign: 'center',
            padding: '40px 20px',
            color: '#9ca3af',
        },
    };

    // ──── RENDER ────

    if (!flatId) {
        return (
            <div style={styles.container}>
                <div style={styles.emptyState}>
                    <p style={{ fontSize: '14px', margin: 0 }}>
                        {t('select_flat_to_view_bookings') || 'Please select a flat to view bookings'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            {flatName && (
                <div style={styles.header}>
                    <h3 style={styles.title}>📅 {flatName}</h3>
                    <p style={styles.subtitle}>
                        {isLoading
                            ? t('loading') || 'Loading bookings...'
                            : `${bookings.length} ${t('total_bookings') || 'bookings'}`
                        }
                    </p>
                </div>
            )}

            {/* Status Message */}
            {statusMessage && (
                <div style={styles.statusMessage(statusMessage.isError)}>
                    {statusMessage.text}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div style={styles.tableWrapper}>
                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height="44px" style={{ borderRadius: '8px' }} />)}
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div style={styles.statusMessage(true)}>
                    {error}
                </div>
            )}

            {/* Filter Bar */}
            {!isLoading && bookings.length > 0 && (
                <div style={styles.filterBar}>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={styles.select}
                    >
                        <option value="ALL">{t('all_status') || 'All Status'}</option>
                        <option value="0">{t('pending') || 'Pending'}</option>
                        <option value="1">{t('confirmed') || 'Confirmed'}</option>
                        <option value="2">{t('cancelled') || 'Cancelled'}</option>
                        <option value="3">{t('completed') || 'Completed'}</option>
                    </select>
                </div>
            )}

            {/* Table */}
            {!isLoading && (
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead style={styles.thead}>
                        <tr>
                            <th style={styles.th}>{t('guest_name') || 'Guest Name'}</th>
                            <th style={styles.th}>{t('phone') || 'Phone'}</th>
                            {/*<th style={styles.th}>{t('check_in') || 'Check In'}</th>*/}
                            {/*<th style={styles.th}>{t('check_out') || 'Check Out'}</th>*/}
                            <th style={styles.th}>{t('days') || 'Days'}</th>
                            <th style={styles.th}>{t('total_paid') || 'Total Paid'}</th>
                            <th style={styles.th}>{t('status') || 'Status'}</th>
                            <th style={styles.th}>{t('actions') || 'Actions'}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredBookings.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={styles.emptyState}>
                                    {bookings.length === 0
                                        ? t('no_bookings') || 'No bookings'
                                        : t('no_matches_found') || 'No matches found'}
                                </td>
                            </tr>
                        ) : (
                            filteredBookings.map((booking) => {
                                const statusColor = getStatusColor(booking.bookingstatus);
                                const statusLabel = getStatusLabel(booking.bookingstatus);

                                // Format dates
                                const checkInDate = booking.crreatedDate
                                    ? new Date(booking.crreatedDate).toLocaleDateString(
                                        lang === 'ar' ? 'ar-SA' : 'en-US',
                                        { year: 'numeric', month: 'short', day: 'numeric' }
                                    )
                                    : '-';

                                const checkOutDate = booking.hotelbuildingBookingDays?.length > 0
                                    ? new Date(booking.hotelbuildingBookingDays[booking.hotelbuildingBookingDays.length - 1].day).toLocaleDateString(
                                        lang === 'ar' ? 'ar-SA' : 'en-US',
                                        { year: 'numeric', month: 'short', day: 'numeric' }
                                    )
                                    : '-';

                                return (
                                    <tr
                                        key={booking.id}
                                        style={{
                                            background: booking.id % 2 === 0 ? 'white' : '#fafbfc',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f0f4f8'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = booking.id % 2 === 0 ? 'white' : '#fafbfc'}
                                    >
                                        <td style={styles.td}>
                                            <div style={styles.guestCell}>{booking.name}</div>
                                            <div style={styles.phoneCell}>📱 {booking.phone}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <a href={`tel:${booking.phone}`} style={{ color: '#185FA5', textDecoration: 'none' }}>
                                                {booking.phone}
                                            </a>
                                        </td>
                                        {/*<td style={styles.td}>{checkInDate}</td>*/}
                                        {/*<td style={styles.td}>{checkOutDate}</td>*/}
                                        <td style={styles.td}>
                                            {booking.noOFDays} {t('days')}
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.priceCell}>
                                                {booking.coast}
                                                <RialSymbol style={{ width: '0.85em', height: '0.85em' }} />
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.badge(statusColor)}>
                                                {statusLabel}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            {onViewBooking && (
                                                <button
                                                    style={styles.actionButton}
                                                    onClick={() => onViewBooking(booking.id)}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#134e86'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#185FA5'}
                                                >
                                                    {t('view_details') || 'Details'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}