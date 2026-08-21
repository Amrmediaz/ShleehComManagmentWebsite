import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import EditBuildingModal from './EditBuildingModal.jsx';
import AddBuildingModal from './AddBuildingModal.jsx';
import EditRoomModal from '../components/FlatAddingUpdating/EditRoomModal.jsx';
import AddRoomModal from '../components/FlatAddingUpdating/AddRoomModal.jsx';
import SpecialPricesModal from '../components/FlatAddingUpdating/SpecialPricesModal.jsx';
import BookingsCalendarModal from '../components/FlatAddingUpdating/BookingsCalendarModal.jsx';
import { GetOwnerBuildingsFlatUseCase } from '../../core/useCases/GetBuildingsFlatUseCase.js';
import { GetOwnerFlatUseCase } from '../../core/useCases/GetFlatByIdUseCase.js';
import { GetOwnerBuildingsUseCase } from '../../core/useCases/GetOwnerBuildingsUseCase.js';

// Sub-components
import BuildingHeader from '../components/BuildingDetails/BuildingHeader';
import TabNavigation from '../components/BuildingDetails/TabNavigation';
import BuildingDetailsTab from '../components/BuildingDetails/Buildingdetailstab.jsx';
import BuildingFlatsTab from '../components/BuildingDetails/BuildingFlatsTab';
import BuildingImagesTab from '../components/BuildingDetails/BuildingImagesTab';
import BuildingOffersTab from '../components/BuildingDetails/BuildingOffersTab.jsx';
import LoadingOverlay from '../components/BuildingDetails/LoadingOverlay';
import { Skeleton, CardSkeletonGrid } from '../components/Skeleton.jsx';

// Utilities
import {
    getBuildingId,
    getCoverImage,
    getBuildingImages,
    validateBuilding,
    mergeUpdatedBuilding,
} from '../../core/utils/helper/Helpers.js';

// Styles
import '../styles/Buildingdetails.css';

/**
 * BuildingDetail Component
 * Main component that displays comprehensive building information
 */
export default function BuildingDetail({ building, onUpdateBuilding }) {
    const { t, lang } = useTranslation();

    // ===== STATE =====
    const [localBuilding, setLocalBuilding] = useState(building);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [flats, setFlats] = useState([]);
    const [loadingFlats, setLoadingFlats] = useState(false);
    const [editingFlat, setEditingFlat] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editLoadingFlat, setEditLoadingFlat] = useState(false);

    // Special Prices Modal State
    const [isSetPricesModalOpen, setIsSetPricesModalOpen] = useState(false);
    const [selectedFlatForPrices, setSelectedFlatForPrices] = useState(null);

    // Bookings Modal State
    const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false);
    const [selectedFlatForBookings, setSelectedFlatForBookings] = useState(null);

    // "No buildings at all yet" detection — used to tell a genuinely empty
    // account apart from the brief moment while Header is still fetching the
    // owner's building list, so a brand-new owner sees a real empty state
    // with a way to add their first building instead of an endless skeleton.
    const [buildingsCheck, setBuildingsCheck] = useState({ checked: false, empty: false });
    const [isFirstBuildingOpen, setIsFirstBuildingOpen] = useState(false);

    // ===== EFFECTS =====
    useEffect(() => {
        if (building) return;
        let cancelled = false;
        GetOwnerBuildingsUseCase.execute()
            .then((list) => {
                if (cancelled) return;
                setBuildingsCheck({ checked: true, empty: !Array.isArray(list) || list.length === 0 });
            })
            .catch(() => { if (!cancelled) setBuildingsCheck({ checked: true, empty: false }); });
        return () => { cancelled = true; };
    }, [building]);

    useEffect(() => {
        if (building) {
            const enrichedBuilding = {
                ...building,
                id: getBuildingId(building),
                coverImg: getCoverImage(building),
                images: getBuildingImages(building),
            };
            setLocalBuilding(enrichedBuilding);
        }
    }, [building, building?.id, building?.coverImg, building?.raw?.coverimg]);

    useEffect(() => {
        const buildingId = getBuildingId(localBuilding);
        if (buildingId) {
            fetchFlats();
        }
    }, [localBuilding?.id, localBuilding?.raw?.id]);

    // ===== HANDLERS =====
    const fetchFlats = async () => {
        const buildingId = getBuildingId(localBuilding);
        if (!buildingId) return;

        try {
            setLoadingFlats(true);
            const result = await GetOwnerBuildingsFlatUseCase.execute(buildingId);
            const flatsData = Array.isArray(result) ? result : [];
            setFlats(flatsData);
        } catch (error) {
            console.error('[BuildingDetail] Error fetching flats:', error);
            setFlats([]);
        } finally {
            setLoadingFlats(false);
        }
    };

    const handleEditBuilding = () => {
        const validation = validateBuilding(localBuilding);
        if (!validation.isValid) {
            alert(`Error: ${validation.error}. Please refresh the page.`);
            return;
        }
        setIsEditOpen(true);
    };

    const handleUpdate = (updatedRaw) => {
        const updated = mergeUpdatedBuilding(localBuilding, updatedRaw);
        setLocalBuilding(updated);
        if (onUpdateBuilding) onUpdateBuilding(updated);
        setIsEditOpen(false);
    };

    const handleEditFlat = async (flat) => {
        console.log('[BuildingDetail] Edit flat clicked:', flat);

        if (!flat?.id) {
            alert('Error: Flat ID is missing');
            return;
        }

        setEditLoadingFlat(true);

        try {
            console.log('[BuildingDetail] Fetching flat data for ID:', flat.id);
            const freshFlatData = await GetOwnerFlatUseCase.execute(flat.id);
            console.log('[BuildingDetail] Fresh flat data received:', freshFlatData);

            let flatToEdit = null;

            if (!freshFlatData) {
                console.error('[BuildingDetail] No data returned from API');
                alert('Error: No flat data returned');
                return;
            }

            if (Array.isArray(freshFlatData)) {
                if (freshFlatData.length > 0) {
                    flatToEdit = freshFlatData[0];
                } else {
                    console.error('[BuildingDetail] Empty array returned');
                    alert('Error: Flat data is empty');
                    return;
                }
            }
            else if (typeof freshFlatData === 'object') {
                flatToEdit = freshFlatData;
            }
            else {
                console.warn('[BuildingDetail] Unexpected response format, using original flat');
                flatToEdit = flat;
            }

            if (flatToEdit && flatToEdit.id) {
                console.log('[BuildingDetail] Setting editing flat:', flatToEdit);
                setEditingFlat(flatToEdit);
                setIsEditModalOpen(true);
            } else {
                console.error('[BuildingDetail] Flat object invalid or missing ID');
                alert('Error: Invalid flat data');
            }

        } catch (error) {
            console.error('[BuildingDetail] Error loading flat:', error);
            alert(`Error loading flat: ${error.message}`);
        } finally {
            setEditLoadingFlat(false);
        }
    };

    const handleSetPrices = (flat) => {
        console.log('[BuildingDetail] Set prices clicked for flat:', flat);

        if (!flat?.id) {
            alert('Error: Flat ID is missing');
            return;
        }

        setSelectedFlatForPrices(flat);
        setIsSetPricesModalOpen(true);
    };

    const handleClosePricesModal = () => {
        console.log('[BuildingDetail] Closing set prices modal');
        setIsSetPricesModalOpen(false);
        setSelectedFlatForPrices(null);
    };

    // ===== NEW: Bookings Handlers =====
    const handleViewBookings = (flat) => {
        console.log('[BuildingDetail] View bookings clicked for flat:', flat);

        if (!flat?.id) {
            alert('Error: Flat ID is missing');
            return;
        }

        setSelectedFlatForBookings(flat);
        setIsBookingsModalOpen(true);
    };

    const handleCloseBookingsModal = () => {
        console.log('[BuildingDetail] Closing bookings modal');
        setIsBookingsModalOpen(false);
        setSelectedFlatForBookings(null);
    };

    const handleDeleteFlat = (flatId) => {
        if (confirm('Are you sure you want to delete this flat?')) {
            // TODO: Implement delete API call
        }
    };

    const handleAddFlat = () => {
        setIsModalOpen(true);
    };

    const handleFlatUpdate = () => {
        console.log('[BuildingDetail] Flat updated, closing modal and refreshing list');
        setIsEditModalOpen(false);
        setEditingFlat(null);
        fetchFlats();
    };

    // ===== TAB CONFIGURATION =====
    const tabs = [
        { key: 'details', label: t('details') || 'Details', icon: 'fa-solid fa-circle-info' },
        { key: 'flats', label: t('flats') || 'Flats', icon: 'fa-solid fa-building' },
        { key: 'offers', label: t('today_offer_tab_label') || "Today's Offer", icon: 'fa-solid fa-bolt' },
        { key: 'images', label: t('images') || 'Images', icon: 'fa-solid fa-images' },
    ];

    // ===== EMPTY STATE (genuinely zero buildings on the account) =====
    if ((!building || !localBuilding) && buildingsCheck.checked && buildingsCheck.empty) {
        return (
            <div className="building-detail-container">
                <div className="empty-state">
                    <i className="ti ti-building empty-state__icon" />
                    <p className="empty-state__text">{t('no_buildings_yet') || 'No buildings added yet'}</p>
                    <p className="empty-state__subtext">{t('no_buildings_hint') || 'Add your first building to start managing flats and bookings.'}</p>
                    <button className="btn btn-primary" onClick={() => setIsFirstBuildingOpen(true)} style={{ marginTop: '12px' }}>
                        <i className="ti ti-plus" />
                        {t('add_building') || 'Add Building'}
                    </button>
                </div>
                {isFirstBuildingOpen && (
                    <AddBuildingModal
                        isOpen={isFirstBuildingOpen}
                        onClose={() => setIsFirstBuildingOpen(false)}
                        onSaved={() => window.location.reload()}
                    />
                )}
            </div>
        );
    }

    // ===== LOADING STATE =====
    if (!building || !localBuilding) {
        return (
            <div className="building-detail-container">
                <Skeleton height="300px" style={{ borderRadius: 'var(--radius-xl)', marginBottom: '24px' }} />
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                    <Skeleton width="110px" height="38px" style={{ borderRadius: '10px' }} />
                    <Skeleton width="90px" height="38px" style={{ borderRadius: '10px' }} />
                    <Skeleton width="100px" height="38px" style={{ borderRadius: '10px' }} />
                </div>
                <CardSkeletonGrid count={3} />
            </div>
        );
    }

    // ===== RENDER =====
    return (
        <div className="building-detail-container">
            {/* Header */}
            <BuildingHeader
                building={localBuilding}
                lang={lang}
                t={t}
                onEditClick={handleEditBuilding}
            />

            {/* Tabs */}
            <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            {activeTab === 'details' && <BuildingDetailsTab building={localBuilding} lang={lang} t={t} />}

            {activeTab === 'offers' && <BuildingOffersTab key={getBuildingId(localBuilding)} building={localBuilding} t={t} />}

            {activeTab === 'flats' && (
                <BuildingFlatsTab
                    flats={flats}
                    loading={loadingFlats}
                    t={t}
                    onAddFlat={handleAddFlat}
                    onEditFlat={handleEditFlat}
                    onDeleteFlat={handleDeleteFlat}
                    onSetPrices={handleSetPrices}
                    onViewBookings={handleViewBookings}
                />
            )}

            {activeTab === 'images' && (
                <BuildingImagesTab
                    coverImg={localBuilding.coverImg}
                    images={localBuilding.images}
                    imageLoadError={false}
                    t={t}
                />
            )}

            {/* Modals */}
            <EditBuildingModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} building={localBuilding} onUpdate={handleUpdate} />

            {isModalOpen && (
                <AddRoomModal
                    id={getBuildingId(localBuilding)}
                    onClose={() => setIsModalOpen(false)}
                    onSave={() => {
                        setIsModalOpen(false);
                        fetchFlats();
                    }}
                />
            )}

            {/* Edit Flat Modal */}
            {isEditModalOpen && editingFlat ? (
                <EditRoomModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        console.log('[BuildingDetail] Closing edit modal');
                        setIsEditModalOpen(false);
                        setEditingFlat(null);
                    }}
                    flat={editingFlat}
                    onUpdate={handleFlatUpdate}
                />
            ) : null}

            {/* Special Prices Modal */}
            {isSetPricesModalOpen && selectedFlatForPrices ? (
                <SpecialPricesModal
                    isOpen={isSetPricesModalOpen}
                    onClose={handleClosePricesModal}
                    flatId={selectedFlatForPrices.id}
                    flatName={selectedFlatForPrices.nameEn || selectedFlatForPrices.nameAr}
                />
            ) : null}

            {/* Bookings Calendar Modal */}
            {isBookingsModalOpen && selectedFlatForBookings ? (
                <BookingsCalendarModal
                    isOpen={isBookingsModalOpen}
                    onClose={handleCloseBookingsModal}
                    flatId={selectedFlatForBookings.id}
                    flatName={selectedFlatForBookings.nameEn || selectedFlatForBookings.nameAr}
                />
            ) : null}

            {/* Loading Overlay */}
            <LoadingOverlay isVisible={editLoadingFlat} message={t('loading') || 'Loading flat details...'} />
        </div>
    );
}