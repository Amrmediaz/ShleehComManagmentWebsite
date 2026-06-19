import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './presentation/components/Main/Sidebar';
import Header from './presentation/components/Main/Header';
import BuildingDetail from './presentation/pages/BuildingDetail';
import LoginPage from './presentation/pages/Login.jsx';
import RegisterPage from './presentation/pages/Register.jsx';
import ResetPassword from './presentation/pages/ResetPassword.jsx';
import { dictionary } from './core/localization/dictionary';

// 🔒 Protected Route — checks token
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/management/login" replace />;
    return children;
};

// 🔓 Public Route — redirects logged-in users away from login/register
const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (token) return <Navigate to="management/" replace />;
    return children;
};

export default function App() {
    const [currentScreen, setCurrentScreen] = useState('buildings');
    const [currentLang, setCurrentLang] = useState('en');

    // selectedBuilding is the FULL building object from the API
    // Header fetches the list and calls onBuildingChange(id, buildingObject)
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [selectedBuildingId, setSelectedBuildingId] = useState(null);

    const changeBuilding = (id, buildingObject) => {
        setSelectedBuildingId(id);
        setSelectedBuilding(buildingObject);
    };

    const t = (key) => dictionary[currentLang]?.[key] || key;

    useEffect(() => {
        document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = currentLang;
    }, [currentLang]);

    return (
        <Router>
            <Routes>
                {/* Root Redirect */}
                <Route path="/" element={<Navigate to="/management/login" replace />} />

                {/* PUBLIC ROUTES - Checked FIRST (before wildcard) */}
                <Route path="/management/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/management/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                <Route path="/management/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

                {/* PROTECTED ROUTES - Checked LAST (wildcard catches rest) */}
                <Route path="/management/*" element={
                    <ProtectedRoute>
                        <div className="app-wrapper">
                            <Sidebar currentScreen={currentScreen} setScreen={setCurrentScreen} t={t} />
                            <div style={{ flexGrow: 1, width: '100%' }}>
                                <Header
                                    selectedBuilding={selectedBuildingId}
                                    onBuildingChange={changeBuilding}
                                    currentLang={currentLang}
                                    onLanguageChange={setCurrentLang}
                                    onNavigate={setCurrentScreen}
                                    t={t}
                                />
                                <main style={{ padding: '32px' }}>
                                    {/*{currentScreen === 'dashboard' && (*/}
                                    {/*    <Dashboard*/}
                                    {/*        building={selectedBuilding}*/}
                                    {/*        onNavigate={setCurrentScreen}*/}
                                    {/*    />*/}
                                    {/*)}*/}
                                    {currentScreen === 'buildings' && (
                                        <BuildingDetail
                                            building={selectedBuilding}
                                            onNavigate={setCurrentScreen}
                                            t={t}
                                        />
                                    )}
                                    {/*{currentScreen === 'calendar' && (*/}
                                    {/*    <CalendarView*/}
                                    {/*        building={selectedBuilding}*/}
                                    {/*        t={t}*/}
                                    {/*    />*/}
                                    {/*)}*/}
                                    {/*{currentScreen === 'new-booking' && (*/}
                                    {/*    <BookingForm*/}
                                    {/*        building={selectedBuilding}*/}
                                    {/*        onNavigate={setCurrentScreen}*/}
                                    {/*        t={t}*/}
                                    {/*    />*/}
                                    {/*)}*/}
                                    {/*{currentScreen === 'bookings-list' && (*/}
                                    {/*    <BookingList*/}
                                    {/*        building={selectedBuilding}*/}
                                    {/*        t={t}*/}
                                    {/*    />*/}
                                    {/*)}*/}
                                </main>
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}