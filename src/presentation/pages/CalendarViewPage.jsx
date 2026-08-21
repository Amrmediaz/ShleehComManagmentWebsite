import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useCalendarView } from '../hooks/useCalendarView.js';
import { GetOwnerBuildingsFlatUseCase } from '../../core/useCases/GetBuildingsFlatUseCase.js';
import { IconChevronLeft, IconChevronRight, IconLock, IconLockOpen, IconPencil, IconChecks, IconX, IconSquareCheck } from '@tabler/icons-react';
import '../styles/Buildingdetails.css';

// ---------------------------------------------------------------------------
// Backend now supports true per-date units count:
//   { buldingID, days: [{ day: 'DD/MM/YYYY', unitsCount }, ...] }
// Every blocked date has its own independent units count — editing one date
// never touches any other date's count.
//
// Interaction model:
//   Single mode (default):
//     - Click an available date → modal to block it, pick a units count.
//     - Click a blocked date     → modal shows THAT date's own units count,
//       editable, plus an unblock button.
//     - Click a booked/past date → explanatory status message, nothing else.
//
//   Multi-select mode (toggle "Select multiple"):
//     - Click any number of available OR blocked dates to select them
//       (booked/past dates still can't be selected).
//     - A selection bar appears with the count and the relevant bulk
//       action(s):
//         * all selected dates are available → "Block N days" (pick one
//           units count applied to all of them at once)
//         * all selected dates are blocked   → "Unblock N days"
//         * mixed selection                  → both actions are disabled,
//           with a hint to select same-type dates
//     - Both bulk actions reuse the exact same block/unblock API calls as
//       the single-day flow (blockMultipleDays / unblockMultipleDays), so
//       every other date's count stays untouched.
// ---------------------------------------------------------------------------

/*
  NOTE: keep whatever import statements your real file already had at the top
  (useTranslation, your icon imports, GetOwnerBuildingsFlatUseCase, useCalendarView, etc).
  Those weren't shown in your original paste, so they aren't reproduced here —
  everything else below is complete and self-contained, nothing abbreviated.
*/

export default function CalendarViewPage({ building }) {
    const { t, lang } = useTranslation();

    const [flats, setFlats] = useState([]);
    const [selectedFlatId, setSelectedFlatId] = useState(null);
    const [loadingFlats, setLoadingFlats] = useState(false);

    const [dayModal, setDayModal] = useState({ open: false, mode: 'block', dateStr: null, count: '1' });

    const [multiSelectMode, setMultiSelectMode] = useState(false);
    const [selectedDates, setSelectedDates] = useState(new Set());

    const {
        currentDate,
        prevMonth,
        nextMonth,
        goToToday,
        blockedDays,
        bookedDates,
        isProcessing,
        statusMessage,
        setStatusMessage,
        blockDay,
        unblockDay,
        blockMultipleDays,
        unblockMultipleDays,
        isDateBlocked,
        isDateBooked,
        getBlockedUnitsForDate,
        isPastDate,
    } = useCalendarView(selectedFlatId, building?.id || building?.raw?.id);

    useEffect(() => {
        if (!building?.id && !building?.raw?.id) return;

        const loadFlats = async () => {
            setLoadingFlats(true);
            try {
                const buildingId = building?.id || building?.raw?.id;
                const result = await GetOwnerBuildingsFlatUseCase.execute(buildingId);
                const flatsData = Array.isArray(result) ? result : [];
                setFlats(flatsData);
                if (flatsData.length > 0 && !selectedFlatId) {
                    setSelectedFlatId(flatsData[0].id);
                }
            } catch (error) {
                console.error('[CalendarViewPage] Error loading flats:', error);
            } finally {
                setLoadingFlats(false);
            }
        };

        loadFlats();
    }, [building?.id, building?.raw?.id]);

    useEffect(() => {
        if (!multiSelectMode) setSelectedDates(new Set());
    }, [multiSelectMode]);

    useEffect(() => {
        setSelectedDates(new Set());
    }, [selectedFlatId]);

    const getMonthName = () => {
        if (lang === 'ar') {
            const arabicMonths = [
                'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
            ];
            return `${arabicMonths[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        }
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const getDayNames = () => {
        if (lang === 'ar') {
            return ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        }
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    };

    const formatDateDisplay = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        if (lang === 'ar') {
            return new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
        }
        return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
    for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);

    const dayNames = getDayNames();
    const monthName = getMonthName();

    const formatDate = (day) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const selectedFlat = flats.find(f => f.id === selectedFlatId);
    const isRTL = lang === 'ar';

    const maxUnitsForFlat = selectedFlat?.unitsCount || selectedFlat?.unitCount || undefined;

    const toggleMultiSelectMode = () => {
        if (isProcessing) return;
        setMultiSelectMode(prev => !prev);
    };

    const toggleDateSelection = (dateStr) => {
        setSelectedDates(prev => {
            const next = new Set(prev);
            if (next.has(dateStr)) next.delete(dateStr);
            else next.add(dateStr);
            return next;
        });
    };

    const clearSelection = () => setSelectedDates(new Set());

    const selectedArray = Array.from(selectedDates);
    const selectedBlockedCount = selectedArray.filter(d => isDateBlocked(d)).length;
    const selectedAvailableCount = selectedArray.length - selectedBlockedCount;
    const hasMixedSelection = selectedArray.length > 0 && selectedBlockedCount > 0 && selectedAvailableCount > 0;
    const canBulkBlock = selectedArray.length > 0 && selectedBlockedCount === 0;
    const canBulkUnblock = selectedArray.length > 0 && selectedAvailableCount === 0;

    const openBlockModal = (dateStr) => {
        setDayModal({ open: true, mode: 'block', dateStr, count: '1' });
    };

    const openEditModal = (dateStr) => {
        const current = getBlockedUnitsForDate(dateStr) || 1;
        setDayModal({ open: true, mode: 'blocked', dateStr, count: String(current) });
    };

    const openMultiBlockModal = () => {
        if (!canBulkBlock) return;
        setDayModal({ open: true, mode: 'block-multi', dateStr: null, count: '1' });
    };

    const closeModal = () => {
        setDayModal({ open: false, mode: 'block', dateStr: null, count: '1' });
    };

    const clampUnits = (value, max) => {
        let num = parseInt(value, 10);
        if (Number.isNaN(num) || num < 1) num = 1;
        if (max && num > max) num = max;
        return num;
    };

    const handleModalUnitsChange = (e) => {
        const val = e.target.value;
        if (val === '' || /^[0-9]+$/.test(val)) {
            setDayModal(prev => ({ ...prev, count: val }));
        }
    };

    const handleModalUnitsBlur = () => {
        setDayModal(prev => ({ ...prev, count: String(clampUnits(prev.count, maxUnitsForFlat)) }));
    };

    const stepModalUnits = (delta) => {
        setDayModal(prev => ({
            ...prev,
            count: String(clampUnits((parseInt(prev.count, 10) || 1) + delta, maxUnitsForFlat)),
        }));
    };

    const confirmModal = async () => {
        if (dayModal.mode === 'block-multi') {
            const dates = Array.from(selectedDates);
            if (dates.length === 0) { closeModal(); return; }
            await blockMultipleDays(dates, clampUnits(dayModal.count, maxUnitsForFlat));
            closeModal();
            clearSelection();
            return;
        }
        const { dateStr, count } = dayModal;
        if (!dateStr) return;
        await blockDay(dateStr, clampUnits(count, maxUnitsForFlat));
        closeModal();
    };

    const handleUnblockFromModal = async () => {
        const { dateStr } = dayModal;
        if (!dateStr) return;
        await unblockDay(dateStr);
        closeModal();
    };

    const handleBulkUnblock = async () => {
        if (!canBulkUnblock) return;
        const dates = Array.from(selectedDates);
        await unblockMultipleDays(dates);
        clearSelection();
    };

    const sortedBlockedDays = [...blockedDays].sort((a, b) => a.date.localeCompare(b.date));

    const styles = {
        container: {
            padding: '24px',
            maxWidth: '1300px',
            margin: '0 auto',
            direction: isRTL ? 'rtl' : 'ltr',
            textAlign: isRTL ? 'right' : 'left',
            fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        },
        header: {
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '2px solid #f3f4f6',
        },
        title: {
            fontSize: '24px',
            fontWeight: 700,
            color: '#111827',
            margin: '0 0 4px 0',
            letterSpacing: '-0.3px',
        },
        subtitle: {
            fontSize: '14px',
            color: '#6b7280',
            margin: 0,
        },
        selectorSection: {
            padding: '14px 18px',
            background: 'linear-gradient(135deg, #f8faff 0%, #f1f5ff 100%)',
            borderRadius: '12px',
            border: '1px solid #dbeafe',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexDirection: isRTL ? 'row-reverse' : 'row',
        },
        selectorLabel: {
            fontWeight: 600,
            color: '#1e40af',
            minWidth: '90px',
            fontSize: '14px',
        },
        select: {
            flex: 1,
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1.5px solid #bfdbfe',
            fontSize: '14px',
            background: 'white',
            color: '#111827',
            cursor: 'pointer',
            direction: isRTL ? 'rtl' : 'ltr',
            textAlign: isRTL ? 'right' : 'left',
            outline: 'none',
        },
        hintBanner: {
            fontSize: '13.5px',
            color: '#1e40af',
            margin: '0 0 14px 0',
            fontWeight: 500,
            padding: '12px 16px',
            background: '#eff6ff',
            borderRadius: '10px',
            border: '1px solid #bfdbfe',
            lineHeight: 1.6,
        },
        multiToggleRow: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            marginBottom: '16px',
            flexDirection: isRTL ? 'row-reverse' : 'row',
        },
        multiToggleBtn: (active) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '9px 14px',
            borderRadius: '9px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            border: active ? '1.5px solid #185FA5' : '1.5px solid #d1d5db',
            background: active ? '#185FA5' : 'white',
            color: active ? 'white' : '#374151',
            flexDirection: isRTL ? 'row-reverse' : 'row',
        }),
        selectionBar: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '10px 16px',
            borderRadius: '10px',
            background: '#111827',
            color: 'white',
            marginBottom: '16px',
            flexDirection: isRTL ? 'row-reverse' : 'row',
            flexWrap: 'wrap',
        },
        selectionCount: {
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        selectionActions: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexDirection: isRTL ? 'row-reverse' : 'row',
        },
        pillBtn: (variant, disabled) => {
            const variants = {
                block: { background: disabled ? '#93c5fd' : '#2563eb', color: 'white' },
                unblock: { background: disabled ? '#fca5a5' : '#dc2626', color: 'white' },
                clear: { background: 'rgba(255,255,255,0.12)', color: 'white' },
            };
            return {
                ...variants[variant],
                border: 'none',
                padding: '7px 12px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
            };
        },
        calendarWrapper: {
            display: 'grid',
            // Always '1fr 300px' — do NOT swap these for RTL. CSS Grid already
            // mirrors track position automatically under direction:rtl (track 1
            // renders on the physical right instead of the left). Swapping the
            // sizes here on top of that double-flips it, forcing the calendar
            // (first element) into the small 300px track instead of the large one.
            gridTemplateColumns: '1fr 300px',
            gap: '20px',
            marginBottom: '24px',
            alignItems: 'start',
        },
        calendarSection: {
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            padding: '22px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        },
        calendarNav: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            flexDirection: isRTL ? 'row-reverse' : 'row',
        },
        monthTitle: {
            fontSize: '18px',
            fontWeight: 700,
            color: '#111827',
            margin: 0,
        },
        navButtons: {
            display: 'flex',
            gap: '6px',
            flexDirection: isRTL ? 'row-reverse' : 'row',
        },
        navButton: {
            padding: '7px 12px',
            borderRadius: '8px',
            border: '1.5px solid #e5e7eb',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#374151',
            fontWeight: 500,
            fontSize: '13px',
        },
        calendarGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px',
        },
        dayHead: {
            fontSize: '11px',
            fontWeight: 700,
            color: '#9ca3af',
            textAlign: 'center',
            padding: '8px 4px',
            textTransform: 'uppercase',
        },
        dayCell: (bg, color, border, cursor, opacity) => ({
            position: 'relative',
            padding: '8px 4px',
            textAlign: 'center',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor,
            background: bg,
            color,
            minHeight: '46px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border,
            userSelect: 'none',
            opacity,
            transition: 'box-shadow 0.12s ease, transform 0.12s ease',
        }),
        unitsBadge: {
            position: 'absolute',
            top: '2px',
            insetInlineEnd: '4px',
            fontSize: '9px',
            fontWeight: 700,
            background: '#c2410c',
            color: 'white',
            borderRadius: '999px',
            padding: '1px 4px',
            lineHeight: 1.4,
        },
        selectedCheckBadge: {
            position: 'absolute',
            top: '2px',
            insetInlineStart: '4px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: '#185FA5',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        sidebar: {
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
        },
        sidebarCard: {
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '16px',
            textAlign: isRTL ? 'right' : 'left',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        },
        cardTitle: {
            fontSize: '13px',
            fontWeight: 700,
            color: '#111827',
            margin: '0 0 12px 0',
            paddingBottom: '8px',
            borderBottom: '1px solid #f3f4f6',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
        },
        legend: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        },
        legendItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: '#4b5563',
            flexDirection: isRTL ? 'row-reverse' : 'row',
        },
        legendColor: (color, extra = {}) => ({
            width: '16px',
            height: '16px',
            borderRadius: '4px',
            background: color,
            flexShrink: 0,
            border: '1px solid rgba(0,0,0,0.08)',
            ...extra,
        }),
        statusMessage: (isError) => ({
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 500,
            background: isError ? '#fef2f2' : '#f0fdf4',
            color: isError ? '#dc2626' : '#16a34a',
            border: `1px solid ${isError ? '#fecaca' : '#bbf7d0'}`,
            marginBottom: '16px',
            textAlign: isRTL ? 'right' : 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        }),
        blockedList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            maxHeight: '220px',
            overflowY: 'auto',
        },
        blockedRow: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            padding: '8px 10px',
            background: '#fff7ed',
            borderRadius: '8px',
            fontSize: '12.5px',
            color: '#92400e',
            flexDirection: isRTL ? 'row-reverse' : 'row',
            cursor: 'pointer',
        },
        blockedRowBtn: {
            border: 'none',
            background: 'white',
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#c2410c',
            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        },
        button: (variant = 'primary', disabled = false) => {
            const variants = {
                primary: {
                    background: disabled ? '#93c5fd' : 'linear-gradient(135deg, #185FA5 0%, #1a6db8 100%)',
                    color: 'white',
                    border: 'none',
                },
                secondary: {
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                },
                danger: {
                    background: disabled ? '#fecaca' : '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                },
            };
            return {
                ...variants[variant],
                padding: '10px 14px',
                borderRadius: '9px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                flex: 1,
            };
        },
        modalOverlay: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 24, 39, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
        },
        modalBox: {
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '340px',
            maxWidth: '100%',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            direction: isRTL ? 'rtl' : 'ltr',
            textAlign: isRTL ? 'right' : 'left',
        },
        modalTitle: {
            fontSize: '16px',
            fontWeight: 700,
            color: '#111827',
            margin: '0 0 4px 0',
        },
        modalDate: {
            fontSize: '13px',
            color: '#6b7280',
            margin: '0 0 18px 0',
        },
        modalLabel: {
            fontSize: '12.5px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px',
            display: 'block',
        },
        stepper: {
            display: 'flex',
            alignItems: 'center',
            border: '1.5px solid #d1d5db',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '20px',
        },
        stepperBtn: {
            width: '40px',
            height: '40px',
            border: 'none',
            background: '#f3f4f6',
            color: '#374151',
            fontSize: '18px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        stepperInput: {
            flex: 1,
            padding: '10px 4px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 700,
            textAlign: 'center',
            outline: 'none',
        },
        modalActions: {
            display: 'flex',
            gap: '8px',
            flexDirection: isRTL ? 'row-reverse' : 'row',
        },
    };

    if (!building) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '60px 40px', color: '#9ca3af' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏢</div>
                    <p style={{ margin: 0, fontSize: '15px' }}>{t('select_building')}</p>
                </div>
            </div>
        );
    }

    if (flats.length === 0 && !loadingFlats) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '60px 40px', color: '#9ca3af' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏠</div>
                    <p style={{ margin: 0, fontSize: '15px' }}>{t('no_flats')}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                /* Prevent ANY horizontal overflow from scrolling the whole RTL page
                   past the app sidebar/topbar. This is the fix for "sidebar disappears
                   in Arabic" — RTL pages default-scroll to the right edge when the
                   page is wider than the viewport, hiding whatever sits at the left. */
                html, body {
                    overflow-x: hidden !important;
                    max-width: 100vw !important;
                }
                .cv-container {
                    max-width: 100% !important;
                    overflow-x: hidden;
                }
                .cv-wrapper {
                    min-width: 0;
                }
                .cv-wrapper > * {
                    min-width: 0; /* grid items default to min-width:auto and can force overflow */
                }

                @media (max-width: 900px) {
                    .cv-wrapper {
                        grid-template-columns: 1fr !important;
                    }
                }

                @media (max-width: 640px) {
                    .cv-container {
                        padding: 14px !important;
                    }
                    .cv-selector-section,
                    .cv-multi-toggle-row,
                    .cv-selection-bar {
                        flex-direction: column !important;
                        align-items: stretch !important;
                    }
                    .cv-selector-label {
                        min-width: 0 !important;
                        margin-bottom: 4px;
                    }
                    .cv-selection-actions {
                        flex-wrap: wrap !important;
                        justify-content: flex-start !important;
                    }
                    .cv-modal-box {
                        width: 100% !important;
                    }
                    .cv-modal-actions {
                        flex-direction: column !important;
                    }
                    .cv-modal-actions button {
                        width: 100% !important;
                    }
                }

                @media (max-width: 420px) {
                    .cv-day-cell {
                        min-height: 36px !important;
                        font-size: 12px !important;
                        padding: 4px 2px !important;
                    }
                    .cv-month-title {
                        font-size: 16px !important;
                    }
                }
            `}</style>

            <div style={styles.container} className="cv-container">
                <div style={styles.header}>
                    <h1 style={styles.title}>📅 {t('calendar_view')}</h1>
                    <p style={styles.subtitle}>{t('manage_bookings_and_blocked_days')}</p>
                </div>

                <div style={styles.selectorSection} className="cv-selector-section">
                    <label style={styles.selectorLabel} className="cv-selector-label">{t('select_flat')}:</label>
                    <select
                        value={selectedFlatId || ''}
                        onChange={(e) => setSelectedFlatId(Number(e.target.value))}
                        style={styles.select}
                        disabled={loadingFlats}
                    >
                        <option value="">{t('choose_flat')}</option>
                        {flats.map(flat => (
                            <option key={flat.id} value={flat.id}>
                                {flat.nameEn || flat.nameAr}
                            </option>
                        ))}
                    </select>
                </div>

                {!selectedFlatId ? (
                    <div style={{ textAlign: 'center', padding: '60px 40px', color: '#9ca3af' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>👆</div>
                        <p style={{ margin: 0, fontSize: '15px' }}>{t('select_flat_to_continue')}</p>
                    </div>
                ) : (
                    <>
                        <div style={styles.multiToggleRow} className="cv-multi-toggle-row">
                            <p style={{ ...styles.hintBanner, margin: 0, flex: 1 }}>
                                💡 {multiSelectMode
                                ? (t('multi_select_hint')
                                    || 'اضغط على أي عدد من الأيام (متاحة أو محجوبة) لتحديدها، ثم اختر الإجراء المناسب من الشريط أدناه.')
                                : (t('click_to_block_unblock')
                                    || 'اضغط على أي يوم متاح لاختيار عدد الوحدات وحجبه. اضغط على يوم محجوب (برتقالي) لتعديل عدد وحداته أو إلغاء الحجب — كل يوم بعدده الخاص.')}
                            </p>
                            <button
                                type="button"
                                onClick={toggleMultiSelectMode}
                                disabled={isProcessing}
                                style={styles.multiToggleBtn(multiSelectMode)}
                            >
                                {multiSelectMode ? <IconX size={16} /> : <IconChecks size={16} />}
                                {multiSelectMode
                                    ? (t('exit_multi_select') || 'إلغاء التحديد المتعدد')
                                    : (t('multi_select') || 'تحديد متعدد')}
                            </button>
                        </div>

                        {statusMessage.text && (
                            <div style={styles.statusMessage(statusMessage.isError)}>
                                <span>{statusMessage.isError ? '⚠️' : '✅'}</span>
                                {statusMessage.text}
                            </div>
                        )}

                        {multiSelectMode && selectedArray.length > 0 && (
                            <div style={styles.selectionBar} className="cv-selection-bar">
                                <span style={styles.selectionCount}>
                                    <IconSquareCheck size={16} />
                                    {selectedArray.length} {t('days_selected') || 'يوم محدد'}
                                    {hasMixedSelection && (
                                        <span style={{ color: '#fca5a5', fontWeight: 500 }}>
                                            — {t('mixed_selection_hint') || 'اختر أيام من نفس النوع (متاحة أو محجوبة) لتنفيذ إجراء جماعي'}
                                        </span>
                                    )}
                                </span>
                                <div style={styles.selectionActions} className="cv-selection-actions">
                                    {canBulkBlock && (
                                        <button
                                            type="button"
                                            onClick={openMultiBlockModal}
                                            disabled={isProcessing}
                                            style={styles.pillBtn('block', isProcessing)}
                                        >
                                            <IconLock size={14} />
                                            {t('block_n_days', { count: selectedArray.length }) || `حجب ${selectedArray.length} أيام`}
                                        </button>
                                    )}
                                    {canBulkUnblock && (
                                        <button
                                            type="button"
                                            onClick={handleBulkUnblock}
                                            disabled={isProcessing}
                                            style={styles.pillBtn('unblock', isProcessing)}
                                        >
                                            <IconLockOpen size={14} />
                                            {isProcessing
                                                ? (t('processing') || '...جارٍ الحفظ')
                                                : (t('unblock_n_days', { count: selectedArray.length }) || `إلغاء حجب ${selectedArray.length} أيام`)}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={clearSelection}
                                        disabled={isProcessing}
                                        style={styles.pillBtn('clear', isProcessing)}
                                    >
                                        <IconX size={14} />
                                        {t('clear_selection') || 'مسح التحديد'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div style={styles.calendarWrapper} className="cv-wrapper">
                            <div style={styles.calendarSection}>
                                <div style={styles.calendarNav}>
                                    <h2 style={styles.monthTitle} className="cv-month-title">{monthName}</h2>
                                    <div style={styles.navButtons}>
                                        {isRTL ? (
                                            <>
                                                <button onClick={nextMonth} style={styles.navButton} title={t('next_month')}>
                                                    <IconChevronLeft size={17} />
                                                </button>
                                                <button onClick={goToToday} style={styles.navButton}>{t('today')}</button>
                                                <button onClick={prevMonth} style={styles.navButton} title={t('prev_month')}>
                                                    <IconChevronRight size={17} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={prevMonth} style={styles.navButton} title={t('prev_month')}>
                                                    <IconChevronLeft size={17} />
                                                </button>
                                                <button onClick={goToToday} style={styles.navButton}>{t('today')}</button>
                                                <button onClick={nextMonth} style={styles.navButton} title={t('next_month')}>
                                                    <IconChevronRight size={17} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div style={styles.calendarGrid}>
                                    {dayNames.map(day => (
                                        <div key={day} style={styles.dayHead}>{day}</div>
                                    ))}

                                    {calendarDays.map((day, idx) => {
                                        if (!day) return <div key={`empty-${idx}`} />;

                                        const dateStr = formatDate(day);
                                        const booked = isDateBooked(dateStr);
                                        const blocked = isDateBlocked(dateStr);
                                        const past = isPastDate(dateStr);
                                        const unitsForDay = blocked ? getBlockedUnitsForDate(dateStr) : 0;
                                        const isSelected = multiSelectMode && selectedDates.has(dateStr);

                                        let bg = '#f9fafb', color = '#374151', border = '1.5px solid #f3f4f6', cursor = 'pointer', opacity = 1;

                                        if (booked) {
                                            bg = '#fee2e2'; color = '#991b1b'; border = '1.5px solid #fca5a5'; cursor = 'not-allowed';
                                        } else if (blocked) {
                                            bg = '#ffedd5'; color = '#92400e'; border = '1.5px solid #fdba74';
                                            cursor = isProcessing ? 'not-allowed' : 'pointer';
                                            opacity = isProcessing ? 0.6 : 1;
                                        } else if (past) {
                                            bg = '#f3f4f6'; color = '#d1d5db'; cursor = 'not-allowed'; opacity = 0.5;
                                        } else {
                                            cursor = isProcessing ? 'not-allowed' : 'pointer';
                                            opacity = isProcessing ? 0.6 : 1;
                                        }

                                        const cellStyle = {
                                            ...styles.dayCell(bg, color, border, cursor, opacity),
                                            ...(isSelected ? {
                                                boxShadow: '0 0 0 2px #185FA5',
                                                border: '1.5px solid #185FA5',
                                            } : {}),
                                        };

                                        const handleDateClick = () => {
                                            if (isProcessing) return;
                                            if (booked) {
                                                setStatusMessage({ text: t('cannot_change_booked_date') || 'هذا اليوم محجوز من عميل ولا يمكن تعديله', isError: true });
                                                return;
                                            }
                                            if (past) {
                                                setStatusMessage({ text: t('cannot_block_past_date') || 'لا يمكن حجب تاريخ سابق', isError: true });
                                                return;
                                            }
                                            if (multiSelectMode) {
                                                toggleDateSelection(dateStr);
                                                return;
                                            }
                                            if (blocked) {
                                                openEditModal(dateStr);
                                            } else {
                                                openBlockModal(dateStr);
                                            }
                                        };

                                        return (
                                            <div
                                                key={day}
                                                style={cellStyle}
                                                className="cv-day-cell"
                                                onClick={handleDateClick}
                                                title={
                                                    past ? (t('past_date') || 'تاريخ سابق')
                                                        : booked ? (t('booked_date') || 'محجوز')
                                                            : blocked ? `${t('click_to_edit') || 'اضغط للتعديل'} (${unitsForDay})`
                                                                : (t('click_to_block') || 'اضغط للحجب')
                                                }
                                            >
                                                {isSelected && (
                                                    <span style={styles.selectedCheckBadge}>
                                                        <IconSquareCheck size={11} />
                                                    </span>
                                                )}
                                                {blocked && <span style={styles.unitsBadge}>{unitsForDay}</span>}
                                                <span>{day}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={styles.sidebar}>
                                <div style={styles.sidebarCard}>
                                    <h3 style={styles.cardTitle}>📋 {t('legend')}</h3>
                                    <div style={styles.legend}>
                                        <div style={styles.legendItem}>
                                            <div style={styles.legendColor('#f9fafb')} />
                                            <span>{t('available') || 'متاح'}</span>
                                        </div>
                                        <div style={styles.legendItem}>
                                            <div style={styles.legendColor('#ffedd5')} />
                                            <span>{t('blocked') || 'محجوب (الرقم = عدد وحداته)'}</span>
                                        </div>
                                        <div style={styles.legendItem}>
                                            <div style={styles.legendColor('#fee2e2')} />
                                            <span>{t('booked') || 'محجوز من عميل'}</span>
                                        </div>
                                        <div style={styles.legendItem}>
                                            <div style={styles.legendColor('#f3f4f6', { opacity: 0.5 })} />
                                            <span style={{ color: '#9ca3af' }}>{t('past_dates') || 'تاريخ سابق'}</span>
                                        </div>
                                        {multiSelectMode && (
                                            <div style={styles.legendItem}>
                                                <div style={{ ...styles.legendColor('#f9fafb'), boxShadow: '0 0 0 2px #185FA5' }} />
                                                <span>{t('selected') || 'محدد'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={styles.sidebarCard}>
                                    <h3 style={styles.cardTitle}>🔒 {t('blocked_days')} ({sortedBlockedDays.length})</h3>
                                    {sortedBlockedDays.length === 0 ? (
                                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                                            {t('no_blocked_days') || 'لا يوجد أيام محجوبة'}
                                        </p>
                                    ) : (
                                        <div style={styles.blockedList}>
                                            {sortedBlockedDays.map(({ date, unitsCount }) => (
                                                <div
                                                    key={date}
                                                    style={{
                                                        ...styles.blockedRow,
                                                        ...(multiSelectMode && selectedDates.has(date) ? { boxShadow: '0 0 0 2px #185FA5' } : {}),
                                                    }}
                                                    onClick={() => multiSelectMode ? toggleDateSelection(date) : openEditModal(date)}
                                                >
                                                    <span>{formatDateDisplay(date)}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <strong>{unitsCount} {t('units') || 'وحدة'}</strong>
                                                        {!multiSelectMode && (
                                                            <button
                                                                style={styles.blockedRowBtn}
                                                                onClick={(e) => { e.stopPropagation(); openEditModal(date); }}
                                                                title={t('edit') || 'تعديل'}
                                                            >
                                                                <IconPencil size={13} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {selectedFlat && (
                                    <div style={styles.sidebarCard}>
                                        <h3 style={styles.cardTitle}>🏠 {t('flat_info')}</h3>
                                        <div style={{ fontSize: '13px', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ fontWeight: 700, color: '#111827', fontSize: '14px' }}>
                                                {selectedFlat.nameEn || selectedFlat.nameAr}
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                <span style={{ padding: '3px 8px', background: '#f0fdf4', color: '#16a34a', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: '1px solid #bbf7d0' }}>
                                                    💰{t('OMR')}{selectedFlat.price_per_night}
                                                </span>
                                                <span style={{ padding: '3px 8px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                                                    👥 {selectedFlat.visitors_count || 0} {t('guests')}
                                                </span>
                                                <span style={{ padding: '3px 8px', background: '#faf5ff', color: '#7c3aed', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: '1px solid #e9d5ff' }}>
                                                    🛏️ {selectedFlat.bedsNumber || 0} {t('beds')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {dayModal.open && (
                    <div style={styles.modalOverlay} onClick={closeModal}>
                        <div style={styles.modalBox} className="cv-modal-box" onClick={(e) => e.stopPropagation()}>
                            <h3 style={styles.modalTitle}>
                                {dayModal.mode === 'blocked'
                                    ? (t('edit_blocked_day') || 'تعديل يوم محجوب')
                                    : dayModal.mode === 'block-multi'
                                        ? (t('block_multiple_days') || 'حجب الأيام المحددة')
                                        : (t('block_this_day') || 'حجب هذا اليوم')}
                            </h3>
                            <p style={styles.modalDate}>
                                {dayModal.mode === 'block-multi'
                                    ? `${selectedDates.size} ${t('days_selected') || 'يوم محدد'}`
                                    : dayModal.dateStr ? formatDateDisplay(dayModal.dateStr) : ''}
                            </p>

                            <label style={styles.modalLabel}>{t('units_to_block') || 'عدد الوحدات'}</label>
                            <div style={styles.stepper}>
                                <button type="button" onClick={() => stepModalUnits(-1)} style={styles.stepperBtn} aria-label="decrease">−</button>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoFocus
                                    value={dayModal.count}
                                    onChange={handleModalUnitsChange}
                                    onBlur={handleModalUnitsBlur}
                                    style={styles.stepperInput}
                                />
                                <button type="button" onClick={() => stepModalUnits(1)} style={styles.stepperBtn} aria-label="increase">+</button>
                            </div>
                            {dayModal.mode === 'block-multi' && (
                                <p style={{ fontSize: '12px', color: '#6b7280', margin: '-12px 0 20px 0' }}>
                                    {t('units_apply_to_all_selected') || 'سيتم تطبيق هذا العدد على كل الأيام المحددة.'}
                                </p>
                            )}

                            <div style={styles.modalActions} className="cv-modal-actions">
                                {dayModal.mode === 'blocked' && (
                                    <button onClick={handleUnblockFromModal} style={styles.button('danger', isProcessing)} disabled={isProcessing}>
                                        <IconLockOpen size={15} />
                                        {t('unblock') || 'إلغاء الحجب'}
                                    </button>
                                )}
                                <button onClick={closeModal} style={styles.button('secondary', isProcessing)} disabled={isProcessing}>
                                    {t('cancel') || 'إلغاء'}
                                </button>
                                <button onClick={confirmModal} style={styles.button('primary', isProcessing)} disabled={isProcessing}>
                                    <IconLock size={15} />
                                    {isProcessing
                                        ? (t('processing') || '...جارٍ الحفظ')
                                        : dayModal.mode === 'blocked'
                                            ? (t('update') || 'تحديث')
                                            : dayModal.mode === 'block-multi'
                                                ? (t('block_selected') || `حجب ${selectedDates.size} أيام`)
                                                : (t('block') || 'حجب')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
// import React, { useState, useEffect } from 'react';
// import { useTranslation } from '../context/LanguageContext';
// import { IconChevronLeft, IconChevronRight, IconLock, IconAlertCircle } from '@tabler/icons-react';
// import '../styles/Buildingdetails.css';
//
// /**
//  * CalendarViewPage - Coming Soon Version
//  * Shows calendar UI but all features disabled with "Coming Soon" message
//  */
// export default function CalendarViewPage({ building }) {
//     const { t, lang } = useTranslation();
//
//     // State
//     const [flats, setFlats] = useState([]);
//     const [selectedFlatId, setSelectedFlatId] = useState(null);
//     const [loadingFlats, setLoadingFlats] = useState(false);
//     const [currentDate, setCurrentDate] = useState(new Date());
//
//     // Load flats
//     useEffect(() => {
//         if (!building?.id && !building?.raw?.id) return;
//
//         const loadFlats = async () => {
//             setLoadingFlats(true);
//             try {
//                 // Mock data for demonstration
//                 const mockFlats = [
//                     { id: 1, nameEn: 'Luxury Suite', nameAr: 'جناح فاخر', price_per_night: 150, visitors_count: 4, bedsNumber: 2 },
//                     { id: 2, nameEn: 'Standard Room', nameAr: 'غرفة عادية', price_per_night: 80, visitors_count: 2, bedsNumber: 1 },
//                     { id: 3, nameEn: 'Family Villa', nameAr: 'فيلا عائلية', price_per_night: 250, visitors_count: 8, bedsNumber: 4 },
//                 ];
//                 setFlats(mockFlats);
//                 if (mockFlats.length > 0 && !selectedFlatId) {
//                     setSelectedFlatId(mockFlats[0].id);
//                 }
//             } catch (error) {
//                 console.error('[CalendarViewPage] Error loading flats:', error);
//             } finally {
//                 setLoadingFlats(false);
//             }
//         };
//
//         loadFlats();
//     }, [building?.id, building?.raw?.id]);
//
//     // ──── LOCALIZATION HELPERS ────
//     const getMonthName = () => {
//         if (lang === 'ar') {
//             const arabicMonths = [
//                 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
//                 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
//             ];
//             return `${arabicMonths[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
//         }
//         return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
//     };
//
//     const getDayNames = () => {
//         if (lang === 'ar') {
//             return ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
//         }
//         return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//     };
//
//     // Calendar navigation
//     const prevMonth = () => {
//         setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
//     };
//
//     const nextMonth = () => {
//         setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
//     };
//
//     const goToToday = () => {
//         setCurrentDate(new Date());
//     };
//
//     // Calendar data
//     const year = currentDate.getFullYear();
//     const month = currentDate.getMonth();
//     const daysInMonth = new Date(year, month + 1, 0).getDate();
//     const firstDayOfMonth = new Date(year, month, 1).getDay();
//
//     const calendarDays = [];
//     for (let i = 0; i < firstDayOfMonth; i++) {
//         calendarDays.push(null);
//     }
//     for (let day = 1; day <= daysInMonth; day++) {
//         calendarDays.push(day);
//     }
//
//     const dayNames = getDayNames();
//     const monthName = getMonthName();
//
//     const selectedFlat = flats.find(f => f.id === selectedFlatId);
//     const isRTL = lang === 'ar';
//
//     // ──── STYLES ────
//     const styles = {
//         container: {
//             padding: '20px',
//             maxWidth: '1400px',
//             margin: '0 auto',
//             direction: isRTL ? 'rtl' : 'ltr',
//             textAlign: isRTL ? 'right' : 'left',
//         },
//         header: {
//             marginBottom: '24px',
//         },
//         title: {
//             fontSize: '28px',
//             fontWeight: 700,
//             color: '#111827',
//             marginBottom: '8px',
//             margin: 0,
//         },
//         subtitle: {
//             fontSize: '14px',
//             color: '#6b7280',
//             marginBottom: '16px',
//         },
//         // ✅ COMING SOON BANNER
//         comingSoonBanner: {
//             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//             borderRadius: '12px',
//             padding: '20px',
//             marginBottom: '24px',
//             color: 'white',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '16px',
//             flexDirection: isRTL ? 'row-reverse' : 'row',
//             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//         },
//         comingSoonIcon: {
//             fontSize: '32px',
//             flexShrink: 0,
//         },
//         comingSoonContent: {
//             flex: 1,
//         },
//         comingSoonTitle: {
//             fontSize: '18px',
//             fontWeight: 700,
//             marginBottom: '4px',
//             margin: 0,
//         },
//         comingSoonText: {
//             fontSize: '14px',
//             opacity: 0.95,
//             marginBottom: 0,
//             margin: 0,
//         },
//         comingSoonBadge: {
//             display: 'inline-block',
//             background: 'rgba(255, 255, 255, 0.2)',
//             color: 'white',
//             padding: '4px 12px',
//             borderRadius: '20px',
//             fontSize: '12px',
//             fontWeight: 600,
//             marginTop: '8px',
//         },
//         selectorSection: {
//             padding: '16px',
//             background: '#f9fafb',
//             borderRadius: '12px',
//             border: '1px solid #e5e7eb',
//             marginBottom: '24px',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '16px',
//             flexDirection: isRTL ? 'row-reverse' : 'row',
//             opacity: 0.6,
//             pointerEvents: 'none',
//         },
//         selectorLabel: {
//             fontWeight: 600,
//             color: '#4b5563',
//             minWidth: '100px',
//         },
//         select: {
//             flex: 1,
//             padding: '10px 12px',
//             borderRadius: '8px',
//             border: '1px solid #d1d5db',
//             fontSize: '14px',
//             background: 'white',
//             color: '#111827',
//             cursor: 'not-allowed',
//             direction: isRTL ? 'rtl' : 'ltr',
//             textAlign: isRTL ? 'right' : 'left',
//         },
//         calendarWrapper: {
//             display: 'grid',
//             gridTemplateColumns: isRTL ? '350px 1fr' : '1fr 350px',
//             gap: '24px',
//             marginBottom: '24px',
//             opacity: 0.5,
//             pointerEvents: 'none',
//         },
//         calendarSection: {
//             background: 'white',
//             borderRadius: '12px',
//             border: '1px solid #e5e7eb',
//             padding: '20px',
//         },
//         calendarNav: {
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             marginBottom: '20px',
//             flexDirection: isRTL ? 'row-reverse' : 'row',
//         },
//         monthTitle: {
//             fontSize: '18px',
//             fontWeight: 600,
//             color: '#111827',
//             margin: 0,
//         },
//         navButtons: {
//             display: 'flex',
//             gap: '8px',
//             flexDirection: isRTL ? 'row-reverse' : 'row',
//         },
//         navButton: {
//             padding: '8px 12px',
//             borderRadius: '8px',
//             border: '1px solid #d1d5db',
//             background: 'white',
//             cursor: 'not-allowed',
//             display: 'flex',
//             alignItems: 'center',
//             opacity: 0.7,
//         },
//         calendarGrid: {
//             display: 'grid',
//             gridTemplateColumns: 'repeat(7, 1fr)',
//             gap: '6px',
//             marginBottom: '20px',
//         },
//         dayHead: {
//             fontSize: '12px',
//             fontWeight: 600,
//             color: '#6b7280',
//             textAlign: 'center',
//             padding: '8px 4px',
//         },
//         dayCell: {
//             padding: '8px 4px',
//             textAlign: 'center',
//             borderRadius: '8px',
//             fontSize: '13px',
//             fontWeight: 500,
//             cursor: 'not-allowed',
//             background: '#f3f4f6',
//             color: '#9ca3af',
//             minHeight: '40px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             border: '1px solid transparent',
//             transition: 'all 0.2s',
//             userSelect: 'none',
//         },
//         sidebar: {
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '16px',
//         },
//         sidebarCard: {
//             background: 'white',
//             borderRadius: '12px',
//             border: '1px solid #e5e7eb',
//             padding: '16px',
//             textAlign: isRTL ? 'right' : 'left',
//             opacity: 0.6,
//         },
//         cardTitle: {
//             fontSize: '14px',
//             fontWeight: 600,
//             color: '#111827',
//             marginBottom: '12px',
//             margin: 0,
//         },
//         button: {
//             padding: '10px 14px',
//             borderRadius: '8px',
//             fontSize: '13px',
//             fontWeight: 500,
//             cursor: 'not-allowed',
//             width: '100%',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             gap: '6px',
//             background: '#e5e7eb',
//             color: '#9ca3af',
//             border: '1px solid #d1d5db',
//             flexDirection: isRTL ? 'row-reverse' : 'row',
//         },
//     };
//
//     if (!building) {
//         return (
//             <div style={styles.container}>
//                 <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
//                     <p>{t('select_building')}</p>
//                 </div>
//             </div>
//         );
//     }
//
//     return (
//         <div style={styles.container}>
//             {/* Header */}
//             <div style={styles.header}>
//                 <h1 style={styles.title}>📅 {t('calendar_view')}</h1>
//                 <p style={styles.subtitle}>{t('manage_bookings_and_blocked_days')}</p>
//             </div>
//
//             {/* ✅ COMING SOON BANNER */}
//             <div style={styles.comingSoonBanner}>
//                 <div style={styles.comingSoonIcon}>
//                     <IconAlertCircle size={32} />
//                 </div>
//                 <div style={styles.comingSoonContent}>
//                     <h2 style={styles.comingSoonTitle}>
//                         {lang === 'ar' ? '🚀 قريباً جداً!' : '🚀 Coming Soon!'}
//                     </h2>
//                     <p style={styles.comingSoonText}>
//                         {lang === 'ar'
//                             ? 'نحن نعمل على إضافة هذه الميزة . ستكون متاحة قريباً !'
//                             : 'We\'re working on this amazing feature. It will be available very soon!'}
//                     </p>
//                     <div style={styles.comingSoonBadge}>
//                         {lang === 'ar' ? '⏳ قيد التطوير' : '⏳ In Development'}
//                     </div>
//                 </div>
//             </div>
//
//             {/* Flat Selector - DISABLED */}
//             <div style={styles.selectorSection}>
//                 <label style={styles.selectorLabel}>{t('select_flat')}:</label>
//                 <select
//                     value={selectedFlatId || ''}
//                     onChange={() => {}}
//                     style={styles.select}
//                     disabled={true}
//                 >
//                     <option value="">{t('choose_flat')}</option>
//                     {flats.map(flat => (
//                         <option key={flat.id} value={flat.id}>
//                             {flat.nameEn || flat.nameAr} - {flat.price_per_night ? `{t('OMR')}${flat.price_per_night}` : 'N/A'}
//                         </option>
//                     ))}
//                 </select>
//             </div>
//
//             {selectedFlatId ? (
//                 <>
//                     {/* Calendar and Sidebar - DISABLED */}
//                     <div style={styles.calendarWrapper}>
//                         {/* Calendar */}
//                         <div style={styles.calendarSection}>
//                             {/* Navigation */}
//                             <div style={styles.calendarNav}>
//                                 <h2 style={styles.monthTitle}>{monthName}</h2>
//                                 <div style={styles.navButtons}>
//                                     {isRTL ? (
//                                         <>
//                                             <button
//                                                 onClick={nextMonth}
//                                                 style={styles.navButton}
//                                                 disabled={true}
//                                             >
//                                                 <IconChevronLeft size={18} />
//                                             </button>
//                                             <button
//                                                 onClick={goToToday}
//                                                 style={styles.navButton}
//                                                 disabled={true}
//                                             >
//                                                 {t('today')}
//                                             </button>
//                                             <button
//                                                 onClick={prevMonth}
//                                                 style={styles.navButton}
//                                                 disabled={true}
//                                             >
//                                                 <IconChevronRight size={18} />
//                                             </button>
//                                         </>
//                                     ) : (
//                                         <>
//                                             <button
//                                                 onClick={prevMonth}
//                                                 style={styles.navButton}
//                                                 disabled={true}
//                                             >
//                                                 <IconChevronLeft size={18} />
//                                             </button>
//                                             <button
//                                                 onClick={goToToday}
//                                                 style={styles.navButton}
//                                                 disabled={true}
//                                             >
//                                                 {t('today')}
//                                             </button>
//                                             <button
//                                                 onClick={nextMonth}
//                                                 style={styles.navButton}
//                                                 disabled={true}
//                                             >
//                                                 <IconChevronRight size={18} />
//                                             </button>
//                                         </>
//                                     )}
//                                 </div>
//                             </div>
//
//                             {/* Calendar Grid */}
//                             <div style={styles.calendarGrid}>
//                                 {/* Day headers */}
//                                 {dayNames.map(day => (
//                                     <div key={day} style={styles.dayHead}>{day}</div>
//                                 ))}
//
//                                 {/* Days */}
//                                 {calendarDays.map((day, idx) => {
//                                     if (!day) {
//                                         return <div key={`empty-${idx}`} />;
//                                     }
//
//                                     return (
//                                         <div
//                                             key={day}
//                                             style={styles.dayCell}
//                                             onClick={() => {}}
//                                         >
//                                             <span>{day}</span>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         </div>
//
//                         {/* Sidebar */}
//                         <div style={styles.sidebar}>
//                             {/* Legend */}
//                             <div style={styles.sidebarCard}>
//                                 <h3 style={styles.cardTitle}>📋 {t('legend')}</h3>
//                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//                                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4b5563', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
//                                         <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#f3f4f6', flexShrink: 0 }} />
//                                         <span>{t('available')}</span>
//                                     </div>
//                                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4b5563', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
//                                         <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#fed7aa', flexShrink: 0 }} />
//                                         <span>{t('blocked')}</span>
//                                     </div>
//                                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4b5563', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
//                                         <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#fecaca', flexShrink: 0 }} />
//                                         <span>{t('booked')}</span>
//                                     </div>
//                                 </div>
//                             </div>
//
//                             {/* Selected Dates Info */}
//                             <div style={styles.sidebarCard}>
//                                 <h3 style={styles.cardTitle}>
//                                     ✅ {t('selected_dates')} (0)
//                                 </h3>
//                                 <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
//                                     {t('no_dates_selected')}
//                                 </p>
//                             </div>
//
//                             {/* Summary */}
//                             <div style={styles.sidebarCard}>
//                                 <h3 style={styles.cardTitle}>📊 {t('summary')}</h3>
//                                 <div style={{ fontSize: '13px', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '8px' }}>
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
//                                         <span>📌 {t('booked_days')}:</span>
//                                         <strong>0</strong>
//                                     </div>
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
//                                         <span>🔒 {t('blocked_days')}:</span>
//                                         <strong>0</strong>
//                                     </div>
//                                 </div>
//                             </div>
//
//                             {/* Actions - DISABLED */}
//                             <div style={styles.sidebarCard}>
//                                 <button style={styles.button} disabled={true}>
//                                     <IconLock size={16} />
//                                     {t('block_selected')}
//                                 </button>
//                             </div>
//
//                             {/* Flat Info */}
//                             {selectedFlat && (
//                                 <div style={styles.sidebarCard}>
//                                     <h3 style={styles.cardTitle}>🏠 {t('flat_info')}</h3>
//                                     <div style={{ fontSize: '13px', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '6px' }}>
//                                         <div>
//                                             <strong>{selectedFlat.nameEn || selectedFlat.nameAr}</strong>
//                                         </div>
//                                         <div>💰{t('OMR')}{selectedFlat.price_per_night}</div>
//                                         <div>👥 {selectedFlat.visitors_count || 0} {t('guests')}</div>
//                                         <div>🛏️ {selectedFlat.bedsNumber || 0} {t('beds')}</div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </>
//             ) : (
//                 <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
//                     <p>{t('select_flat_to_continue')}</p>
//                 </div>
//             )}
//         </div>
//     );
// }