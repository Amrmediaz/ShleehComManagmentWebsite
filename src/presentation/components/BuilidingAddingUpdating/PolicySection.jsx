import React from 'react';
import '../../styles/AddBuildingModal.css';

/**
 * PolicySection Component
 * Displays check-in/out times and policy-related form fields
 */
export default function PolicySection({
                                          check_In, setCheckIn,
                                          check_Out, setCheckOut,
                                          cancelation_policyAr, setCancelPolicyAr,
                                          cancelation_policyEn, setCancelPolicyEn,
                                          buildingPolicyAr, setBuildingPolicyAr,
                                          buildingPolicyEn, setBuildingPolicyEn,
                                          t, isRTL
                                      }) {
    return (
        <section>
            <div className="modal-section-title">{t('complex_status')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Check-in/out Times */}
                <div className="modal-grid-3">
                    <div>
                        <label className="modal-label">{t('check_in')}
                            <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            className="modal-input"
                            type="time"
                            value={check_In}
                            onChange={e => setCheckIn(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="modal-label">{t('check_out')}
                            <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            className="modal-input"
                            type="time"
                            value={check_Out}
                            onChange={e => setCheckOut(e.target.value)}
                        />
                    </div>
                </div>

                {/* Cancellation Policies */}
                <div className="modal-grid-2">
                    <div>
                        <label className="modal-label">
                            {isRTL ? 'سياسة الإلغاء (عربي)' : 'Cancellation Policy (Arabic)'}
                            <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea
                            className="modal-textarea"
                            style={{ direction: 'rtl' }}
                            placeholder="سياسة الإلغاء..."
                            value={cancelation_policyAr}
                            onChange={e => setCancelPolicyAr(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="modal-label">
                            {isRTL ? 'سياسة الإلغاء (إنجليزي)' : 'Cancellation Policy (English)'}
                       
                        </label>
                        <textarea
                            className="modal-textarea"
                            style={{ direction: 'ltr' }}
                            placeholder="Cancellation policy..."
                            value={cancelation_policyEn}
                            onChange={e => setCancelPolicyEn(e.target.value)}
                        />
                    </div>
                </div>

                {/* Building Policies */}
                <div className="modal-grid-2">
                    <div>
                        <label className="modal-label">
                            {isRTL ? 'سياسة المبنى (عربي)' : 'Building Policy (Arabic)'}
                            <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea
                            className="modal-textarea"
                            style={{ direction: 'rtl' }}
                            placeholder="قواعد المبنى..."
                            value={buildingPolicyAr}
                            onChange={e => setBuildingPolicyAr(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="modal-label">
                            {isRTL ? 'سياسة المبنى (إنجليزي)' : 'Building Policy (English)'}
                        </label>
                        <textarea
                            className="modal-textarea"
                            style={{ direction: 'ltr' }}
                            placeholder="Building rules..."
                            value={buildingPolicyEn}
                            onChange={e => setBuildingPolicyEn(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}