import React from 'react';
import FlatCard from './FlatCard';
import '../../styles/Buildingdetails.css';

/**
 * BuildingFlatsTab Component
 * Displays a list of flats with ability to add and edit
 *
 * @component
 * @param {Object} props
 * @param {Array} props.flats - Array of flat objects
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.t - Translation function
 * @param {Function} props.onAddFlat - Callback to add new flat
 * @param {Function} props.onEditFlat - Callback to edit flat
 * @param {Function} props.onDeleteFlat - Callback to delete flat (optional)
 * @returns {React.ReactElement}
 */
const BuildingFlatsTab = ({ flats, loading, t, onAddFlat, onEditFlat, onDeleteFlat }) => {
    return (
        <div>
            {/* Header with count and add button */}
            <div className="flats-header">
                <p className="flats-count">
                    {flats.length > 0 ? `${flats.length} ${t('flats') || 'flats'}` : ''}
                </p>

                <button className="btn btn-primary" onClick={onAddFlat}>
                    <i className="ti ti-plus" />
                    {t('add_flat') || 'Add Flat'}
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="empty-state">
                    <i className="ti ti-loader-2 empty-state__icon" style={{ animation: 'spin 1s linear infinite' }} />
                    <p className="empty-state__text">{t('loading') || 'Loading flats…'}</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && flats.length === 0 && (
                <div className="empty-state">
                    <i className="ti ti-building empty-state__icon" />
                    <p className="empty-state__text">{t('no_flats') || 'No flats found'}</p>
                </div>
            )}

            {/* Flats Grid */}
            {!loading && flats.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', padding: '4px 0' }}>
                    {flats.map((flat, index) => (
                        <FlatCard
                            key={`flat-card-${flat.id}-${index}`}
                            flat={flat}
                            index={index}
                            t={t}
                            onEdit={onEditFlat}
                            onDelete={onDeleteFlat}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BuildingFlatsTab;