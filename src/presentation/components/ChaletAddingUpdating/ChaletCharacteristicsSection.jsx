import React from 'react';
import '../../styles/AddBuildingModal.css';

const SUITABLE_FOR = ['small_family', 'large_family', 'couples', 'friends_group', 'corporate'];
const LANDSCAPE = ['coastal', 'mountain', 'valley', 'desert'];
const OUTDOOR_SPACE = ['large_garden', 'medium_garden', 'small_yard', 'balcony_only'];
const SAFETY = ['very_safe_children', 'generally_safe', 'adults_only'];
const ATMOSPHERE = ['very_calm', 'calm_comfortable', 'lively'];
const BEST_SEASON = ['summer', 'winter', 'spring_autumn', 'year_round'];

function MultiChipGroup({ label, required, options, selected, onToggle, t }) {
    return (
        <div>
            <label className="modal-label">{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {options.map((key) => {
                    const active = selected.includes(key);
                    return (
                        <button
                            type="button"
                            key={key}
                            onClick={() => onToggle(key)}
                            style={{
                                padding: '7px 14px', borderRadius: '999px', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer',
                                border: active ? '1.5px solid #185FA5' : '1px solid #d1d5db',
                                background: active ? '#e6f1fb' : '#fff',
                                color: active ? '#185FA5' : '#374151',
                            }}
                        >
                            {t(`chalet_${key}`) || key}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function SingleSelectGroup({ label, required, options, value, onChange, t }) {
    return (
        <div>
            <label className="modal-label">{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {options.map((key) => {
                    const active = value === key;
                    return (
                        <button
                            type="button"
                            key={key}
                            onClick={() => onChange(key)}
                            style={{
                                padding: '7px 14px', borderRadius: '999px', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer',
                                border: active ? '1.5px solid #185FA5' : '1px solid #d1d5db',
                                background: active ? '#185FA5' : '#fff',
                                color: active ? '#fff' : '#374151',
                            }}
                        >
                            {t(`chalet_${key}`) || key}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/** ChaletCharacteristicsSection — suitability, landscape, outdoor space, safety, atmosphere, best season. */
export default function ChaletCharacteristicsSection({
    suitableFor, toggleSuitableFor,
    landscape, toggleLandscape,
    outdoorSpace, toggleOutdoorSpace,
    safety, setSafety,
    atmosphere, setAtmosphere,
    bestSeason, setBestSeason,
    t,
}) {
    return (
        <section>
            <div className="modal-section-title">{t('characteristics') || 'Characteristics'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <MultiChipGroup label={t('suitable_for') || 'Suitable For'} options={SUITABLE_FOR} selected={suitableFor} onToggle={toggleSuitableFor} t={t} />
                <MultiChipGroup label={t('landscape') || 'Landscape'} options={LANDSCAPE} selected={landscape} onToggle={toggleLandscape} t={t} />
                <MultiChipGroup label={t('outdoor_space') || 'Outdoor Space'} options={OUTDOOR_SPACE} selected={outdoorSpace} onToggle={toggleOutdoorSpace} t={t} />
                <SingleSelectGroup label={t('safety') || 'Safety'} options={SAFETY} value={safety} onChange={setSafety} t={t} />
                <SingleSelectGroup label={t('atmosphere') || 'Atmosphere'} options={ATMOSPHERE} value={atmosphere} onChange={setAtmosphere} t={t} />
                <SingleSelectGroup label={t('best_season') || 'Best Season'} options={BEST_SEASON} value={bestSeason} onChange={setBestSeason} t={t} />
            </div>
        </section>
    );
}
