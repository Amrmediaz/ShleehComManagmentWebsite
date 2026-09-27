import React from 'react';

/**
 * TodayOfferPanel
 * Shared "Today's Offer" UI (TODAY-OFFER-API-SPEC.md) reused as-is by both
 * ChaletOffersTab and BuildingOffersTab, so the two property types always
 * present and behave identically — same priority explainer, same live
 * status box, same form. All state/save logic lives in the two small
 * per-type hooks (useChaletTodayOffer / useBuildingTodayOffer); this
 * component is purely presentational.
 */
export default function TodayOfferPanel({
    t,
    isLive,
    isLoading,
    enabled, setEnabled,
    percent, setPercent,
    triggerHour, setTriggerHour,
    isSaving, statusMessage, formError,
    save,
}) {
    const lblStyle = { fontSize: '12px', fontWeight: 500, color: '#4b5563', display: 'block', marginBottom: '4px' };
    const inpStyle = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', background: '#fff', color: '#111827', boxSizing: 'border-box' };

    // Settings now come from a dedicated fetch (GetTodayOffer /
    // GetHotelBuildingTodayOffer) rather than the already-loaded
    // chalet/building prop, so there's a brief loading moment on first open.
    if (isLoading) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                {t('loading') || 'Loading…'}
            </div>
        );
    }

    // 1–24 (no minutes; 24 = midnight/end of day) → a friendly "12:00 PM"
    // style label without pulling in a date lib. 24 wraps to a 0-based
    // clock hour purely for the label — the value stored/sent stays 1–24.
    const hourLabel = (h) => {
        const clockHour = h % 24;
        const period = clockHour < 12 ? (t('today_offer_am') || 'AM') : (t('today_offer_pm') || 'PM');
        const hour12 = clockHour % 12 === 0 ? 12 : clockHour % 12;
        return `${hour12}:00 ${period}`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>

            {/* ── Priority explainer — always visible, this is the "confusing part" ── */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '18px 20px', background: '#fafbfc' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
                    <i className="ti ti-list-numbers" style={{ color: '#185FA5', marginInlineEnd: '6px' }} />
                    {t('today_offer_priority_title') || 'How today\'s price gets decided'}
                </h3>
                <p style={{ fontSize: '12.5px', color: '#6b7280', margin: '0 0 14px', lineHeight: 1.6 }}>
                    {t('today_offer_priority_intro') || 'If more than one of these applies to the same day, only one price wins — never a mix. This is the order:'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <PriorityRow n={1} title={t('today_offer_priority_1_title') || 'A special price you set for that exact date'} desc={t('today_offer_priority_1_desc') || 'Always wins. If you set an exact price for today, that\'s what shows — nothing below this can change it.'} />
                    <PriorityRow n={2} title={t('today_offer_priority_2_title') || 'Today\'s Offer (this tab)'} desc={t('today_offer_priority_2_desc') || 'Only applies if there\'s no special price above, and today has no booking yet.'} highlighted />
                    <PriorityRow n={3} title={t('today_offer_priority_3_title') || 'Your standing/general promo, if you have one running'} desc={t('today_offer_priority_3_desc') || 'Used only if neither of the two above applies.'} />
                    <PriorityRow n={4} title={t('today_offer_priority_4_title') || 'Your normal price'} desc={t('today_offer_priority_4_desc') || 'Used when none of the above apply — this is the default.'} />
                </div>
            </div>

            {/* ── Live status ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderRadius: '10px',
                background: isLive ? '#f0fdf4' : '#f9fafb',
                border: `1px solid ${isLive ? '#bbf7d0' : '#e5e7eb'}`,
            }}>
                <span style={{
                    width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                    background: isLive ? '#22c55e' : '#9ca3af',
                    boxShadow: isLive ? '0 0 0 4px rgba(34,197,94,0.15)' : 'none',
                }} />
                <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: isLive ? '#15803d' : '#374151' }}>
                        {isLive
                            ? (t('today_offer_status_live') || 'Live right now — customers can see and book this offer today')
                            : (t('today_offer_status_not_live') || 'Not live right now')}
                    </div>
                    {!isLive && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                            {enabled
                                ? (t('today_offer_status_not_live_hint_enabled') || 'This is normal — it only goes live once today has no booking and it\'s past your trigger hour below.')
                                : (t('today_offer_status_not_live_hint_disabled') || 'Turn it on below to start offering a discount on days with no booking.')}
                        </div>
                    )}
                </div>
            </div>

            {statusMessage.text && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: statusMessage.isError ? '#fef2f2' : '#f0fdf4', color: statusMessage.isError ? '#dc2626' : '#16a34a', border: `1px solid ${statusMessage.isError ? '#fecaca' : '#bbf7d0'}` }}>
                    {statusMessage.text}
                </div>
            )}

            {/* ── Settings form ── */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '14px', marginTop: 0 }}>
                    {t('today_offer_settings_title') || 'Settings'}
                </h3>

                {/* Toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '18px' }}>
                    <span
                        onClick={() => setEnabled((v) => !v)}
                        style={{
                            width: '42px', height: '24px', borderRadius: '999px', position: 'relative', flexShrink: 0,
                            background: enabled ? '#185FA5' : '#d1d5db', transition: 'background 0.2s',
                        }}
                    >
                        <span style={{
                            position: 'absolute', top: '2px', insetInlineStart: enabled ? '20px' : '2px',
                            width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                            transition: 'inset-inline-start 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }} />
                    </span>
                    <span>
                        <span style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>
                            {t('today_offer_enable_label') || 'Turn on Today\'s Offer'}
                        </span>
                        <span style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                            {t('today_offer_enable_hint') || 'When on, an empty day automatically gets a discount to encourage a last-minute booking.'}
                        </span>
                    </span>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', opacity: enabled ? 1 : 0.55 }}>
                    <div>
                        <label style={lblStyle}>{t('today_offer_percent_label') || 'Discount percentage'}</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="number" min="1" max="90" step="1"
                                value={percent}
                                placeholder="20"
                                onChange={(e) => setPercent(e.target.value)}
                                disabled={!enabled || isSaving}
                                style={{ ...inpStyle, paddingInlineEnd: '30px' }}
                            />
                            <span style={{ position: 'absolute', top: '50%', insetInlineEnd: '12px', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '13px' }}>%</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                            {t('today_offer_percent_hint') || 'Taken off your normal rate — stays correct automatically if you change your rate later.'}
                        </div>
                    </div>

                    <div>
                        <label style={lblStyle}>{t('today_offer_trigger_hour_label') || 'Starts showing after'}</label>
                        <select
                            value={triggerHour}
                            onChange={(e) => setTriggerHour(Number(e.target.value))}
                            disabled={!enabled || isSaving}
                            style={inpStyle}
                        >
                            {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
                                <option key={h} value={h}>{hourLabel(h)}</option>
                            ))}
                        </select>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                            {t('today_offer_trigger_hour_hint') || 'Protects the morning — the offer only starts appearing once this hour passes, so it doesn\'t undercut a normal same-day booking that might still come in.'}
                        </div>
                    </div>
                </div>

                {formError && (
                    <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                        {formError}
                    </div>
                )}

                <button
                    type="button"
                    onClick={save}
                    disabled={isSaving}
                    style={{
                        marginTop: '18px', padding: '10px 20px',
                        background: isSaving ? '#93c0e4' : '#185FA5', color: '#fff', border: 'none',
                        borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                    }}
                >
                    {isSaving ? (t('saving') || 'Saving…') : (t('save_changes') || 'Save Changes')}
                </button>
            </div>
        </div>
    );
}

/** One row in the priority explainer — a numbered circle + title + short description. */
function PriorityRow({ n, title, desc, highlighted }) {
    return (
        <div style={{
            display: 'flex', gap: '12px', alignItems: 'flex-start',
            padding: '10px 12px', borderRadius: '8px',
            background: highlighted ? '#e6f1fb' : 'transparent',
            border: highlighted ? '1px solid #b8d5f0' : '1px solid transparent',
        }}>
            <span style={{
                width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, marginTop: '1px',
                background: highlighted ? '#185FA5' : '#e5e7eb',
                color: highlighted ? '#fff' : '#4b5563',
            }}>
                {n}
            </span>
            <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{title}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', lineHeight: 1.5 }}>{desc}</div>
            </div>
        </div>
    );
}
