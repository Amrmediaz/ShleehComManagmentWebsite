import React from 'react';
import '../../styles/AddBuildingModal.css';

/**
 * StatusMessage Component
 * Displays success or error messages to the user
 */
export default function StatusMessage({ message, t, isRTL }) {
    if (!message || !message.tokenKey) return null;

    return (
        <div
            className={`modal-status ${message.isError ? 'modal-status--error' : 'modal-status--success'}`}
            style={{ textAlign: isRTL ? 'right' : 'left' }}
        >
            {message.fallback || t(message.tokenKey)}
        </div>
    );
}