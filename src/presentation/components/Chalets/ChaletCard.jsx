import React from 'react';
import RialSymbol from '../OmaniRial.jsx';
import { localizeWilayat } from '../../../core/utils/Constants/building_constants.js';
import '../../styles/Buildingdetails.css';

/**
 * ChaletCard
 * Grid card for the chalets list — visually mirrors FlatCard for a
 * consistent look between the "Flats" and "Chalets" sections of the app.
 */
const ChaletCard = ({ chalet, t, lang, onOpen, onEdit }) => {
    const formatPrice = (price) => {
        if (price === undefined || price === null || price === '') return 'N/A';
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(price);
    };

    return (
        <div className="flat-card" onClick={() => onOpen(chalet)} style={{ cursor: 'pointer' }}>
            <div className="flat-card__image">
                {chalet.coverImg ? (
                    <img
                        src={chalet.coverImg}
                        alt={chalet.name}
                        loading="lazy"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <i className="ti ti-home-2 flat-card__image-placeholder" />
                )}
                <span className={`flat-card__status ${chalet.isActive ? 'flat-card__status--available' : 'flat-card__status--unavailable'}`}>
                    <i className={`ti ${chalet.isActive ? 'ti-circle-check' : 'ti-circle-x'}`} />
                    {chalet.isActive ? (t('operational') || 'Active') : (t('inactive') || 'Inactive')}
                </span>
            </div>

            <div className="flat-card__body">
                <p className="flat-card__title">{chalet.name}</p>

                {chalet.chaletType && (
                    <p className="flat-card__description">
                        {t(`chalet_type_${String(chalet.chaletType).toLowerCase()}`) || chalet.chaletType} · {localizeWilayat(chalet.state, lang)}
                    </p>
                )}

                <div className="flat-card__chips">
                    {chalet.capacity && (
                        <span className="chip"><i className="ti ti-users chip__icon" />{chalet.capacity} {t('guests') || 'guests'}</span>
                    )}
                    {chalet.bedrooms && (
                        <span className="chip"><i className="ti ti-bed chip__icon" />{chalet.bedrooms} {t('beds') || 'beds'}</span>
                    )}
                    {chalet.bathrooms && (
                        <span className="chip"><i className="ti ti-bath chip__icon" />{chalet.bathrooms} {t('bath') || 'bath'}</span>
                    )}
                </div>

                <div className="flat-card__spacer" />

                <div className="flat-card__price">
                    <span className="flat-card__price-main">
                        <RialSymbol className="flat-card__price-icon" />
                        {formatPrice(chalet.rentFullDay)}
                        <span className="flat-card__price-label">/ {t('full_day') || 'full day'}</span>
                    </span>
                    {chalet.rentWeekend && (
                        <div className="flat-card__price-weekend">
                            <RialSymbol className="flat-card__price-icon flat-card__price-icon--small" />
                            {formatPrice(chalet.rentWeekend)} · {t('weekends') || 'weekends'}
                        </div>
                    )}
                </div>

                <hr className="flat-card__divider" />

                <div className="flat-card__actions-wrapper">
                    <div className="flat-card__actions flat-card__actions--row-1">
                        <button
                            className="flat-card__action-btn flat-card__action-btn--edit flat-card__action-btn--full-width"
                            onClick={(e) => { e.stopPropagation(); onEdit(chalet); }}
                            title={t('edit') || 'Edit'}
                        >
                            <i className="ti ti-edit" /> {t('edit') || 'Edit'}
                        </button>
                    </div>
                    <div className="flat-card__actions flat-card__actions--row-2">
                        <button
                            className="flat-card__action-btn flat-card__action-btn--prices flat-card__action-btn--full-width"
                            onClick={(e) => { e.stopPropagation(); onOpen(chalet); }}
                            title={t('view_details') || 'View Details'}
                        >
                            <i className="ti ti-eye" /> {t('view_details') || 'View Details'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChaletCard;
