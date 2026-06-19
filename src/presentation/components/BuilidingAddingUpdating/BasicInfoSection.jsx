import React from 'react';
import '../../styles/AddBuildingModal.css';

/**
 * BasicInfoSection Component
 * Displays form fields for basic building information
 */
export default function BasicInfoSection({
                                             nameAr, setNameAr,
                                             nameEn, setNameEn,
                                             totalFloor, setTotalFloor,
                                             totalFlats, setTotalFlats,
                                             yearBulit, setYearBulit,
                                             buldinNumber, setBuldinNumber,
                                             buldingDescrptionAr, setDescAr,
                                             buldingDescrptionEn, setDescEn,
                                             additional_detailsAr, setAddDetailsAr,
                                             additional_detailsEn, setAddDetailsEn,
                                             t, isRTL
                                         }) {
    return (
        <section>
            <div className="modal-section-title">{t('basic_info')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Building Names */}
                <div className="modal-grid-2">
                    <div>
                        <label className="modal-label">
                            {isRTL ? 'اسم المبنى (عربي)' : 'Building Name (Arabic)'}
                            <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            className="modal-input"
                            type="text"
                            style={{ direction: 'rtl' }}
                            placeholder="الهداية للعقارات"
                            value={nameAr}
                            onChange={e => {
                                const value = e.target.value;
                                // Regex allows: Arabic characters, spaces, and Arabic-specific punctuation
                                // If empty or matches regex, update state
                                if (value === '' || /^[\u0600-\u06FF\s]*$/.test(value)) {
                                    setNameAr(value);
                                }
                            }}
                        />
                    </div>
                    <div>
                        <label className="modal-label">
                            {isRTL ? 'اسم المبنى (إنجليزي)' : 'Building Name (English)'}
                            <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            className="modal-input"
                            type="text"
                            style={{ direction: 'ltr' }}
                            placeholder="Al-Hidaya Building"
                            value={nameEn}
                            onChange={e => {
                                const value = e.target.value;
                                // Regex allows: A-Z, a-z, 0-9, spaces, and standard punctuation (.,'-)
                                // If empty or matches regex, update state
                                if (value === '' || /^[A-Za-z0-9\s.,'-]*$/.test(value)) {
                                    setNameEn(value);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Building Details */}
                <div className="modal-grid-3">
                    <div>
                        <label className="modal-label">{t('total_floors')}
                            <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        
                        <input
                            className="modal-input"
                            type="number"
                            placeholder="12"
                            min="1"
                            value={totalFloor}
                            onChange={e => setTotalFloor(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="modal-label">{t('total_flats')}
                            <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            className="modal-input"
                            type="number"
                            placeholder="48"
                            min="1"
                            value={totalFlats}
                            onChange={e => setTotalFlats(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="modal-label">{t('year_built')}
                            <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            className="modal-input"
                            type="number"
                            placeholder="2018"
                            min="1900"
                            value={yearBulit}
                            onChange={e => setYearBulit(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="modal-label">{isRTL ? 'رقم المبنى' : 'Building No.'}
                            <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            className="modal-input"
                            type="text"
                            placeholder="B-01"
                            value={buldinNumber}
                            onChange={e => setBuldinNumber(e.target.value)}
                        />
                    </div>
                </div>

                {/* Descriptions */}
                <div className="modal-grid-2">
                    <div>
                        <label className="modal-label">{isRTL ? 'وصف المبنى (عربي)' : 'Description (Arabic)'}</label>
                        <textarea
                            className="modal-textarea"
                            style={{ direction: 'rtl' }}
                            placeholder="وصف المبنى..."
                            value={buldingDescrptionAr}
                            onChange={e => {
                                const value = e.target.value;
                                // Regex allows: Arabic characters, spaces, line breaks, and standard Arabic punctuation
                                // \u0600-\u06FF: Arabic block
                                // \u060C: Arabic comma (،)
                                // \u061B: Arabic semicolon (؛)
                                // \u061F: Arabic question mark (؟)
                                if (value === '' || /^[\u0600-\u06FF\s\u060C\u061B\u061F]*$/.test(value)) {
                                    setDescAr(value);
                                }
                            }}
                        />
                    </div>
                    <div>
                        <label className="modal-label">{isRTL ? 'وصف المبنى (إنجليزي)' : 'Description (English)'}</label>
                        <textarea
                            className="modal-textarea"
                            style={{ direction: 'ltr' }}
                            placeholder="Building description..."
                            value={buldingDescrptionEn}
                            onChange={e => {
                                const value = e.target.value;
                                // Regex allows: A-Z, a-z, 0-9, spaces, common punctuation, and newlines (\n)
                                if (value === '' || /^[A-Za-z0-9\s.,!?'"()\-_\n]*$/.test(value)) {
                                    setDescEn(value);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Additional Details */}
                <div className="modal-grid-2">
                    <div>
                        <label className="modal-label">{isRTL ? 'تفاصيل إضافية (عربي)' : 'Additional Details (Arabic)'}</label>
                        <textarea
                            className="modal-textarea"
                            style={{ direction: 'rtl' }}
                            placeholder="تفاصيل إضافية..."
                            value={additional_detailsAr}
                            onChange={e => {
                                const value = e.target.value;
                                // Allows Arabic letters, numbers (0-9 and ٠-٩), spaces, newlines, 
                                // and standard Arabic punctuation (، ؛ ؟ -)
                                if (value === '' || /^[\u0600-\u06FF\u0750-\u077F0-9٠-٩\s.,:;،؛؟\n-]*$/.test(value)) {
                                    setAddDetailsAr(value);
                                }
                            }}
                        />
                    </div>
                    <div>
                        <label className="modal-label">{isRTL ? 'تفاصيل إضافية (إنجليزي)' : 'Additional Details (English)'}</label>
                        <textarea
                            className="modal-textarea"
                            style={{ direction: 'ltr' }}
                            placeholder="Additional details..."
                            value={additional_detailsEn}
                            onChange={e => {
                                const value = e.target.value;
                                // Allows A-Z, a-z, 0-9, common punctuation, symbols, and newlines
                                if (value === '' || /^[A-Za-z0-9\s.,!?'"()\-_\n:;]*$/.test(value)) {
                                    setAddDetailsEn(value);
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}