import React from 'react';

/**
 * AmenityChip
 * Small colored pill with an icon circle, used for the amenity/service list
 * in the building & chalet hero headers. `Icon` is an optional Tabler icon
 * component (buildings have one per amenity); falls back to a plain
 * checkmark for anything without a dedicated icon (e.g. chalet services).
 */
export default function AmenityChip({ Icon, bg = '#e6f1fb', color = '#185FA5', label }) {
    return (
        <span className="ph-chip" style={{ background: bg, color }}>
            <span className="ph-chip__icon" style={{ background: 'rgba(255,255,255,0.65)' }}>
                {Icon ? <Icon size={13} stroke={2.4} /> : <i className="fa-solid fa-check" style={{ fontSize: '10px' }} />}
            </span>
            {label}
        </span>
    );
}
