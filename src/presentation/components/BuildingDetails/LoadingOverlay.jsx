import React from 'react';
import '../../styles/Buildingdetails.css';

/**
 * LoadingOverlay Component
 * Displays a full-screen loading overlay with spinner
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isVisible - Whether to show the overlay
 * @param {string} props.message - Loading message to display
 * @returns {React.ReactElement|null}
 *
 * @example
 * <LoadingOverlay isVisible={isLoading} message="Loading flat details..." />
 */
const LoadingOverlay = ({ isVisible, message = 'Loading...' }) => {
    if (!isVisible) return null;

    return (
        <div className="loading-overlay">
            <div className="loading-overlay__content">
                <div className="loading-spinner" />
                <p className="loading-overlay__text">{message}</p>
            </div>
        </div>
    );
};

export default LoadingOverlay;