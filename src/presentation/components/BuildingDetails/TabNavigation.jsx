import React from 'react';
import '../../styles/Buildingdetails.css';

/**
 * TabNavigation Component
 * Displays tab navigation with icons and labels
 *
 * @component
 * @param {Object} props
 * @param {Array} props.tabs - Array of tab objects { key, label, icon }
 * @param {string} props.activeTab - Currently active tab key
 * @param {Function} props.onTabChange - Callback when tab is clicked
 * @returns {React.ReactElement}
 *
 * @example
 * <TabNavigation
 *   tabs={[
 *     { key: 'details', label: 'Details', icon: 'fa-solid fa-circle-info' },
 *     { key: 'flats', label: 'Flats', icon: 'fa-solid fa-building' },
 *   ]}
 *   activeTab="details"
 *   onTabChange={(key) => setActiveTab(key)}
 * />
 */
const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="tabs-container">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    className={`tab-button ${activeTab === tab.key ? 'tab-button--active' : ''}`}
                    onClick={() => onTabChange(tab.key)}
                >
                    <i className={tab.icon} />
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default TabNavigation;