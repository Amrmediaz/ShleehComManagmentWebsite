import React from 'react';
import '../../styles/AddBuildingModal.css';

/**
 * FormActions Component
 * Displays form submission buttons (Cancel and Save)
 */
export default function FormActions({ onSubmit, onCancel, isLoading, t, isRTL }) {
    return (
        <div style={{ display: 'flex', gap: '12px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <button onClick={onCancel} className="modal-btn modal-btn--secondary">
                {t('cancel')}
            </button>
            <button
                onClick={onSubmit}
                disabled={isLoading}
                className="modal-btn modal-btn--primary"
                style={{
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
            >
                {isLoading ? (isRTL ? 'جاري الحفظ...' : 'Saving…') : t('save') || (isRTL ? 'حفظ' : 'Save')}
            </button>
        </div>
    );
}