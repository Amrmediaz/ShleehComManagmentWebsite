import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import EditBuildingModal from './EditBuildingModal.jsx';
import EditRoomModal from '../components/FlatAddingUpdating/EditRoomModal.jsx';
import AddRoomModal from '../components//FlatAddingUpdating/AddRoomModal.jsx';
import { GetOwnerBuildingsFlatUseCase } from '../../core/useCases/GetBuildingsFlatUseCase.js';
import { GetOwnerFlatUseCase } from '../../core/useCases/GetFlatByIdUseCase.js';

// Sub-components
import BuildingHeader from '../components/BuildingDetails/BuildingHeader';
import TabNavigation from '../components/BuildingDetails/TabNavigation';
import BuildingDetailsTab from '../components/BuildingDetails/Buildingdetailstab.jsx';
import BuildingFlatsTab from '../components/BuildingDetails/BuildingFlatsTab';
import BuildingImagesTab from '../components/BuildingDetails/BuildingImagesTab';
import LoadingOverlay from '../components/BuildingDetails/LoadingOverlay';

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
 * Includes header, tabs for details/flats/images, and modal management
 *
 * @component
 * @param {Object} props
 * @param {Object} props.building - Building data from parent
 * @param {Function} props.onUpdateBuilding - Callback when building is updated
 * @returns {React.ReactElement}
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

    // ===== EFFECTS =====
    /**
     * Update local building when props change
     */
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

    /**
     * Fetch flats when building ID changes
     */
    useEffect(() => {
        const buildingId = getBuildingId(localBuilding);
        if (buildingId) {
            fetchFlats();
        }
    }, [localBuilding?.id, localBuilding?.raw?.id]);

    // ===== HANDLERS =====
    /**
     * Fetch flats for the building
     */
    const fetchFlats = async () => {
        const buildingId = getBuildingId(localBuilding);
        if (!buildingId) return;

        try {
            setLoadingFlats(true);
            const result = await GetOwnerBuildingsFlatUseCase.execute(buildingId);
            const flatsData = Array.isArray(result) ? result : [];
            setFlats(flatsData);
        } catch (error) {
            setFlats([]);
        } finally {
            setLoadingFlats(false);
        }
    };

    /**
     * Handle edit building button click
     */
    const handleEditBuilding = () => {
        const validation = validateBuilding(localBuilding);
        if (!validation.isValid) {
            alert(`Error: ${validation.error}. Please refresh the page.`);
            return;
        }
        setIsEditOpen(true);
    };

    /**
     * Handle building update from modal
     */
    const handleUpdate = (updatedRaw) => {
        const updated = mergeUpdatedBuilding(localBuilding, updatedRaw);
        setLocalBuilding(updated);
        if (onUpdateBuilding) onUpdateBuilding(updated);
        setIsEditOpen(false);
    };

    /**
     * Handle edit flat click
     */
    const handleEditFlat = async (flat) => {
        setEditLoadingFlat(true);
        try {
            const freshFlatData = await GetOwnerFlatUseCase.execute(flat.id);

            if (Array.isArray(freshFlatData) && freshFlatData.length > 0) {
                setEditingFlat(freshFlatData[0]);
                setIsEditModalOpen(true);
            } else if (freshFlatData && typeof freshFlatData === 'object' && !Array.isArray(freshFlatData)) {
                setEditingFlat(freshFlatData);
                setIsEditModalOpen(true);
            } else {
                alert('Failed to load flat data. Please try again.');
            }
        } catch (error) {
            alert(`Error loading flat: ${error.message}`);
        } finally {
            setEditLoadingFlat(false);
        }
    };

    /**
     * Handle delete flat (placeholder for future implementation)
     */
    const handleDeleteFlat = (flatId) => {
        if (confirm('Are you sure you want to delete this flat?')) {
            // TODO: Implement delete API call
        }
    };

    /**
     * Handle add flat button click
     */
    const handleAddFlat = () => {
        setIsModalOpen(true);
    };

    /**
     * Handle flat update from modal
     */
    const handleFlatUpdate = () => {
        setIsEditModalOpen(false);
        setEditingFlat(null);
        fetchFlats();
    };

    // ===== TAB CONFIGURATION =====
    const tabs = [
        { key: 'details', label: t('details') || 'Details', icon: 'fa-solid fa-circle-info' },
        { key: 'flats', label: t('flats') || 'Flats', icon: 'fa-solid fa-building' },
        { key: 'images', label: t('images') || 'Images', icon: 'fa-solid fa-images' },
    ];

    // ===== LOADING STATE =====
    if (!building || !localBuilding) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '12px', color: '#64748b' }}>
                <i className="fa-solid fa-building" style={{ fontSize: '32px', opacity: 0.3 }} />
                <p style={{ margin: 0 }}>{t('loading_building_details')}</p>
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

            {activeTab === 'flats' && (
                <BuildingFlatsTab
                    flats={flats}
                    loading={loadingFlats}
                    t={t}
                    onAddFlat={handleAddFlat}
                    onEditFlat={handleEditFlat}
                    onDeleteFlat={handleDeleteFlat}
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

            {isEditModalOpen && editingFlat && (
                <EditRoomModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingFlat(null);
                    }}
                    flat={editingFlat}
                    onUpdate={handleFlatUpdate}
                />
            )}

            {/* Loading Overlay */}
            <LoadingOverlay isVisible={editLoadingFlat} message={t('loading') || 'Loading flat details...'} />
        </div>
    );
}