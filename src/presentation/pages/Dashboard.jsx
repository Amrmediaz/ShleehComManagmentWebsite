import React, { useMemo, useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import BlockDatesModal from '../components/BlockDatesModal.jsx';
import CustomPriceModal from '../components/CustomPriceModal.jsx';
import AddOfferModal from '../components/AddOfferModal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import OccupancyBar from '../components/OccupancyBar.jsx';

export default function Dashboard({ building, bookings, loading, onNavigate }) {
    const { t } = useTranslation();

    // Modal State
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

    // Derived State: Now safe because key={building.id} in parent triggers fresh calc
    const stats = useMemo(() => {
        if (!building || !building.roomTypes) return { total: 0, occupied: 0, available: 0 };
        const occupied = building.roomTypes.reduce((acc, rm) => acc + (rm.occupied || 0), 0);
        const total = building.roomTypes.reduce((acc, rm) => acc + (rm.count || 0), 0);
        return { total, occupied, available: total - occupied };
    }, [building]);

    if (loading) {
        return <div className="dashboard-view-wrapper">Loading dashboard data...</div>;
    }

    if (!building) {
        return <div className="dashboard-view-wrapper">{t('no_building_data')}</div>;
    }

    return (
        <div className="dashboard-view-wrapper">
            {/* KPI Row */}
            <div className="kpi-row">
                <div className="kpi-card">
                    <div className="kpi-title">{t('kpi_total')}</div>
                    <div className="kpi-value">{stats.total}</div>
                </div>
                <div className="kpi-card" style={{ borderLeft: '4px solid var(--warning)' }}>
                    <div className="kpi-title">{t('kpi_occupied')}</div>
                    <div className="kpi-value">{stats.occupied}</div>
                </div>
                <div className="kpi-card" style={{ borderLeft: '4px solid var(--success)' }}>
                    <div className="kpi-title">{t('kpi_available')}</div>
                    <div className="kpi-value" style={{ color: 'var(--success)' }}>{stats.available}</div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Left Column */}
                <div>
                    <div className="card-panel">
                        <div className="panel-title">{t('occupancy_load')}</div>
                        {building.roomTypes?.map((rm, idx) => (
                            <OccupancyBar
                                key={`${building.id}-bar-${idx}`}
                                label={rm.name}
                                value={rm.count > 0 ? Math.round((rm.occupied / rm.count) * 100) : 0}
                            />
                        ))}
                    </div>

                    <div className="card-panel" style={{ padding: 0 }}>
                        <div className="panel-title" style={{ padding: '32px 32px 16px 32px' }}>{t('upcoming_bookings')}</div>
                        {bookings?.length > 0 ? (
                            <table>
                                <thead>
                                <tr><th>{t('th_tenant')}</th><th>{t('th_model')}</th><th>{t('th_status')}</th></tr>
                                </thead>
                                <tbody>
                                {bookings.map((b, idx) => (
                                    <tr key={`${building.id}-booking-${idx}`}>
                                        <td>{b.guestName}</td>
                                        <td>{b.roomTypeId}</td>
                                        <td><StatusBadge status={b.status} /></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ padding: '0 32px 32px 32px', color: 'var(--slate-400)' }}>{t('no_upcoming_bookings')}</p>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div>
                    <div className="card-panel">
                        <div className="panel-title">{t('quick_actions')}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <button className="btn" onClick={() => onNavigate?.('new-booking')}>
                                <i className="fa-solid fa-plus" /> {t('btn_add_booking_dash')}
                            </button>
                            <button className="btn btn-secondary" onClick={() => setIsBlockModalOpen(true)}>
                                <i className="fa-solid fa-ban" /> {t('btn_block_dates')}
                            </button>
                            <button className="btn btn-secondary" onClick={() => setIsPriceModalOpen(true)}>
                                <i className="fa-solid fa-tags" /> {t('btn_custom_price')}
                            </button>
                            <button className="btn btn-secondary" onClick={() => setIsOfferModalOpen(true)}>
                                <i className="fa-solid fa-gift" /> {t('btn_add_offer')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <BlockDatesModal isOpen={isBlockModalOpen} onClose={() => setIsBlockModalOpen(false)} roomTypes={building.roomTypes} />
            <CustomPriceModal isOpen={isPriceModalOpen} onClose={() => setIsPriceModalOpen(false)} roomTypes={building.roomTypes} />
            <AddOfferModal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} roomTypes={building.roomTypes} />
        </div>
    );
}