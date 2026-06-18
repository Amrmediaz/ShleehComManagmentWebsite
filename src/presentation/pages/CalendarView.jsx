import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';

export default function CalendarView({ building }) {
    const { t } = useTranslation();
    const roomTypes = building?.roomTypes || [];
    const [selectedRoom, setSelectedRoom] = useState(roomTypes[0]?.id || '');

    useEffect(() => {
        if (roomTypes.length > 0) {
            setSelectedRoom(roomTypes[0].id);
        }
    }, [building?.id]);

    if (roomTypes.length === 0) {
        return <p>{t('no_configurations_found')}</p>;
    }

    const activeRoom = roomTypes.find(r => r.id === selectedRoom);
    const daysInJune = Array.from({ length: 30 }, (_, i) => i + 1);
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    return (
        <div>
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--surface)', padding: '16px 24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)' }}>
                <label style={{ fontWeight: 600 }}>{t('filter_room_type')}:</label>
                <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} style={{ width: 'auto' }}>
                    {roomTypes.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
            </div>

            <div className="calendar-layout">
                <div className="card-panel">
                    <div className="panel-title">{t('pricing_definitions')}</div>
                    <h2>{activeRoom?.name}</h2>
                    <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>
                        {t('capacity')}: {activeRoom?.count || 0} {t('rooms')}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--slate-100)', paddingTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{t('base_rate')}:</span> <strong>OMR {activeRoom?.pricePerNight || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{t('monthly_rate')}:</span> <strong>OMR {activeRoom?.pricePerMonth || 0}</strong>
                        </div>
                    </div>
                </div>

                <div className="card-panel" style={{ background: 'white' }}>
                    <h3 style={{ marginBottom: '16px' }}>{t('room_availability_matrix')}</h3>
                    <div className="calendar-grid">
                        {dayNames.map(d => (
                            <div key={d} className="calendar-day-head">{t(d)}</div>
                        ))}
                        {daysInJune.map(day => {
                            const isWeekend = day % 7 === 5 || day % 7 === 6;
                            return (
                                <div key={day} className={`calendar-day ${isWeekend ? 'full-day' : ''}`}>
                                    <span className="day-num">{day}</span>
                                    <span className="count-badge" style={{ color: isWeekend ? 'var(--warning)' : 'var(--success)' }}>
                                        {isWeekend ? t('dynamic_price_plus_5') : t('available')}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}