import React from 'react';
import { useTranslation } from '../../context/LanguageContext.jsx';

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{t('confirm_logout')}</h3>
                <p>{t('logout_confirmation_message')}</p>
                <div className="modal-buttons">
                    <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
                    <button className="btn btn-danger" onClick={onConfirm}>{t('logout')}</button>
                </div>
            </div>
        </div>
    );
}