import React from 'react';
import '../../styles/Buildingdetails.css';
import RialSymbol from '../OmaniRial.jsx';

/**
 * FlatCard Component - IMPROVED DESIGN
 * Displays individual flat information with actions
 *
 * Button Layout:
 * Row 1: [Bookings] [Edit]
 * Row 2: [Special Prices] (Full width)
 */
const FlatCard = ({ flat, index, t, onEdit, onDelete, onSetPrices, onViewBookings }) => {
    const getFlatName = (flat, index) => {
        return flat?.nameEn || flat?.nameAr || `Flat ${index + 1}`;
    };

    const getFlatDescription = (flat) => {
        return flat?.descrptionEn || flat?.descrptionAr || flat?.description || '';
    };

    const isFlatAvailable = (status) => {
        return status === 'available' || status === true;
    };

    const extractFlatChips = (flat, t) => {
        const chips = [];
        if (flat?.bedsNumber) {
            chips.push({ icon: 'ti-bed', label: `${flat.bedsNumber} ${t('beds') || 'Beds'}` });
        }
        if (flat?.bathroomsNumber) {
            chips.push({ icon: 'ti-door', label: `${flat.bathroomsNumber} ${t('bathrooms') || 'Bathrooms'}` });
        }
        if (flat?.visitors_count) {
            chips.push({ icon: 'ti-users', label: flat.visitors_count });
        }
        return chips;
    };

    const getFlatCardKey = (flat, index) => {
        return flat?.id || `flat-${index}`;
    };

    const formatPrice = (price) => {
        if (price === undefined || price === null || price === '') return 'N/A';

        // 1. Format the numbers cleanly (OMR uses 3 decimal places for Baisa)
        const formattedNumber = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
        }).format(price);

        // 2. Use the standard global text string code
        

        // Returns: "15.750 OMR"
        return `${formattedNumber}`;
    };

    const name = getFlatName(flat, index);
    const description = getFlatDescription(flat);
    const available = isFlatAvailable(flat?.status);
    const chips = extractFlatChips(flat, t);

    const handleViewBookingsClick = () => {
        console.log('[FlatCard] View Bookings clicked for flat:', flat.id);
        if (onViewBookings) onViewBookings(flat);
    };

    const handleSetPricesClick = () => {
        console.log('[FlatCard] Set Prices clicked for flat:', flat.id);
        if (onSetPrices) onSetPrices(flat);
    };

    const handleEditClick = () => {
        console.log('[FlatCard] Edit clicked for flat:', flat.id);
        onEdit(flat);
    };

    const handleDeleteClick = () => {
        console.log('[FlatCard] Delete clicked for flat:', flat.id);
        if (onDelete) onDelete(flat.id);
    };

    return (
        <div className="flat-card" key={getFlatCardKey(flat, index)}>

            {/* ──── IMAGE SECTION ──── */}
            <div className="flat-card__image">
                {flat?.coverimg ? (
                    <img
                        src={flat.coverimg}
                        alt={name}
                        loading="lazy"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <i className="ti ti-photo flat-card__image-placeholder" />
                )}

                {flat?.status && (
                    <span
                        className={`flat-card__status ${available ? 'flat-card__status--available' : 'flat-card__status--unavailable'}`}
                    >
                        <i className={`ti ${available ? 'ti-circle-check' : 'ti-circle-x'}`} />
                        {available ? t('available') || 'Available' : t('unavailable') || 'Unavailable'}
                    </span>
                )}
            </div>

            {/* ──── BODY SECTION ──── */}
            <div className="flat-card__body">

                {/* Title */}
                <p className="flat-card__title">{name}</p>

                {/* Description */}
                {description && (
                    <p className="flat-card__description" title={description}>
                        {description}
                    </p>
                )}

                {/* Chips (Beds, Bathrooms, Guests) */}
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

                {/* Spacer */}
                <div className="flat-card__spacer" />

                {/* ──── PRICE SECTION ──── */}
                <div className="flat-card__price">
    <span className="flat-card__price-main">
        <RialSymbol className="flat-card__price-icon" />
        {formatPrice(flat?.price_per_night)}
        <span className="flat-card__price-label">/ {t('night') || 'night'}</span>
    </span>

                    {flat?.weekend_price_per_night && (
                        <div className="flat-card__price-weekend">
                            <RialSymbol className="flat-card__price-icon flat-card__price-icon--small" />
                            {formatPrice(flat.weekend_price_per_night)} · {t('weekends') || 'weekends'}
                        </div>
                    )}
                </div>

                <hr className="flat-card__divider" />

                {/* ──── ACTION BUTTONS - IMPROVED LAYOUT ──── */}
                <div className="flat-card__actions-wrapper">

                    {/* Row 1: Bookings + Edit */}
                    <div className="flat-card__actions flat-card__actions--row-1">
                        {/*<button*/}
                        {/*    className="flat-card__action-btn flat-card__action-btn--bookings"*/}
                        {/*    onClick={handleViewBookingsClick}*/}
                        {/*    title={t('view_all_bookings') || 'View all bookings'}*/}
                        {/*>*/}
                        {/*    <i className="ti ti-calendar-event" aria-hidden="true" />*/}
                        {/*    {t('booking_list') || 'Bookings'}*/}
                        {/*</button>*/}

                        <button
                            className="flat-card__action-btn flat-card__action-btn--edit"
                            onClick={handleEditClick}
                            title={t('edit') || 'Edit'}
                        >
                            <i className="ti ti-edit" aria-hidden="true" />
                            {t('edit') || 'Edit'}
                        </button>
                    </div>

                    {/* Row 2: Prices (Full Width) */}
                    <div className="flat-card__actions flat-card__actions--row-2">
                        <button
                            className="flat-card__action-btn flat-card__action-btn--prices flat-card__action-btn--full-width"
                            onClick={handleSetPricesClick}
                            title={t('special_prices') || 'Set Special Prices'}
                        >
                            <i className="ti ti-calendar-dollar" aria-hidden="true" />
                            {t('special_prices') || 'Special Prices'}
                        </button>
                    </div>

                    {/* Uncomment when delete is ready */}
                    {/* <div className="flat-card__actions flat-card__actions--row-3">
                        <button
                            className="flat-card__action-btn flat-card__action-btn--delete flat-card__action-btn--full-width"
                            onClick={handleDeleteClick}
                            title={t('delete') || 'Delete'}
                        >
                            <i className="ti ti-trash" aria-hidden="true" />
                            {t('delete') || 'Delete'}
                        </button>
                    </div> */}
                </div>

            </div>
        </div>
    );
};

export default FlatCard;