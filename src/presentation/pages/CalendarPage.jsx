import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext.jsx';
import CalendarViewPage from './CalendarViewPage.jsx';
import ChaletCalendarTab from '../components/Chalets/ChaletCalendarTab.jsx';
import { GetOwnerChaletsUseCase } from '../../core/useCases/ChaletUseCases.js';
import { Skeleton } from '../components/Skeleton.jsx';

/**
 * CalendarPage
 * Single entry point for availability management, reached from the sidebar's
 * "Calendar" item. Lets the owner switch between their Buildings' flats and
 * their Chalets instead of the two living in different places — the flat
 * calendar (CalendarViewPage) is untouched, chalets reuse ChaletCalendarTab
 * with a chalet picker of their own.
 */
export default function CalendarPage({ building }) {
    const { t, lang } = useTranslation();
    const isRTL = lang === 'ar';

    const [viewType, setViewType] = useState('buildings');
    const [chalets, setChalets] = useState([]);
    const [loadingChalets, setLoadingChalets] = useState(false);
    const [selectedChaletId, setSelectedChaletId] = useState(null);

    // Lets the Dashboard onboarding checklist know this owner has actually
    // opened the Calendar at least once — there's no dedicated "viewed"
    // endpoint, so a simple local flag is enough.
    useEffect(() => {
        localStorage.setItem('shleeh_visited_calendar', 'true');
    }, []);

    useEffect(() => {
        if (viewType !== 'chalets' || chalets.length > 0) return;
        let cancelled = false;
        setLoadingChalets(true);
        GetOwnerChaletsUseCase.execute()
            .then((list) => {
                if (cancelled) return;
                const safeList = Array.isArray(list) ? list : [];
                setChalets(safeList);
                if (safeList.length > 0) setSelectedChaletId(safeList[0].id);
            })
            .catch((err) => console.error('[CalendarPage] Failed to load chalets:', err))
            .finally(() => { if (!cancelled) setLoadingChalets(false); });
        return () => { cancelled = true; };
    }, [viewType, chalets.length]);

    const switchBtnStyle = (active, warm) => ({
        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px',
        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
        border: active ? `1.5px solid ${warm ? '#c2680f' : '#185FA5'}` : '1px solid #d1d5db',
        background: active ? (warm ? '#fdf0e2' : '#e6f1fb') : '#fff',
        color: active ? (warm ? '#9c5209' : '#185FA5') : '#374151',
    });

    return (
        <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <button type="button" onClick={() => setViewType('buildings')} style={switchBtnStyle(viewType === 'buildings', false)}>
                    <i className="fa-solid fa-city" /> {t('nav_buildings') || 'Buildings'}
                </button>
                <button type="button" onClick={() => setViewType('chalets')} style={switchBtnStyle(viewType === 'chalets', true)}>
                    <i className="fa-solid fa-house-chimney" /> {t('nav_chalets') || 'Chalets'}
                </button>
            </div>

            {viewType === 'buildings' ? (
                <CalendarViewPage building={building} />
            ) : (
                <div style={{ maxWidth: '900px' }}>
                    <div style={{
                        padding: '14px 18px',
                        background: 'linear-gradient(135deg, #fdf3e7 0%, #fdf0e2 100%)',
                        borderRadius: '12px',
                        border: '1px solid #f3d9b3',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        flexWrap: 'wrap',
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                    }}>
                        <label style={{ fontWeight: 600, color: '#9c5209', fontSize: '14px' }}>{t('select_chalet') || 'Select Chalet'}:</label>
                        {loadingChalets ? (
                            <Skeleton width="220px" height="42px" style={{ borderRadius: '8px' }} />
                        ) : chalets.length > 0 ? (
                            <select
                                value={selectedChaletId || ''}
                                onChange={(e) => setSelectedChaletId(Number(e.target.value))}
                                style={{ flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #f0c890', fontSize: '14px', background: '#fff', color: '#111827' }}
                            >
                                {chalets.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        ) : (
                            <span style={{ fontSize: '14px', color: '#9ca3af' }}>{t('no_chalets') || 'No chalets added yet'}</span>
                        )}
                    </div>

                    {!loadingChalets && chalets.length === 0 && (
                        <div className="empty-state">
                            <i className="ti ti-home-2 empty-state__icon" />
                            <p className="empty-state__text">{t('add_a_chalet_first') || 'Add a chalet first, then come back here to manage its availability.'}</p>
                        </div>
                    )}

                    {selectedChaletId && (
                        <ChaletCalendarTab chaletId={selectedChaletId} t={t} lang={lang} />
                    )}
                </div>
            )}
        </div>
    );
}
