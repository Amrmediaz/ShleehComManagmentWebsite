import React from 'react';
import '../../styles/Buildingdetails.css';

/**
 * SectionCard Component
 * Displays a section card with header and content
 *
 * @component
 * @param {Object} props
 * @param {string} props.title - Title of the section
 * @param {string} props.icon - FontAwesome icon class
 * @param {React.ReactNode} props.children - Card content
 * @returns {React.ReactElement}
 *
 * @example
 * <SectionCard title="Location" icon="fa-solid fa-map-pin">
 *   <DetailRow label="City" value="Muscat" />
 * </SectionCard>
 */
const SectionCard = ({ title, icon, children }) => (
    <div className="section-card">
        <div className="section-card__header">
            <i className={`${icon} section-card__icon`} />
            <h3 className="section-card__title">{title}</h3>
        </div>
        <div className="section-card__content">{children}</div>
    </div>
);

export default SectionCard;