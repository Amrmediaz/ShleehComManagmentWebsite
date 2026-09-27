import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../context/LanguageContext.jsx';
import { GetOwnerChaletsUseCase, GetChaletByIdUseCase } from '../../core/useCases/ChaletUseCases.js';

import ChaletCard from '../components/Chalets/ChaletCard.jsx';
import ChaletHeader from '../components/Chalets/ChaletHeader.jsx';
import ChaletDetailsTab from '../components/Chalets/ChaletDetailsTab.jsx';
import ChaletPricesTab from '../components/Chalets/ChaletPricesTab.jsx';
import ChaletOffersTab from '../components/Chalets/ChaletOffersTab.jsx';
import ChaletCalendarTab from '../components/Chalets/ChaletCalendarTab.jsx';
import ChaletBookingsTab from '../components/Chalets/ChaletBookingsTab.jsx';
import BuildingImagesTab from '../components/BuildingDetails/BuildingImagesTab.jsx';
import TabNavigation from '../components/BuildingDetails/TabNavigation.jsx';
import AddChaletModal from './AddChaletModal.jsx';
import { CardSkeletonGrid } from '../components/Skeleton.jsx';

import '../styles/Buildingdetails.css';

/**
 * ChaletsPage
 * Top-level container for the Chalets section: a grid of the owner's
 * chalets, and a detail view (with tabs) when one is opened — mirrors the
 * mobile app's ChaletListScreen ↔ ChaletOptionScreen flow.
 */
export default function ChaletsPage() {
    const { t, lang } = useTranslation();

    const [chalets, setChalets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedChalet, setSelectedChalet] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [activeTab, setActiveTab] = useState('details');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingChalet, setEditingChalet] = useState(null);

    const loadChalets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await GetOwnerChaletsUseCase.execute();
            setChalets(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error('[ChaletsPage] Failed to load chalets:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadChalets(); }, [loadChalets]);

    const openChalet = async (chalet) => {
        // Show the detail view instantly with what the list card already has
        // (name/images/price/etc.) instead of a blank screen while the fresh
        // fetch is in flight — loadingDetail's overlay covers the gap, then
        // the fuller data swaps in seamlessly once it arrives.
        setSelectedChalet(chalet);
        setLoadingDetail(true);
        setActiveTab('details');
        try {
            const fresh = await GetChaletByIdUseCase.execute(chalet.id);
            if (fresh) setSelectedChalet(fresh);
        } catch (err) {
            console.error('[ChaletsPage] Failed to load chalet details:', err);
        } finally {
            setLoadingDetail(false);
        }
    };

    const closeChaletDetail = () => setSelectedChalet(null);

    const handleEdit = (chalet) => {
        setEditingChalet(chalet);
        setIsAddOpen(true);
    };

    const handleModalClose = () => {
        setIsAddOpen(false);
        setEditingChalet(null);
    };

    const handleSaved = async () => {
        await loadChalets();
        if (selectedChalet) {
            const fresh = await GetChaletByIdUseCase.execute(selectedChalet.id);
            if (fresh) setSelectedChalet(fresh);
        }
    };

    const tabs = [
        { key: 'details', label: t('details') || 'Details', icon: 'fa-solid fa-circle-info' },
        { key: 'images', label: t('images') || 'Images', icon: 'fa-solid fa-images' },
        { key: 'prices', label: t('special_prices') || 'Special Prices', icon: 'fa-solid fa-tags' },
        { key: 'offers', label: t('today_offer_tab_label') || "Today's Offer", icon: 'fa-solid fa-bolt' },
        { key: 'calendar', label: t('calendar') || 'Calendar', icon: 'fa-solid fa-calendar-days' },
        { key: 'bookings', label: t('bookings') || 'Bookings', icon: 'fa-solid fa-list-check' },
    ];

    // ===== DETAIL VIEW =====
    if (selectedChalet) {
        return (
            <div className="building-detail-container">
                <ChaletHeader chalet={selectedChalet} t={t} lang={lang} onBack={closeChaletDetail} onEditClick={() => handleEdit(selectedChalet)} />
                <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

                {activeTab === 'details' && <ChaletDetailsTab chalet={selectedChalet} t={t} lang={lang} />}
                {activeTab === 'images' && <BuildingImagesTab coverImg={selectedChalet.coverImg} images={selectedChalet.images} imageLoadError={false} t={t} />}
                {activeTab === 'prices' && <ChaletPricesTab chaletId={selectedChalet.id} t={t} />}
                {activeTab === 'offers' && <ChaletOffersTab key={selectedChalet.id} chalet={selectedChalet} t={t} />}
                {activeTab === 'calendar' && <ChaletCalendarTab chaletId={selectedChalet.id} t={t} lang={lang} />}
                {activeTab === 'bookings' && <ChaletBookingsTab t={t} />}

                {loadingDetail && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', color: '#185FA5' }} />
                    </div>
                )}

                {isAddOpen && (
                    <AddChaletModal isOpen={isAddOpen} onClose={handleModalClose} chalet={editingChalet} onSaved={handleSaved} />
                )}
            </div>
        );
    }

    // ===== LIST VIEW =====
    return (
        <div>
            <div className="flats-header">
                <p className="flats-count">
                    {chalets.length > 0 ? `${chalets.length} ${t('chalets') || 'chalets'}` : (t('chalets') || 'Chalets')}
                </p>
                <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
                    <i className="ti ti-plus" /> {t('add_chalet') || 'Add Chalet'}
                </button>
            </div>

            {error && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                    {error}
                </div>
            )}

            {loading && <CardSkeletonGrid count={6} />}

            {!loading && chalets.length === 0 && !error && (
                <div className="empty-state">
                    <i className="ti ti-home-2 empty-state__icon" />
                    <p className="empty-state__text">{t('no_chalets') || 'No chalets added yet'}</p>
                    <p className="empty-state__subtext">{t('no_chalets_hint') || 'Add your first chalet to start accepting bookings for it.'}</p>
                    <button className="btn btn-primary" onClick={() => setIsAddOpen(true)} style={{ marginTop: '12px' }}>
                        <i className="ti ti-plus" /> {t('add_chalet') || 'Add Chalet'}
                    </button>
                </div>
            )}

            {!loading && chalets.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', padding: '4px 0' }}>
                    {chalets.map((chalet) => (
                        <ChaletCard key={chalet.id} chalet={chalet} t={t} lang={lang} onOpen={openChalet} onEdit={handleEdit} />
                    ))}
                </div>
            )}

            {isAddOpen && (
                <AddChaletModal isOpen={isAddOpen} onClose={handleModalClose} chalet={editingChalet} onSaved={handleSaved} />
            )}
        </div>
    );
}
