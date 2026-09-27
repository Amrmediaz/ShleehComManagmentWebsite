import React from 'react';
import '../../styles/AddBuildingModal.css';

/** ChaletPricingSection — base rates, weekend/off-day pricing, min stay, insurance & booking flags. */
export default function ChaletPricingSection({
    rentFullDay, setRentFullDay,
    rentHalfDay, setRentHalfDay,
    offDayPriceFullDay, setOffDayPriceFullDay,
    offDayPriceHalfDay, setOffDayPriceHalfDay,
    rentWeekend, setRentWeekend,
    minDays, setMinDays,
    insuranceAmount, setInsuranceAmount,
    acceptDeposit, setAcceptDeposit,
    stopBook, setStopBook,
    t,
}) {
    return (
        <section>
            <div className="modal-section-title">{t('pricing') || 'Pricing'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="modal-grid-2">
                    <div>
                        <label className="modal-label">{t('full_day') || 'Full Day Rate'} <span style={{ color: '#ef4444' }}>*</span></label>
                        <input className="modal-input" type="number" step="0.01" min="0" value={rentFullDay} onChange={(e) => setRentFullDay(e.target.value)} />
                    </div>
                    <div>
                        <label className="modal-label">{t('half_day') || 'Half Day Rate'}</label>
                        <input className="modal-input" type="number" step="0.01" min="0" value={rentHalfDay} onChange={(e) => setRentHalfDay(e.target.value)} />
                    </div>
                </div>

                <div className="modal-grid-2">
                    <div>
                        <label className="modal-label">{t('off_day_full') || 'Off-day Full Day Rate'}</label>
                        <input className="modal-input" type="number" step="0.01" min="0" value={offDayPriceFullDay} onChange={(e) => setOffDayPriceFullDay(e.target.value)} />
                    </div>
                    <div>
                        <label className="modal-label">{t('off_day_half') || 'Off-day Half Day Rate'}</label>
                        <input className="modal-input" type="number" step="0.01" min="0" value={offDayPriceHalfDay} onChange={(e) => setOffDayPriceHalfDay(e.target.value)} />
                    </div>
                </div>

                <div className="modal-grid-3">
                    <div>
                        <label className="modal-label">{t('weekends') || 'Weekend Rate'}</label>
                        <input className="modal-input" type="number" step="0.01" min="0" value={rentWeekend} onChange={(e) => setRentWeekend(e.target.value)} />
                    </div>
                    <div>
                        <label className="modal-label">{t('min_days') || 'Minimum Days'}</label>
                        <input className="modal-input" type="number" min="0" value={minDays} onChange={(e) => setMinDays(e.target.value)} />
                    </div>
                    <div>
                        <label className="modal-label">{t('insurance') || 'Insurance Amount'}</label>
                        <input className="modal-input" type="number" step="0.01" min="0" value={insuranceAmount} onChange={(e) => setInsuranceAmount(e.target.value)} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginTop: '4px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                        <input type="checkbox" checked={acceptDeposit} onChange={(e) => setAcceptDeposit(e.target.checked)} />
                        {t('accept_deposit') || 'Accept Deposit'}
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                        <input type="checkbox" checked={stopBook} onChange={(e) => setStopBook(e.target.checked)} />
                        {t('booking_stopped') || 'Stop Booking'}
                    </label>
                </div>
            </div>
        </section>
    );
}
