import React, { useCallback, useEffect, useState } from 'react';
import { IconBrain } from '@tabler/icons-react';
import { useTranslation } from '../context/LanguageContext';
import { GetOwnerBuildingsUseCase } from '../../core/useCases/GetOwnerBuildingsUseCase.js';
import { GetOwnerBuildingsFlatUseCase } from '../../core/useCases/GetBuildingsFlatUseCase.js';
import { GetFlatBookingsWithDetailsUseCase } from '../../core/useCases/GetFlatBookingStatsUseCase.js';
import { GetOwnerChaletsUseCase, FetchChaletBookingsUseCase } from '../../core/useCases/ChaletUseCases.js';
import { BookingDetailsEntity } from '../../core/entities/BookingDetailsEntity.js';
import RialSymbol from '../components/OmaniRial.jsx';
import { MiniBarChart, DonutChart } from '../components/MiniCharts.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import OnboardingChecklist from '../components/OnboardingChecklist.jsx';

// Bound how many flats we fetch full booking history for — there's no
// owner-wide bookings endpoint for buildings (see the API gaps note), so this
// is done as one call per flat. Capped to keep the dashboard responsive.
const MAX_FLATS_FOR_STATS = 25;
// Chalets DO have an owner-wide endpoint, but we still only pull one page for
// the paid/unpaid breakdown & recent list (rowCount gives the true total).
const CHALET_SAMPLE_SIZE = 50;

const PAID_COLOR = '#10b981';
const PARTIAL_COLOR = '#f59e0b';
const UNPAID_COLOR = '#ef4444';

// Smart loading: the dashboard is built from ~30 sequential-ish API calls
// (buildings → flats → per-flat bookings) with no dedicated stats endpoint.
// Rather than one blocking spinner, data streams in over three stages —
// core (buildings/chalets/chalet bookings), flats, then per-flat stats — and
// each part of the UI renders as soon as ITS data is ready. A short in-memory
// cache also makes revisiting the tab during the same session instant, with
// a silent background refresh to keep numbers current.
const CACHE_TTL_MS = 2 * 60 * 1000;
let dashboardCache = null; // { timestamp, buildings, chalets, flatsCountByBuilding, totalFlats, buildingBookings, buildingBookingsTotal, buildingStatsTruncated, chaletBookings, chaletBookingsTotal }

function paymentBucketOf(entity) {
    const status = entity.getPaymentStatus();
    if (status === 'Fully Paid') return 'paid';
    if (status === 'Partially Paid') return 'partial';
    return 'unpaid';
}

// A remembered dashboardCache (even a stale one) is hydrated straight into
// initial state below — no spinner flash on revisit — while a fresh copy is
// only re-fetched in the background if it's actually past its TTL.
const hasCache = () => !!dashboardCache;
const cacheIsFresh = () => !!dashboardCache && (Date.now() - dashboardCache.timestamp) < CACHE_TTL_MS;

export default function Dashboard({ onNavigate }) {
    const { t, lang } = useTranslation();
    const isRTL = lang === 'ar';

    const [coreLoading, setCoreLoading] = useState(() => !hasCache());
    const [flatsLoading, setFlatsLoading] = useState(() => !hasCache());
    const [statsLoading, setStatsLoading] = useState(() => !hasCache());
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(() => dashboardCache ? new Date(dashboardCache.timestamp) : null);
    const [error, setError] = useState(null);
    const [now, setNow] = useState(() => Date.now());

    const [buildings, setBuildings] = useState(() => dashboardCache?.buildings || []);
    const [flatsCountByBuilding, setFlatsCountByBuilding] = useState(() => dashboardCache?.flatsCountByBuilding || {});
    const [totalFlats, setTotalFlats] = useState(() => dashboardCache?.totalFlats || 0);
    const [chalets, setChalets] = useState(() => dashboardCache?.chalets || []);

    const [buildingBookings, setBuildingBookings] = useState(() => dashboardCache?.buildingBookings || []); // BookingDetailsEntity[]
    const [buildingBookingsTotal, setBuildingBookingsTotal] = useState(() => dashboardCache?.buildingBookingsTotal || 0);
    const [buildingStatsTruncated, setBuildingStatsTruncated] = useState(() => dashboardCache?.buildingStatsTruncated || false);

    const [chaletBookings, setChaletBookings] = useState(() => dashboardCache?.chaletBookings || []); // BookingDetailsEntity[]
    const [chaletBookingsTotal, setChaletBookingsTotal] = useState(() => dashboardCache?.chaletBookingsTotal || 0);

    const [recentView, setRecentView] = useState('chalets'); // 'chalets' | 'buildings'

    // Live "Updated Xs ago" ticker — reads from state (set via an effect timer)
    // rather than calling Date.now() during render.
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 15000);
        return () => clearInterval(id);
    }, []);

    const load = useCallback(async ({ silent = false, isCancelled }) => {
        if (!silent) {
            setCoreLoading(true);
            setFlatsLoading(true);
            setStatsLoading(true);
        }
        setError(null);

        try {
            // ── Stage 1: fast, top-level data → renders KPIs/lists immediately ──
            const [buildingsList, chaletsList, chaletBookingsRes] = await Promise.all([
                GetOwnerBuildingsUseCase.execute(),
                GetOwnerChaletsUseCase.execute(),
                FetchChaletBookingsUseCase.execute(1, CHALET_SAMPLE_SIZE, t),
            ]);
            if (isCancelled()) return;

            const safeBuildings = Array.isArray(buildingsList) ? buildingsList : [];
            const safeChalets = Array.isArray(chaletsList) ? chaletsList : [];
            const chaletRaw = chaletBookingsRes?.result?.bookings || [];
            const chaletEntities = chaletRaw.map((b) => new BookingDetailsEntity(b));
            const chaletTotal = chaletBookingsRes?.result?.rowCount || 0;

            setBuildings(safeBuildings);
            setChalets(safeChalets);
            setChaletBookings(chaletEntities);
            setChaletBookingsTotal(chaletTotal);
            setCoreLoading(false);

            // ── Stage 2: flats per building → fills in Total Flats + building list counts ──
            const flatsResults = await Promise.all(safeBuildings.map(async (b) => {
                try {
                    const list = await GetOwnerBuildingsFlatUseCase.execute(b.id);
                    return { buildingId: b.id, flats: Array.isArray(list) ? list : [] };
                } catch {
                    return { buildingId: b.id, flats: [] };
                }
            }));
            if (isCancelled()) return;

            const counts = {};
            let allFlats = [];
            flatsResults.forEach(({ buildingId, flats: fl }) => {
                counts[buildingId] = fl.length;
                allFlats = allFlats.concat(fl.map((f) => ({ ...f, buildingId })));
            });
            const truncated = allFlats.length > MAX_FLATS_FOR_STATS;

            setFlatsCountByBuilding(counts);
            setTotalFlats(allFlats.length);
            setBuildingStatsTruncated(truncated);
            setFlatsLoading(false);

            // ── Stage 3: per-flat booking details (bounded) → building charts/stats/recent list ──
            const flatsForStats = allFlats.slice(0, MAX_FLATS_FOR_STATS);
            const flatStatsResults = await Promise.all(
                flatsForStats.map((f) => GetFlatBookingsWithDetailsUseCase.execute(f.id, 200))
            );
            if (isCancelled()) return;

            let mergedBuildingBookings = [];
            let totalRowCount = 0;
            flatStatsResults.forEach((r) => {
                mergedBuildingBookings = mergedBuildingBookings.concat(r.bookings);
                totalRowCount += r.rowCount;
            });

            setBuildingBookings(mergedBuildingBookings);
            setBuildingBookingsTotal(totalRowCount);
            setStatsLoading(false);

            const timestamp = Date.now();
            dashboardCache = {
                timestamp,
                buildings: safeBuildings,
                chalets: safeChalets,
                flatsCountByBuilding: counts,
                totalFlats: allFlats.length,
                buildingBookings: mergedBuildingBookings,
                buildingBookingsTotal: totalRowCount,
                buildingStatsTruncated: truncated,
                chaletBookings: chaletEntities,
                chaletBookingsTotal: chaletTotal,
            };
            setLastUpdated(new Date(timestamp));
        } catch (err) {
            if (!isCancelled()) {
                setError(err.message || 'Failed to load dashboard data');
                setCoreLoading(false);
                setFlatsLoading(false);
                setStatsLoading(false);
            }
        }
    }, [t]);

    useEffect(() => {
        let cancelled = false;
        const isCancelled = () => cancelled;

        // Initial state above already hydrated from any cached snapshot (lazy
        // useState initializers) — this effect only decides whether a fetch
        // is still needed: a full one if there's no cache yet, a silent
        // background one if the cache is stale, or none at all if it's fresh.
        if (!hasCache()) {
            load({ silent: false, isCancelled });
        } else if (!cacheIsFresh()) {
            load({ silent: true, isCancelled });
        }

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRefresh = () => {
        let cancelled = false;
        setRefreshing(true);
        load({ silent: true, isCancelled: () => cancelled }).finally(() => setRefreshing(false));
    };

    // ──── Derived stats ────
    const buildingBuckets = { paid: 0, partial: 0, unpaid: 0 };
    let buildingRevenue = 0, buildingPaidAmount = 0;
    buildingBookings.forEach((b) => {
        buildingBuckets[paymentBucketOf(b)]++;
        buildingRevenue += b.getTotalCost();
        buildingPaidAmount += b.paidAmount;
    });

    const chaletBuckets = { paid: 0, partial: 0, unpaid: 0 };
    let chaletRevenue = 0, chaletPaidAmount = 0;
    chaletBookings.forEach((b) => {
        chaletBuckets[paymentBucketOf(b)]++;
        chaletRevenue += b.getTotalCost();
        chaletPaidAmount += b.paidAmount;
    });

    const combinedBuckets = {
        paid: buildingBuckets.paid + chaletBuckets.paid,
        partial: buildingBuckets.partial + chaletBuckets.partial,
        unpaid: buildingBuckets.unpaid + chaletBuckets.unpaid,
    };

    const recentBuildingBookings = [...buildingBookings]
        .sort((a, b) => new Date(b.createdDate || 0) - new Date(a.createdDate || 0))
        .slice(0, 6);
    const recentChaletBookings = chaletBookings.slice(0, 6);
    const recentList = recentView === 'chalets' ? recentChaletBookings : recentBuildingBookings;
    const recentListLoading = recentView === 'chalets' ? coreLoading : statsLoading;

    const switchBtnStyle = (active, warm) => ({
        display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px',
        fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
        border: active ? `1.5px solid ${warm ? '#c2680f' : '#185FA5'}` : '1px solid #d1d5db',
        background: active ? (warm ? '#fdf0e2' : '#e6f1fb') : '#fff',
        color: active ? (warm ? '#9c5209' : '#185FA5') : '#374151',
    });

    const secondsAgo = lastUpdated ? Math.max(0, Math.round((now - lastUpdated.getTime()) / 1000)) : null;
    const updatedLabel = secondsAgo === null ? '' : secondsAgo < 60
        ? `${t('updated') || 'Updated'} ${secondsAgo}${t('seconds_ago_suffix') || 's ago'}`
        : `${t('updated') || 'Updated'} ${Math.round(secondsAgo / 60)}${t('minutes_ago_suffix') || 'm ago'}`;

    // ──── Onboarding checklist derived state ────
    const hasProperty = buildings.length > 0 || chalets.length > 0;
    const hasFlats = totalFlats > 0 || (buildings.length === 0 && chalets.length > 0);
    const hasVisitedCalendar = localStorage.getItem('shleeh_visited_calendar') === 'true';
    const hasBooking = buildingBookingsTotal > 0 || chaletBookingsTotal > 0;

    return (
        <div className="dashboard-view-wrapper">
            {error && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                    {error}
                </div>
            )}

            {!coreLoading && (
                <OnboardingChecklist
                    t={t}
                    isRTL={isRTL}
                    hasProperty={hasProperty}
                    hasFlats={hasFlats}
                    hasVisitedCalendar={hasVisitedCalendar}
                    hasBooking={hasBooking}
                    onNavigate={onNavigate}
                />
            )}

            {/* Refresh row */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                {lastUpdated && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{updatedLabel}</span>}
                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing || coreLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: '12.5px', cursor: refreshing || coreLoading ? 'default' : 'pointer' }}
                >
                    <i className={`fa-solid fa-arrows-rotate ${refreshing ? 'dash-spin' : ''}`} />
                    {t('refresh') || 'Refresh'}
                </button>
            </div>

            {/* KPI Row */}
            <div className="kpi-row">
                <div className="kpi-card" style={{ cursor: coreLoading ? 'default' : 'pointer' }} onClick={() => !coreLoading && onNavigate?.('buildings')}>
                    <div className="kpi-title">{t('nav_buildings') || 'Buildings'}</div>
                    <div className="kpi-value">{coreLoading ? <Skeleton width="40px" height="28px" /> : buildings.length}</div>
                </div>
                <div className="kpi-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div className="kpi-title">{t('total_flats') || 'Total Flats'}</div>
                    <div className="kpi-value">{flatsLoading ? <Skeleton width="40px" height="28px" /> : totalFlats}</div>
                </div>
                <div className="kpi-card" style={{ borderLeft: '4px solid #c2680f', cursor: coreLoading ? 'default' : 'pointer' }} onClick={() => !coreLoading && onNavigate?.('chalets')}>
                    <div className="kpi-title">{t('nav_chalets') || 'Chalets'}</div>
                    <div className="kpi-value">{coreLoading ? <Skeleton width="40px" height="28px" /> : chalets.length}</div>
                </div>
                <div className="kpi-card" style={{ borderLeft: '4px solid var(--primary)', cursor: statsLoading ? 'default' : 'pointer' }} onClick={() => !statsLoading && onNavigate?.('bookings-list')}>
                    <div className="kpi-title">{t('building_bookings') || 'Building Bookings'}</div>
                    <div className="kpi-value">{statsLoading ? <Skeleton width="40px" height="28px" /> : buildingBookingsTotal}</div>
                </div>
                <div className="kpi-card" style={{ borderLeft: '4px solid #c2680f', cursor: coreLoading ? 'default' : 'pointer' }} onClick={() => !coreLoading && onNavigate?.('bookings-list')}>
                    <div className="kpi-title">{t('chalet_bookings') || 'Chalet Bookings'}</div>
                    <div className="kpi-value">{coreLoading ? <Skeleton width="40px" height="28px" /> : chaletBookingsTotal}</div>
                </div>
            </div>

            <p style={{ marginTop: '-16px', marginBottom: '16px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                {t('dashboard_buildings_stats_note') ||
                    "Building booking stats are computed from the first " + MAX_FLATS_FOR_STATS + " flats (no owner-wide bookings endpoint exists for buildings yet — see the API notes shared separately)."}
                {buildingStatsTruncated ? ` (${t('based_on_first_flats') || 'based on first'} ${MAX_FLATS_FOR_STATS} ${t('flats') || 'flats'})` : ''}
            </p>

            {/* Preliminary stats / AI roadmap note */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    background: 'linear-gradient(135deg, #f2eefc 0%, #eaf1fb 100%)',
                    border: '1px solid #e0d9f7',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    marginBottom: '28px',
                }}
            >
                <IconBrain size={22} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#3b2166' }}>
                            {t('dashboard_stats_preliminary_title') || 'Preliminary statistics'}
                        </span>
                        <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#7c3aed', background: '#e9defc', padding: '2px 9px', borderRadius: '999px' }}>
                            {t('dashboard_stats_preliminary_badge') || 'Coming soon'}
                        </span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#4b3b73' }}>
                        {t('dashboard_stats_preliminary_desc') ||
                            "What you see below is an early version. We're working on a major upgrade that will bring AI-powered predictions, deeper analytics, and smart recommended actions based on your data."}
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="dashboard-grid">
                <div className="card-panel">
                    <div className="panel-title">{t('bookings_overview') || 'Bookings Overview'}</div>
                    {(coreLoading || statsLoading) ? (
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', height: '160px', padding: '8px 4px' }}>
                            <Skeleton width="56px" height="90px" style={{ borderRadius: '8px 8px 2px 2px' }} />
                            <Skeleton width="56px" height="130px" style={{ borderRadius: '8px 8px 2px 2px' }} />
                        </div>
                    ) : (
                        <MiniBarChart
                            data={[
                                { label: t('nav_buildings') || 'Buildings', value: buildingBookingsTotal, color: '#185FA5' },
                                { label: t('nav_chalets') || 'Chalets', value: chaletBookingsTotal, color: '#c2680f' },
                            ]}
                        />
                    )}
                </div>
                <div className="card-panel">
                    <div className="panel-title">{t('payment_status') || 'Payment Status'}</div>
                    {(coreLoading || statsLoading) ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <Skeleton width="140px" height="140px" style={{ borderRadius: '50%' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                                <Skeleton width="80%" height="12px" />
                                <Skeleton width="60%" height="12px" />
                                <Skeleton width="70%" height="12px" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <DonutChart
                                data={[
                                    { label: t('fully_paid') || 'Fully paid', value: combinedBuckets.paid, color: PAID_COLOR },
                                    { label: t('partially_paid') || 'Partially paid', value: combinedBuckets.partial, color: PARTIAL_COLOR },
                                    { label: t('not_paid') || 'Not paid', value: combinedBuckets.unpaid, color: UNPAID_COLOR },
                                ]}
                                emptyLabel={t('no_bookings') || 'No bookings'}
                            />
                            <p style={{ marginTop: '14px', marginBottom: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                                {t('payment_status_sample_note') || 'Based on the bookings loaded above, not full history.'}
                            </p>
                        </>
                    )}
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Left Column */}
                <div>
                    <div className="card-panel" style={{ padding: 0 }}>
                        <div className="panel-title" style={{ padding: '32px 32px 16px 32px', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', gap: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <span>{t('recent_bookings') || 'Recent Bookings'}</span>
                                <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '12.5px' }} onClick={() => onNavigate?.('bookings-list')}>
                                    {t('view_all') || 'View all'}
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setRecentView('chalets')} style={switchBtnStyle(recentView === 'chalets', true)}>
                                    <i className="fa-solid fa-house-chimney" /> {t('nav_chalets') || 'Chalets'}
                                </button>
                                <button type="button" onClick={() => setRecentView('buildings')} style={switchBtnStyle(recentView === 'buildings', false)}>
                                    <i className="fa-solid fa-city" /> {t('nav_buildings') || 'Buildings'}
                                </button>
                            </div>
                        </div>
                        {recentListLoading ? (
                            <div style={{ padding: '0 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[0, 1, 2, 3].map((i) => <Skeleton key={i} height="36px" style={{ borderRadius: '8px' }} />)}
                            </div>
                        ) : recentList.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('customer_name') || 'Customer'}</th>
                                        <th>{t('phone') || 'Phone'}</th>
                                        <th>{t('cost') || 'Cost'}</th>
                                        <th>{t('days_count') || 'Days'}</th>
                                        <th>{t('status') || 'Status'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentList.map((b) => {
                                        const bucket = paymentBucketOf(b);
                                        const badgeColor = bucket === 'paid' ? PAID_COLOR : bucket === 'partial' ? PARTIAL_COLOR : UNPAID_COLOR;
                                        return (
                                            <tr key={b.id}>
                                                <td>{b.name}</td>
                                                <td>{b.phone}</td>
                                                <td>{b.getTotalCost()} <RialSymbol style={{ width: '0.8em', height: '0.8em' }} /></td>
                                                <td>{b.daysCount}</td>
                                                <td>
                                                    <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, color: badgeColor, background: `${badgeColor}1a`, border: `1px solid ${badgeColor}55` }}>
                                                        {t(bucket === 'paid' ? 'fully_paid' : bucket === 'partial' ? 'partially_paid' : 'not_paid') ||
                                                            (bucket === 'paid' ? 'Fully paid' : bucket === 'partial' ? 'Partially paid' : 'Not paid')}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ padding: '0 32px 32px 32px', color: 'var(--slate-400)' }}>{t('no_upcoming_bookings') || 'No bookings yet'}</p>
                        )}
                        {!recentListLoading && recentList.length > 0 && (
                            <p style={{ padding: '0 32px 24px 32px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                                {recentView === 'chalets'
                                    ? `${t('revenue') || 'Revenue'}: ${chaletRevenue.toFixed(2)} ${t('OMR') || 'OMR'} (${t('paid') || 'paid'}: ${chaletPaidAmount.toFixed(2)})`
                                    : `${t('revenue') || 'Revenue'}: ${buildingRevenue.toFixed(2)} ${t('OMR') || 'OMR'} (${t('paid') || 'paid'}: ${buildingPaidAmount.toFixed(2)})`}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div>
                    <div className="card-panel">
                        <div className="panel-title">{t('nav_buildings') || 'Buildings'}</div>
                        {coreLoading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[0, 1, 2].map((i) => <Skeleton key={i} height="20px" />)}
                            </div>
                        ) : buildings.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {buildings.map((b) => (
                                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                                        <span>{b.name}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>
                                            {flatsLoading ? <Skeleton width="50px" height="12px" /> : `${flatsCountByBuilding[b.id] ?? '—'} ${t('flats') || 'flats'}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>
                                <p style={{ color: 'var(--slate-400)', fontSize: '13.5px', margin: '0 0 8px 0' }}>{t('no_buildings') || 'No buildings yet'}</p>
                                <button type="button" onClick={() => onNavigate?.('buildings')} style={{ background: 'none', border: 'none', color: '#185FA5', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                                    + {t('add_building') || 'Add Building'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="card-panel">
                        <div className="panel-title">{t('nav_chalets') || 'Chalets'}</div>
                        {coreLoading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[0, 1, 2].map((i) => <Skeleton key={i} height="20px" />)}
                            </div>
                        ) : chalets.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {chalets.map((c) => (
                                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                                        <span>{c.name}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>{c.rentFullDay} {t('OMR') || 'OMR'}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>
                                <p style={{ color: 'var(--slate-400)', fontSize: '13.5px', margin: '0 0 8px 0' }}>{t('no_chalets') || 'No chalets yet'}</p>
                                <button type="button" onClick={() => onNavigate?.('chalets')} style={{ background: 'none', border: 'none', color: '#c2680f', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                                    + {t('add_chalet') || 'Add Chalet'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
