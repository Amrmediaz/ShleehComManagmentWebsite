import React from 'react';
import { useTranslation } from '../context/LanguageContext';

// 🟢 Added 'mobileOpen' and 'closeSidebar' as props
export default function Sidebar({ currentScreen, setScreen, mobileOpen, closeSidebar }) {
    const { t } = useTranslation();

    const menuItems = [
        // { id: 'dashboard', label: t('nav_dash'), icon: 'fa-chart-pie' },
        { id: 'buildings', label: t('nav_buildings'), icon: 'fa-city' },
        // { id: 'calendar', label: t('nav_calendar'), icon: 'fa-calendar-days' },
        // { id: 'new-booking', label: t('nav_new_booking'), icon: 'fa-calendar-plus' },
        // { id: 'bookings-list', label: t('nav_booking_list'), icon: 'fa-list-check' },
    ];

    return (
        /* 🟢 Dynamically append 'mobile-open' based on parent state */
        <aside className={mobileOpen ? 'mobile-open' : ''}>
            <div className="logo-area">
                <i className="fa-solid fa-building-circle-check fa-lg"></i>
                <span>{t('logo_title')}</span>
            </div>
            <ul className="nav-menu">
                {menuItems.map(item => (
                    <li
                        key={item.id}
                        className={`nav-item ${currentScreen === item.id ? 'active' : ''}`}
                        onClick={() => {
                            setScreen(item.id);
                            if (closeSidebar) closeSidebar(); // 🟢 Auto-hide sidebar after clicking a menu item on mobile
                        }}
                    >
                        <i className={`fa-solid ${item.icon}`}></i> <span>{item.label}</span>
                    </li>
                ))}
            </ul>
        </aside>
    );
}