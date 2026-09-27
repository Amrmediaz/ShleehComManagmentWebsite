import React, { useState } from 'react';
import {
    IconCircleCheck, IconCircle, IconX, IconSparkles,
} from '@tabler/icons-react';

const DISMISS_KEY = 'shleeh_onboarding_dismissed';

/**
 * OnboardingChecklist
 * A friendly "getting started" card shown on the Dashboard for new owners.
 * Each step is derived from real account data (no buildings/chalets yet, no
 * flats yet, calendar never opened, no bookings yet) rather than a generic
 * one-time tour — so it naturally disappears once the owner is up and
 * running, and can always be dismissed early.
 */
export default function OnboardingChecklist({
    t, isRTL,
    hasProperty, hasFlats, hasVisitedCalendar, hasBooking,
    onNavigate,
}) {
    const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === 'true');

    const steps = [
        {
            key: 'property',
            done: hasProperty,
            title: t('onboarding_step_property') || 'Add your first property',
            desc: t('onboarding_step_property_desc') || 'Add a building or a chalet to start managing bookings.',
            cta: t('onboarding_go_property') || 'Add property',
            onClick: () => onNavigate?.('buildings'),
        },
        {
            key: 'flats',
            done: hasFlats,
            title: t('onboarding_step_flats') || 'Add flats to your building',
            desc: t('onboarding_step_flats_desc') || 'Break your building down into the flat types you rent out.',
            cta: t('onboarding_go_flats') || 'Add flats',
            onClick: () => onNavigate?.('buildings'),
        },
        {
            key: 'calendar',
            done: hasVisitedCalendar,
            title: t('onboarding_step_calendar') || 'Check your calendar',
            desc: t('onboarding_step_calendar_desc') || 'See availability at a glance and block dates when needed.',
            cta: t('onboarding_go_calendar') || 'Open calendar',
            onClick: () => onNavigate?.('calendar'),
        },
        {
            key: 'booking',
            done: hasBooking,
            title: t('onboarding_step_booking') || 'Get your first booking',
            desc: t('onboarding_step_booking_desc') || "Bookings will show up here as soon as guests book with you.",
            cta: t('onboarding_go_booking') || 'View bookings',
            onClick: () => onNavigate?.('bookings-list'),
        },
    ];

    const doneCount = steps.filter((s) => s.done).length;
    const allDone = doneCount === steps.length;

    if (dismissed || allDone) return null;

    const dismiss = () => {
        localStorage.setItem(DISMISS_KEY, 'true');
        setDismissed(true);
    };

    return (
        <div
            className="card-panel"
            style={{
                marginBottom: '24px',
                background: 'linear-gradient(135deg, #eef5fc 0%, #fdf3e8 100%)',
                border: '1px solid #dbe8f5',
                position: 'relative',
            }}
        >
            <button
                type="button"
                onClick={dismiss}
                aria-label={t('onboarding_dismiss') || 'Dismiss'}
                title={t('onboarding_dismiss') || 'Dismiss'}
                style={{
                    position: 'absolute',
                    top: '14px',
                    insetInlineEnd: '14px',
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748b',
                }}
            >
                <IconX size={15} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isRTL ? 'row-reverse' : 'row', marginBottom: '4px' }}>
                <IconSparkles size={20} color="#c2680f" />
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937' }}>
                    {t('onboarding_title') || "Let's get you set up"}
                </span>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                {(t('onboarding_progress') || '{done} of {total} done')
                    .replace('{done}', doneCount)
                    .replace('{total}', steps.length)}
                {' · '}
                {t('onboarding_subtitle') || 'Complete these steps to start managing your properties'}
            </p>

            {/* Progress bar */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '18px' }}>
                {steps.map((s) => (
                    <div
                        key={s.key}
                        style={{
                            flex: 1,
                            height: '5px',
                            borderRadius: '4px',
                            background: s.done ? '#16a34a' : '#e5e7eb',
                            transition: 'background 0.2s',
                        }}
                    />
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {steps.map((s) => (
                    <div
                        key={s.key}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '10px',
                            padding: '14px',
                            opacity: s.done ? 0.75 : 1,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            {s.done ? (
                                <IconCircleCheck size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '1px' }} />
                            ) : (
                                <IconCircle size={18} color="#9ca3af" style={{ flexShrink: 0, marginTop: '1px' }} />
                            )}
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', textDecoration: s.done ? 'line-through' : 'none' }}>
                                    {s.title}
                                </div>
                                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {s.desc}
                                </div>
                            </div>
                        </div>
                        {!s.done && (
                            <button
                                type="button"
                                onClick={s.onClick}
                                style={{
                                    alignSelf: isRTL ? 'flex-end' : 'flex-start',
                                    marginInlineStart: '26px',
                                    background: 'none',
                                    border: 'none',
                                    color: '#185FA5',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    padding: 0,
                                }}
                            >
                                {s.cta} →
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
