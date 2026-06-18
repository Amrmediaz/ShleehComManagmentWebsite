import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext'; // Ensure this is imported
import { FilterBookingsUseCase } from '../../core/useCases/FilterBookingsUseCase';

const filterUseCase = new FilterBookingsUseCase();

export default function BookingList({ bookings = [], building }) {
    // 🟢 Initialize the translation hook
    const { t } = useTranslation();

    const [searchName, setSearchName] = useState('');
    const [status, setStatus] = useState('ALL');
    const [roomTypeId, setRoomTypeId] = useState('ALL');

    const safeBookings = Array.isArray(bookings) ? bookings : [];
    const filteredBookings = filterUseCase.execute(safeBookings, { searchName, roomTypeId, status });

    const roomTypes = building?.roomTypes || [];

    return (
        <div>
            <div className="filter-bar" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder={t('search_guest_name')}
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                />

                <select value={roomTypeId} onChange={(e) => setRoomTypeId(e.target.value)}>
                    <option value="ALL">{t('all_room_types')}</option>
                    {roomTypes.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>

                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="ALL">{t('all_status')}</option>
                    <option value="Active">{t('status_active')}</option>
                    <option value="Upcoming">{t('status_upcoming')}</option>
                </select>
            </div>

            <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr>
                        <th>{t('guest_name')}</th>
                        <th>{t('check_in')}</th>
                        <th>{t('check_out')}</th>
                        <th>{t('total_paid')}</th>
                        <th>{t('status')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredBookings.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>
                                {t('no_matches_found')}
                            </td>
                        </tr>
                    ) : (
                        filteredBookings.map(bk => (
                            <tr key={bk.id}>
                                <td>
                                    <strong>{bk.guestName}</strong><br/>
                                    <small style={{ color: 'var(--text-muted)' }}>{bk.phone}</small>
                                </td>
                                <td>{bk.checkIn}</td>
                                <td>{bk.checkOut}</td>
                                <td><strong style={{ color: 'var(--primary)' }}>OMR {bk.totalPaid}</strong></td>
                                <td>
                                        <span className={`badge ${bk.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                                            {/* 🟢 Safely translate status dynamically */}
                                            {t(`status_${bk.status.toLowerCase()}`)}
                                        </span>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}