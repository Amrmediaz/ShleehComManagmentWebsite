// components/AmenityTile.jsx
import React from 'react';
import '../../styles/AddBuildingModal.css';



export default function AmenityTile({ item, checked, onChange, t, lang }) {
    return (
        <label
            className={`amenity-tile ${checked ? 'is-selected' : ''}`}
            style={{
                // Dynamically change background based on checked state
                backgroundColor: checked ? '#F4F9FD' : '#FFFFFF',
                borderColor: checked ? item.color : '#E5E7EB',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderRadius: '8px', // Adjust as per your design
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s ease'
            }}
            
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="amenity-tile__checkbox"
                style={{ accentColor: item.color }}
            />

            <div
                className="amenity-tile__icon"
                style={{ background: checked ? '#ffffff' : item.bg }}
            >
                <item.Icon size={18} color={item.color} stroke={2} />
            </div>

            <span className="amenity-tile__label" style={{ fontWeight: checked ? 600 : 400 }}>
                {t(item.key)}
                
            </span>
        </label>
    );
}