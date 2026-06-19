import React from 'react';
import '../../styles/AddBuildingModal.css';

/**
 * ContactSection Component
 * Displays contact information fields
 */
export default function ContactSection({
                                           managmentPhone, setManagmentPhone,
                                           workerPhone, setWorkerPhone,
                                           t, isRTL
                                       }) {
    return (
        <section>
            <div className="modal-section-title">{isRTL ? 'بيانات التواصل' : 'Contact Information'}</div>
            <div className="modal-grid-2">
                <div>
                    <label className="modal-label">{isRTL ? 'هاتف الإدارة' : 'Management Phone'}
                        <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                        className="modal-input"
                        type="tel"
                        style={{ direction: 'ltr' }}
                        placeholder="+968 9X XXX XXXX"
                        value={managmentPhone}
                        onChange={e => setManagmentPhone(e.target.value)}
                    />
                </div>
                <div>
                    <label className="modal-label">{isRTL ? 'هاتف العمال' : 'Worker Phone'}
                        <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                        className="modal-input"
                        type="tel"
                        style={{ direction: 'ltr' }}
                        placeholder="+968 9X XXX XXXX"
                        value={workerPhone}
                        onChange={e => setWorkerPhone(e.target.value)}
                    />
                </div>
            </div>
        </section>
    );
}