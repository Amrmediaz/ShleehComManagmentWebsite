import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';

import Sidebar from './presentation/components/Main/Sidebar';
import Header from './presentation/components/Main/Header';
import BuildingDetail from './presentation/pages/BuildingDetail';
import LoginPage from './presentation/pages/Login.jsx';
import RegisterPage from './presentation/pages/Register.jsx';
import ResetPassword from './presentation/pages/ResetPassword.jsx';
import { dictionary } from './core/localization/dictionary';
import CalendarPage from "./presentation/pages/CalendarPage.jsx";
import Dashboard from "./presentation/pages/Dashboard.jsx";
import BookingListPage from "./presentation/pages/BookingList.jsx";
import ChaletsPage from "./presentation/pages/ChaletsPage.jsx";

const DEFAULT_SCREEN = 'buildings';
const SELECTED_BUILDING_KEY = 'shleeh_selected_building_id';

// 🔒 Protected Route — checks token
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/management/login" replace />;
    return children;
};

// 🔓 Public Route — redirects logged-in users away from login/register
const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (token) return <Navigate to={`/management/${DEFAULT_SCREEN}`} replace />;
    return children;
};

/**
 * AppLayout
 * The Sidebar/Header/main shell for everything under /management/:screen.
 * The current screen lives in the URL (not plain component state) so a
 * browser refresh lands back on the same page instead of resetting to
 * Buildings — react-router just re-derives `screen` from the URL on load.
 * The selected building is similarly persisted (sessionStorage) so a
 * refresh keeps the same building selected too.
 */
function AppLayout() {
    const navigate = useNavigate();
    const { screen } = useParams();
    const currentScreen = screen || DEFAULT_SCREEN;
    const setCurrentScreen = (next) => navigate(`/management/${next}`);

    const [currentLang, setCurrentLang] = useState('en');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // selectedBuilding is the FULL building object from the API
    // Header fetches the list and calls onBuildingChange(id, buildingObject)
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [selectedBuildingId, setSelectedBuildingId] = useState(() => {
        const stored = sessionStorage.getItem(SELECTED_BUILDING_KEY);
        return stored ? Number(stored) : null;
    });

    const changeBuilding = (id, buildingObject) => {
        setSelectedBuildingId(id);
        setSelectedBuilding(buildingObject);
        if (id) sessionStorage.setItem(SELECTED_BUILDING_KEY, String(id));
    };

    const t = (key) => dictionary[currentLang]?.[key] || key;

    useEffect(() => {
        document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = currentLang;
    }, [currentLang]);

    return (
        <div className="app-wrapper">
            {/* Mobile-only fixed top bar with the hamburger toggle — the sidebar
                itself is off-screen (translateX) below 992px until this opens it. */}
            <div className="mobile-hud">
                <button
                    type="button"
                    className="menu-toggle-btn"
                    aria-label={t('open_menu') || 'Open menu'}
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <i className="fa-solid fa-bars"></i>
                </button>
                <span className="mobile-hud-brand">
                    <i className="fa-solid fa-building-circle-check"></i>
                    {t('logo_title')}
                </span>
            </div>
            {/* Dark backdrop behind the open mobile drawer — tapping it closes it. */}
            <div
                className={`sidebar-overlay ${mobileMenuOpen ? 'mobile-open' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            />
            <Sidebar
                currentScreen={currentScreen}
                setScreen={setCurrentScreen}
                mobileOpen={mobileMenuOpen}
                closeSidebar={() => setMobileMenuOpen(false)}
                t={t}
            />
            <div style={{ flexGrow: 1, width: '100%' }}>
                <Header
                    selectedBuilding={selectedBuildingId}
                    onBuildingChange={changeBuilding}
                    currentLang={currentLang}
                    onLanguageChange={setCurrentLang}
                    onNavigate={setCurrentScreen}
                    currentScreen={currentScreen}
                    t={t}
                />
                <main>
                    {currentScreen === 'dashboard' && (
                        <Dashboard
                            onNavigate={setCurrentScreen}
                        />
                    )}
                    {currentScreen === 'buildings' && (
                        <BuildingDetail
                            building={selectedBuilding}
                            onNavigate={setCurrentScreen}
                            t={t}
                        />
                    )}
                    {currentScreen === 'calendar' && (
                        <CalendarPage
                            building={selectedBuilding}
                            t={t}
                        />
                    )}
                    {currentScreen === 'bookings-list' && (
                        <BookingListPage
                            building={selectedBuilding}
                            t={t}
                        />
                    )}
                    {currentScreen === 'chalets' && (
                        <ChaletsPage />
                    )}
                </main>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Root Redirect */}
                <Route path="/" element={<Navigate to="/management/login" replace />} />

                {/* PUBLIC ROUTES - Checked FIRST (before wildcard) */}
                <Route path="/management/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/management/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                <Route path="/management/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

                {/* Bare /management → default screen, so the current screen always lives in the URL */}
                <Route path="/management" element={<Navigate to={`/management/${DEFAULT_SCREEN}`} replace />} />

                {/* PROTECTED ROUTES — the screen name is a URL param, so refreshing
                    the page keeps you on the same screen instead of bouncing to Buildings */}
                <Route path="/management/:screen" element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}
