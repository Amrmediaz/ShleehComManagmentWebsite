// Add these function definitions at the bottom of Dashboard.jsx
import React from 'react';
import { useTranslation } from '/src/presentation/context/LanguageContext.jsx';

export default  function StatusBadge({ status }) {
    const { t } = useTranslation();
    const map = {
        Active: { cls: 'badge-success', label: t('status_active') || 'Active' },
        Upcoming: { cls: 'badge-warning', label: t('status_upcoming') || 'Upcoming' },
    };
    const { cls, label } = map[status] || { cls: 'badge-slate', label: status };
    return <span className={`badge ${cls}`}>{label}</span>;
}

