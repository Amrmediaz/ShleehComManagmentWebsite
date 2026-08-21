import React from 'react';
import FlatCard from './FlatCard';
import { CardSkeletonGrid } from '../Skeleton.jsx';
import '../../styles/Buildingdetails.css';

/**
 * BuildingFlatsTab Component
 * Displays a list of flats with ability to add, edit, set prices, and view bookings
 */
const BuildingFlatsTab = ({
                              flats,
                              loading,
                              t,
                              onAddFlat,
                              onEditFlat,
                              onSetPrices,
                              onViewBookings,
                              onDeleteFlat
                          }) => {
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
            {loading && <CardSkeletonGrid count={6} />}

            {/* Empty State */}
            {!loading && flats.length === 0 && (
                <div className="empty-state">
                    <i className="ti ti-building empty-state__icon" />
                    <p className="empty-state__text">{t('no_flats_yet') || t('no_flats') || 'No flats added yet'}</p>
                    <p className="empty-state__subtext">{t('no_flats_hint') || 'Add the flat types you rent out in this building to start taking bookings.'}</p>
                    <button className="btn btn-primary" onClick={onAddFlat} style={{ marginTop: '12px' }}>
                        <i className="ti ti-plus" />
                        {t('add_flat') || 'Add Flat'}
                    </button>
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
                            onSetPrices={onSetPrices}
                            onViewBookings={onViewBookings}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BuildingFlatsTab;