import React, { useState } from 'react';
import { useChaletBlockedDays } from '../../hooks/useChaletBlockedDays.js';
import '../../styles/Buildingdetails.css';

/**
 * ChaletCalendarTab
 * Simple month-by-month availability calendar: click a day to block/unblock
 * it, booked (customer) days are read-only. Mirrors the mobile app's
 * CalendarScreen — a chalet is a single unique property, so there's no
 * per-day "units" concept here (unlike flats).
 */
const ChaletCalendarTab = ({ chaletId, t, lang }) => {
    const { isLoading, isSaving, statusMessage, dirty, isBooked, isBlocked, toggleDay, save, blockedCount, bookedCount } = useChaletBlockedDays(chaletId);
    const [currentDate, setCurrentDate] = useState(new Date());
    const isRTL = lang === 'ar';

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

    const dayNames = isRTL
        ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const monthName = currentDate.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' });

    const isoOf = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isPast = (iso) => iso < new Date().toISOString().slice(0, 10);

    const changeMonth = (delta) => setCurrentDate(new Date(year, month + delta, 1));

    return (
        <div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#f9fafb', border: '1px solid #e5e7eb' }} /> {t('available') || 'Available'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#ffedd5' }} /> {t('blocked') || 'Blocked'} ({blockedCount})
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#fee2e2' }} /> {t('booked') || 'Booked'} ({bookedCount})
                </span>
            </div>

            {statusMessage.text && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', background: statusMessage.isError ? '#fef2f2' : '#f0fdf4', color: statusMessage.isError ? '#dc2626' : '#16a34a', border: `1px solid ${statusMessage.isError ? '#fecaca' : '#bbf7d0'}` }}>
                    {statusMessage.text}
                </div>
            )}

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '22px', maxWidth: '520px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <button onClick={() => changeMonth(-1)} style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }}>‹</button>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{monthName}</h3>
                    <button onClick={() => changeMonth(1)} style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }}>›</button>
                </div>

                {isLoading ? (
                    <div className="empty-state"><p className="empty-state__text">{t('loading') || 'Loading…'}</p></div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                        {dayNames.map(d => (
                            <div key={d} style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textAlign: 'center', padding: '6px 0', textTransform: 'uppercase' }}>{d}</div>
                        ))}
                        {calendarDays.map((day, idx) => {
                            if (!day) return <div key={`e-${idx}`} />;
                            const iso = isoOf(day);
                            const booked = isBooked(iso);
                            const blocked = isBlocked(iso);
                            const past = isPast(iso);

                            let bg = '#f9fafb', color = '#374151', cursor = isSaving ? 'not-allowed' : 'pointer';
                            if (booked) { bg = '#fee2e2'; color = '#991b1b'; cursor = 'not-allowed'; }
                            else if (blocked) { bg = '#ffedd5'; color = '#92400e'; }
                            else if (past) { bg = '#f3f4f6'; color = '#d1d5db'; cursor = 'not-allowed'; }

                            return (
                                <div
                                    key={day}
                                    onClick={() => { if (!past && !isSaving) toggleDay(iso); }}
                                    title={booked ? (t('cannot_change_booked_date') || 'Booked') : ''}
                                    style={{ padding: '8px 4px', textAlign: 'center', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor, background: bg, color, minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </div>
                )}

                <button
                    onClick={save}
                    disabled={!dirty || isSaving}
                    style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 600, fontSize: '13px', color: '#fff', cursor: (!dirty || isSaving) ? 'not-allowed' : 'pointer', background: (!dirty || isSaving) ? '#93c5fd' : 'linear-gradient(135deg, #185FA5 0%, #1a6db8 100%)' }}
                >
                    {isSaving ? (t('saving') || 'Saving…') : (t('save_changes') || 'Save Changes')}
                </button>
            </div>
        </div>
    );
};

export default ChaletCalendarTab;
