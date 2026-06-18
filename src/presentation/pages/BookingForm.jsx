import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext.jsx';

export default function NewBookingScreen({ building, onSaveBooking }) {
    const { t } = useTranslation();
    const [roomTypeId, setRoomTypeId] = useState(building?.roomTypes?.[0]?.id || '');
    const [ratePlan, setRatePlan] = useState('daily');
    const [checkIn, setCheckIn] = useState('2026-06-15');
    const [checkOut, setCheckOut] = useState('2026-06-20');
    const [guestName, setGuestName] = useState('');
    const [prices, setPrices] = useState({ base: 0, discount: 0, total: 0 });

    useEffect(() => {
        const room = building?.roomTypes?.find(r => r.id === roomTypeId);
        if (!room) return;

        if (ratePlan === 'monthly') {
            const base = room.pricePerMonth || 0;
            const discount = Math.round(base * 0.15);
            setPrices({ base, discount, total: base - discount });
        } else {
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            let daysCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            if (daysCount <= 0 || isNaN(daysCount)) daysCount = 1;

            let totalCost = 0;
            let tempDate = new Date(start);
            for (let i = 0; i < daysCount; i++) {
                let dailyRate = room.pricePerNight || 0;
                const dayOfWeek = tempDate.getDay();
                if (dayOfWeek === 5 || dayOfWeek === 6) {
                    dailyRate += 5;
                }
                totalCost += dailyRate;
                tempDate.setDate(tempDate.getDate() + 1);
            }
            setPrices({ base: totalCost, discount: 0, total: totalCost });
        }
    }, [roomTypeId, ratePlan, checkIn, checkOut, building]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const room = building?.roomTypes?.find(r => r.id === roomTypeId);
        onSaveBooking({
            id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
            guestName,
            roomTypeName: room?.name || 'Standard Room',
            checkIn,
            checkOut,
            status: 'Upcoming',
            total: prices.total
        });
        alert(t('booking_saved_successfully'));
        setGuestName('');
    };

    return (
        <div className="card-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px', fontWeight: 700 }}>{t('add_new_booking')}</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('room_type')}</label>
                        <select value={roomTypeId} onChange={e => setRoomTypeId(e.target.value)}>
                            {building?.roomTypes?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('rate_plan')}</label>
                        <select value={ratePlan} onChange={e => setRatePlan(e.target.value)}>
                            <option value="daily">{t('daily_plan')}</option>
                            <option value="monthly">{t('monthly_plan')}</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('check_in_date')}</label>
                        <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('check_out_date')}</label>
                        <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('guest_full_name')}</label>
                    <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder={t('guest_name_placeholder')} required />
                </div>

                <div style={{ background: 'var(--primary-light)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>{t('base_cost')}:</span> <strong>OMR {prices.base}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--danger)' }}>
                        <span>{t('discount_applied')}:</span> <strong>- OMR {prices.discount}</strong>
                    </div>
                    <hr style={{ margin: '12px 0', border: 0, borderTop: '1px solid #bfdbfe' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
                        <span>{t('grand_total')}:</span> <span style={{ color: 'var(--primary)' }}>OMR {prices.total}</span>
                    </div>
                </div>

                <button type="submit" className="btn" style={{ width: '100%', marginTop: '24px' }}>{t('confirm_save_booking')}</button>
            </form>
        </div>
    );
}