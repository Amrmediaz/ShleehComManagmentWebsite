import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext.jsx';
import { useBookings } from '../../hooks/useBookings.js';
import { IconX, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

export default function BookingsCalendarModal({ isOpen, onClose, flatId, flatName }) {
    const { t } = useTranslation();
    const { bookings, bookedDates, isLoading, error, isDateBooked, getBookingForDate, getStatusColor, getStatusLabel } = useBookings(flatId);

    // Calendar state
    const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // June 2026

    if (!isOpen || !flatId) return null;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Create calendar grid
    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1));
    };

    const formatDateForBooking = (day) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    // ──── STYLES ────
    const styles = {
        modal: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '12px',
            boxSizing: 'border-box',
        },
        container: {
            background: 'white',
            borderRadius: '16px',
            maxWidth: '1000px',
            width: '100%',
            maxHeight: 'calc(100vh - 24px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        },
        header: {
            padding: '16px 20px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
        },
        title: {
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            color: '#111827',
        },
        content: {
            padding: '20px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(350px, 1fr) 1fr',
            gap: '24px',
            flexGrow: 1,
            boxSizing: 'border-box',
        },
        calendarWrapper: {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
        },
        calendarNav: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            background: '#f9fafb',
            borderRadius: '8px',
        },
        calendarGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            padding: '12px',
            background: '#f9fafb',
            borderRadius: '8px',
        },
        dayHead: {
            fontSize: '12px',
            fontWeight: 600,
            color: '#6b7280',
            textAlign: 'center',
            padding: '8px 4px',
        },
        dayCell: (day, isBooked) => ({
            padding: '8px 4px',
            textAlign: 'center',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: isBooked ? 'pointer' : 'default',
            background: isBooked ? '#ef4444' : '#e5e7eb',
            color: isBooked ? 'white' : '#374151',
            minHeight: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
        }),
        bookingsWrapper: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
        },
        bookingCard: (status) => ({
            padding: '12px',
            borderRadius: '8px',
            border: `2px solid ${getStatusColor(status)}`,
            background: '#f9fafb',
        }),
        footer: {
            padding: '16px 20px',
            borderTop: '1px solid #f3f4f6',
            display: 'flex',
            justifyContent: 'flex-end',
            flexShrink: 0,
        },
    };

    return (
        <div style={styles.modal}>
            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>
                        📅 {t('bookings') || 'Bookings'} - {flatName || `Flat #${flatId}`}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: '4px' }}
                    >
                        <IconX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={styles.content}>
                    {/* Calendar */}
                    <div style={styles.calendarWrapper}>
                        {/* Month Navigation */}
                        <div style={styles.calendarNav}>
                            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                <IconChevronLeft size={18} />
                            </button>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{monthName}</h3>
                            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                <IconChevronRight size={18} />
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div style={styles.calendarGrid}>
                            {/* Day headers */}
                            {dayNames.map(day => (
                                <div key={day} style={styles.dayHead}>{day}</div>
                            ))}

                            {/* Days */}
                            {calendarDays.map((day, idx) => {
                                if (!day) {
                                    return <div key={`empty-${idx}`} />;
                                }

                                const dateStr = formatDateForBooking(day);
                                const booked = isDateBooked(dateStr);
                                const bookingInfo = getBookingForDate(dateStr);

                                return (
                                    <div
                                        key={day}
                                        style={styles.dayCell(day, booked)}
                                        title={booked && bookingInfo ? `${bookingInfo.guestName} - ${getStatusLabel(bookingInfo.status)}` : ''}
                                    >
                                        {day}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#ef4444' }} />
                                <span>{t('booked') || 'Booked'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#e5e7eb' }} />
                                <span>{t('available') || 'Available'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bookings List */}
                    <div style={styles.bookingsWrapper}>
                        <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                            {t('bookings') || 'Bookings'} ({bookings.length})
                        </h3>

                        {isLoading && (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                                {t('loading') || 'Loading...'}
                            </div>
                        )}

                        {error && (
                            <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                                {error}
                            </div>
                        )}

                        {!isLoading && bookings.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                                {t('no_bookings') || 'No bookings'}
                            </div>
                        )}

                        {!isLoading && bookings.length > 0 && (
                            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {bookings.map(booking => (
                                    <div key={booking.id} style={styles.bookingCard(booking.bookingstatus)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <strong style={{ fontSize: '13px' }}>{booking.name}</strong>
                                            <span style={{ fontSize: '11px', fontWeight: 600, color: getStatusColor(booking.bookingstatus) }}>
                                                {getStatusLabel(booking.bookingstatus)}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                                            📱 {booking.phone}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                                            📅 {booking.noOFDays} {t('days') || 'days'} •{t('OMR')}{booking.coast}
                                        </div>
                                        {booking.note && (
                                            <div style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' }}>
                                                💬 {booking.note}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: '13px', cursor: 'pointer' }}
                    >
                        {t('close') || 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
}