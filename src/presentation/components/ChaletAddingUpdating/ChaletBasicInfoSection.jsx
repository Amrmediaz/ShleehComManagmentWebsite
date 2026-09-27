import React from 'react';
import '../../styles/AddBuildingModal.css';

const CHALET_TYPES = [
    { key: 'Chalet', labelKey: 'chalet_type_chalet' },
    { key: 'Resort', labelKey: 'chalet_type_resort' },
    { key: 'Hut', labelKey: 'chalet_type_hut' },
];

/** ChaletBasicInfoSection — name, type, room breakdown, and free-text description/policies. */
export default function ChaletBasicInfoSection({
    name, setName,
    chaletType, setChaletType,
    capacity, setCapacity,
    bedrooms, setBedrooms,
    bathrooms, setBathrooms,
    livingRooms, setLivingRooms,
    buildingDescription, setBuildingDescription,
    note, setNote,
    t, isRTL,
}) {
    return (
        <section>
            <div className="modal-section-title">{t('basic_info')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                    <label className="modal-label">
                        {t('chalet_name') || 'Chalet Name'} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                        className="modal-input"
                        type="text"
                        placeholder={isRTL ? 'استراحة الواحة' : 'The Oasis Chalet'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div>
                    <label className="modal-label">{t('chalet_type') || 'Chalet Type'} <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {CHALET_TYPES.map(({ key, labelKey }) => (
                            <button
                                type="button"
                                key={key}
                                onClick={() => setChaletType(key)}
                                style={{
                                    padding: '9px 16px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                    border: chaletType === key ? '1.5px solid #185FA5' : '1.5px solid #d1d5db',
                                    background: chaletType === key ? '#185FA5' : '#fff',
                                    color: chaletType === key ? '#fff' : '#374151',
                                }}
                            >
                                {t(labelKey) || key}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="modal-grid-4">
                    <div>
                        <label className="modal-label">{t('capacity') || 'Capacity'} <span style={{ color: '#ef4444' }}>*</span></label>
                        <input className="modal-input" type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                    </div>
                    <div>
                        <label className="modal-label">{t('beds') || 'Bedrooms'}</label>
                        <input className="modal-input" type="number" min="0" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
                    </div>
                    <div>
                        <label className="modal-label">{t('bath') || 'Bathrooms'}</label>
                        <input className="modal-input" type="number" min="0" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
                    </div>
                    <div>
                        <label className="modal-label">{t('living_rooms') || 'Living Rooms'}</label>
                        <input className="modal-input" type="number" min="0" value={livingRooms} onChange={(e) => setLivingRooms(e.target.value)} />
                    </div>
                </div>

                <div>
                    <label className="modal-label">{t('description') || 'Description'}</label>
                    <textarea
                        className="modal-textarea"
                        placeholder={isRTL ? 'وصف الاستراحة...' : 'Describe the chalet, its features, nearby landmarks…'}
                        value={buildingDescription}
                        onChange={(e) => setBuildingDescription(e.target.value)}
                    />
                </div>

                <div>
                    <label className="modal-label">{t('policies') || 'Policies'}</label>
                    <textarea
                        className="modal-textarea"
                        placeholder={isRTL ? 'شروط وسياسات الحجز...' : 'Booking rules and policies…'}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>
            </div>
        </section>
    );
}
