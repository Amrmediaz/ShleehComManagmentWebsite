import React from 'react';
import { extractFlatChips, isFlatAvailable, getFlatName, getFlatDescription, formatPrice, getFlatCardKey } from '../../../core/utils/helper/Helpers.js';
import '../../styles/Buildingdetails.css';

/**
 * FlatCard Component
 * Displays a single flat with image, details, price, and actions
 *
 * @component
 * @param {Object} props
 * @param {Object} props.flat - Flat data
 * @param {number} props.index - Index of flat in list
 * @param {Function} props.t - Translation function
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {Function} props.onDelete - Callback when delete button is clicked (optional)
 * @returns {React.ReactElement}
 */
const FlatCard = ({ flat, index, t, onEdit, onDelete }) => {
    const name = getFlatName(flat, index);
    const description = getFlatDescription(flat);
    const available = isFlatAvailable(flat.status);
    const chips = extractFlatChips(flat, t);

    const handleEditClick = () => {
        onEdit(flat);
    };

    const handleDeleteClick = () => {
        if (onDelete) {
            onDelete(flat.id);
        }
    };

    return (
        <div className="flat-card" key={getFlatCardKey(flat, index)}>
            {/* Image Section */}
            <div className="flat-card__image">
                {flat.coverimg ? (
                    <img
                        src={flat.coverimg}
                        alt={name}
                        loading="lazy"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                ) : (
                    <i className="ti ti-photo flat-card__image-placeholder" />
                )}

                {flat.status && (
                    <span
                        className={`flat-card__status ${available ? 'flat-card__status--available' : 'flat-card__status--unavailable'}`}
                    >
            <i className={`ti ${available ? 'ti-circle-check' : 'ti-circle-x'}`} />
                        {available ? t('available') || 'Available' : t('unavailable') || 'Unavailable'}
          </span>
                )}
            </div>

            {/* Body Section */}
            <div className="flat-card__body">
                {/* Title */}
                <p className="flat-card__title">{name}</p>

                {/* Description */}
                {description && <p className="flat-card__description" title={description}>{description}</p>}

                {/* Chips */}
                {chips.length > 0 && (
                    <div className="flat-card__chips">
                        {chips.map(({ icon, label }) => (
                            <span key={label} className="chip">
                <i className={`ti ${icon} chip__icon`} />
                                {label}
              </span>
                        ))}
                    </div>
                )}

                <div className="flat-card__spacer" />

                {/* Price Section */}
                <div className="flat-card__price">
          <span className="flat-card__price-main">
            {formatPrice(flat.price_per_night)}
              <span className="flat-card__price-label">/ {t('night') || 'night'}</span>
          </span>

                    {flat.weekend_price_per_night && (
                        <div className="flat-card__price-weekend">
                            {formatPrice(flat.weekend_price_per_night)} · {t('weekends') || 'weekends'}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flat-card__actions">
                    <button className="flat-card__action-btn flat-card__action-btn--edit" onClick={handleEditClick}>
                        <i className="ti ti-edit" />
                        {t('edit') || 'Edit'}
                    </button>

                    {/* Uncomment when delete is implemented */}
                    {/* <button 
            className="flat-card__action-btn flat-card__action-btn--delete" 
            onClick={handleDeleteClick}
          >
            <i className="ti ti-trash" />
            {t('delete') || 'Delete'}
          </button> */}
                </div>
            </div>
        </div>
    );
};

export default FlatCard;