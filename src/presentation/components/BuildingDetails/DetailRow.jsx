import React from 'react';
import '../../styles/Buildingdetails.css';

/**
 * DetailRow Component
 * Displays a single row of detail information with icon, label, and value
 *
 * @component
 * @param {Object} props
 * @param {string} props.icon - FontAwesome icon class (e.g., 'fa-solid fa-map')
 * @param {string} props.label - Label text for the detail
 * @param {string|number} props.value - Value to display
 * @returns {React.ReactElement|null} - Returns null if value is empty
 *
 * @example
 * <DetailRow
 *   icon="fa-solid fa-map"
 *   label="Governorate"
 *   value="Muscat"
 * />
 */
const DetailRow = ({ icon, label, value }) => {
    // Return null if value is empty (but allow 0)
    if (!value && value !== 0) {
        return null;
    }

    return (
        <div className="detail-row">
            <i className={`${icon} detail-row__icon`} />
            <div className="detail-row__content">
                <div className="detail-row__label">{label}</div>
                <div className="detail-row__value">{value}</div>
            </div>
        </div>
    );
};

export default DetailRow;