import React from 'react';
import { IconChevronDown, IconX } from '@tabler/icons-react';
import { UNIT_TYPES } from '../../../core/utils/Constants/building_constants.js';
import { formatUnitName } from '../../../core/utils/helper/formHelpers';
import '../../styles/AddBuildingModal.css';

/**
 * UnitTypesSection Component
 * Displays unit type selection with dropdown and selected tags
 */
export default function UnitTypesSection({
                                             selectedUnits, setSelectedUnits,
                                             unitDropdownOpen, setUnitDropdownOpen,
                                             t, isRTL
                                         }) {
    const addUnitType = (unit) => {
        if (!selectedUnits.find(u => u.id === unit.id)) {
            setSelectedUnits(prev => [...prev, { ...unit }]);
        }
        setUnitDropdownOpen(false);
    };

    const removeUnitType = (id) => {
        setSelectedUnits(prev => prev.filter(u => u.id !== id));
    };

    const availableUnits = UNIT_TYPES.filter(u => !selectedUnits.find(s => s.id === u.id));

    return (
        <section>
            <div className="modal-section-title">
                {t('available_room_types')}
                <span style={{ color: '#ef4444' }}>*</span>
            </div>

            <div className="unit-dropdown">
                <button
                    type="button"
                    onClick={() => {
                        if (availableUnits.length > 0) setUnitDropdownOpen(p => !p);
                    }}
                    disabled={availableUnits.length === 0}
                    className="unit-dropdown__trigger"
                    style={{
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                        backgroundColor: availableUnits.length === 0 ? '#f9fafb' : '#fff',
                    }}
                >
          <span style={{
              textAlign: isRTL ? 'right' : 'left',
              flexGrow: 1,
              color: availableUnits.length === 0 ? '#9ca3af' : '#374151',
          }}>
            {availableUnits.length === 0 ? t('all_room_types') : t('add_room_type')}
          </span>
                    <IconChevronDown
                        size={16}
                        style={{
                            transform: unitDropdownOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.15s',
                            flexShrink: 0,
                        }}
                    />
                </button>

                {unitDropdownOpen && (
                    <div className="unit-dropdown__menu">
                        {availableUnits.map(unit => (
                            <button
                                key={unit.id}
                                type="button"
                                onClick={() => addUnitType(unit)}
                                className="unit-dropdown__item"
                                style={{ textAlign: isRTL ? 'right' : 'left' }}
                            >
                                {formatUnitName(unit, isRTL)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {selectedUnits.length > 0 && (
                <div className="modal-unit-tags">
                    {selectedUnits.map(unit => (
                        <div key={unit.id} className="modal-unit-tag">
              <span className="modal-unit-tag__text">
                {formatUnitName(unit, isRTL)}
              </span>
                            <button
                                type="button"
                                onClick={() => removeUnitType(unit.id)}
                                className="modal-unit-tag__close"
                            >
                                <IconX size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}