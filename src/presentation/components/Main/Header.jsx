import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import AddPropertyModal from '../../pages/AddBuildingModal.jsx';
import LogoutModal from '../../components/Profile/LogoutModal.jsx';
import ProfileModal from '../../components/Profile/ProfileModal.jsx';
import { GetOwnerBuildingsUseCase } from '../../../core/useCases/GetOwnerBuildingsUseCase.js';

export default function Header({ selectedBuilding, onBuildingChange }) {
    const { lang, toggleLanguage, t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [buildings, setBuildings] = useState([]);
    const [loadingBuildings, setLoadingBuildings] = useState(true);
    const menuRef = useRef(null);

    // Fetch buildings on mount
    const fetchBuildings = async () => {
        try {
            setLoadingBuildings(true);
            const list = await GetOwnerBuildingsUseCase.execute();
            setBuildings(list);
            // Auto-select first building if nothing selected yet
            if (list.length > 0 && !selectedBuilding) {
                onBuildingChange(list[0].id, list[0]);
            }
        } catch (err) {
            console.error('[Header] Failed to fetch buildings:', err);
        } finally {
            setLoadingBuildings(false);
        }
    };

    useEffect(() => {
        fetchBuildings();
    }, []);

    // Re-fetch when modal closes (a new building may have been added)
    const handleModalClose = () => {
        setIsModalOpen(false);
        fetchBuildings();
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectChange = (e) => {
        const id = Number(e.target.value);
        const building = buildings.find(b => b.id === id);
        onBuildingChange(id, building);
    };

    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '12px 20px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            width: '100%',
            boxSizing: 'border-box',
        }}>

            {/* Left: Property selector */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                flex: '1 1 auto',
                minWidth: 0,
            }}>
                <span className="selector-label">{t('active_property')}</span>

                {loadingBuildings ? (
                    <span style={{ fontSize: '14px', color: '#64748b' }}>
                        {t('loading') || 'Loading...'}
                    </span>
                ) : buildings.length > 0 ? (
                    <select
                        value={selectedBuilding || ''}
                        onChange={handleSelectChange}
                    >
                        {buildings.map(b => (
                            <option key={b.id} value={b.id}>
                                {lang === 'ar' ? (b.nameAr || b.nameEn) : (b.nameEn || b.nameAr)}
                            </option>
                        ))}
                    </select>
                ) : (
                    <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                        {t('no_buildings')}
                    </span>
                )}

                <button className="btn btn-secondary" onClick={() => setIsModalOpen(true)}>
                    <i className="fa-solid fa-circle-plus"></i> {t('add_building')}
                </button>
            </div>

            {/* Right: Language + Profile */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: '0 0 auto',
                marginInlineStart: 'auto',
            }}>
                {/* Language toggle */}
                <button
                    onClick={toggleLanguage}
                    style={{
                        cursor: 'pointer',
                        background: 'transparent',
                        border: '1px solid #cbd5e1',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        height: '36px',
                    }}
                >
                    {lang === 'en' ? 'العربية' : 'English'}
                </button>

                {/* Profile dropdown */}
                <div ref={menuRef} style={{ position: 'relative' }}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{
                            cursor: 'pointer',
                            background: 'transparent',
                            border: '1px solid #cbd5e1',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap',
                            height: '36px',
                        }}
                    >
                        <i className="fa-solid fa-user"></i>
                        <span>{t('profile')}</span>
                    </button>

                    {isMenuOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            insetInlineEnd: 0,
                            marginTop: '8px',
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '6px 0',
                            zIndex: 1000,
                            minWidth: '160px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            textAlign: lang === 'ar' ? 'right' : 'left',
                        }}>
                            <div
                                style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onClick={() => { setIsProfileModalOpen(true); setIsMenuOpen(false); }}
                            >
                                <i className="fa-solid fa-id-card"></i>
                                <span>{t('view_profile')}</span>
                            </div>
                            <hr style={{ border: 0, borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
                            <div
                                style={{ padding: '10px 16px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onClick={() => { setIsLogoutOpen(true); setIsMenuOpen(false); }}
                            >
                                <i className="fa-solid fa-right-from-bracket"></i>
                                <span>{t('logout')}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
            <AddPropertyModal isOpen={isModalOpen} onClose={handleModalClose} />
            <LogoutModal
                isOpen={isLogoutOpen}
                onClose={() => setIsLogoutOpen(false)}
                onConfirm={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/management/login';
                }}
            />
        </header>
    );
}