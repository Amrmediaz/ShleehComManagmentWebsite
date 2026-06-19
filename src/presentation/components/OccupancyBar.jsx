import React from 'react';
import { useTranslation } from '../context/LanguageContext.jsx'; // Ensure this path is correct relative to your folder structure

export default function OccupancyBar({ label, value }) {
    const color = value >= 80 ? 'var(--success)' : value >= 50 ? 'var(--primary)' : 'var(--warning)';

    return (
        <div className="progress-wrapper">
            <div className="progress-label">
                <span>{label}</span>
                <span>{value}%</span>
            </div>
            <div className="progress-bar-bg">
                <div
                    className="progress-fill"
                    style={{ width: `${value}%`, background: color }}
                />
            </div>
        </div>
    );
}