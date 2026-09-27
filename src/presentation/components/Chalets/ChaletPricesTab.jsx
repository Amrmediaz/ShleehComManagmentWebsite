import React from 'react';
import { useChaletPrices } from '../../hooks/useChaletPrices.js';
import RialSymbol from '../OmaniRial.jsx';
import '../../styles/Buildingdetails.css';

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * ChaletPricesTab
 * Add/edit/delete special price rules for a chalet — supports both a
 * recurring weekday rate (type 1) and a date-range rate (type 2), matching
 * the mobile app's SetPriceScreen.
 */
const ChaletPricesTab = ({ chaletId, t }) => {
    const {
        pricesList, isLoading, isSaving, statusMessage,
        formData, formErrors, editingId,
        handleFormChange, savePrice, deletePrice, startEdit, resetForm,
    } = useChaletPrices(chaletId);

    const lblStyle = { fontSize: '12px', fontWeight: 500, color: '#4b5563', display: 'block', marginBottom: '4px' };
    const inpStyle = (field) => ({
        width: '100%', padding: '10px 12px',
        border: `1px solid ${formErrors[field] ? '#ef4444' : '#d1d5db'}`,
        borderRadius: '8px', fontSize: '13px', background: '#fff', color: '#111827', boxSizing: 'border-box',
    });
    const errStyle = { fontSize: '11px', color: '#ef4444', marginTop: '3px' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {statusMessage.text && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: statusMessage.isError ? '#fef2f2' : '#f0fdf4', color: statusMessage.isError ? '#dc2626' : '#16a34a', border: `1px solid ${statusMessage.isError ? '#fecaca' : '#bbf7d0'}` }}>
                    {statusMessage.text}
                </div>
            )}

            {/* Existing prices */}
            {isLoading ? (
                <div className="empty-state"><p className="empty-state__text">{t('loading') || 'Loading…'}</p></div>
            ) : pricesList.length === 0 ? (
                <div className="empty-state">
                    <i className="ti ti-calendar-dollar empty-state__icon" />
                    <p className="empty-state__text">{t('no_special_prices') || 'No special prices set yet'}</p>
                </div>
            ) : (
                <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>{t('rule') || 'Rule'}</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>{t('price') || 'Price'}</th>
                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#4b5563' }}>{t('actions') || 'Actions'}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pricesList.map((price) => (
                                <tr key={price.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '12px', color: '#374151' }}>
                                        {price.type === 1
                                            ? (t(price.day) || price.day)
                                            : `${price.startDate || ''} — ${price.endDate || ''}`}
                                    </td>
                                    <td style={{ padding: '12px', color: '#185FA5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {parseFloat(price.price).toFixed(2)}
                                        <RialSymbol style={{ width: '0.85em', height: '0.85em' }} />
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                        <button type="button" onClick={() => startEdit(price)} disabled={isSaving}
                                                style={{ background: '#eff6ff', border: '1px solid #93c5fd', color: '#1d4ed8', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}>
                                            <i className="ti ti-edit" /> {t('edit') || 'Edit'}
                                        </button>
                                        <button type="button" onClick={() => deletePrice(price.id)} disabled={isSaving}
                                                style={{ background: '#fef2f2', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}>
                                            <i className="ti ti-trash" /> {t('delete') || 'Delete'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add / edit form */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px', marginTop: 0 }}>
                    {editingId ? (t('edit_price') || 'Edit Price Rule') : (t('add_new_price') || 'Add New Price Rule')}
                </h3>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                    <button type="button" onClick={() => handleFormChange({ target: { name: 'type', value: 1 } })}
                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: formData.type === 1 ? '1.5px solid #185FA5' : '1px solid #d1d5db', background: formData.type === 1 ? '#185FA5' : '#fff', color: formData.type === 1 ? '#fff' : '#374151', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                        <i className="ti ti-calendar-repeat" /> {t('recurring_weekday') || 'Recurring Weekday'}
                    </button>
                    <button type="button" onClick={() => handleFormChange({ target: { name: 'type', value: 2 } })}
                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: formData.type === 2 ? '1.5px solid #185FA5' : '1px solid #d1d5db', background: formData.type === 2 ? '#185FA5' : '#fff', color: formData.type === 2 ? '#fff' : '#374151', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                        <i className="ti ti-calendar-event" /> {t('date_range') || 'Date Range'}
                    </button>
                </div>

                <form onSubmit={savePrice} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    {formData.type === 1 ? (
                        <div>
                            <label style={lblStyle}>{t('day') || 'Day'}</label>
                            <select name="day" value={formData.day} onChange={handleFormChange} disabled={isSaving} style={inpStyle('day')}>
                                <option value="">{t('select_day') || 'Select a day…'}</option>
                                {DAY_KEYS.map(d => <option key={d} value={d}>{t(d) || d}</option>)}
                            </select>
                            {formErrors.day && <div style={errStyle}>{formErrors.day}</div>}
                        </div>
                    ) : (
                        <>
                            <div>
                                <label style={lblStyle}>{t('start_date') || 'Start Date'}</label>
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleFormChange} disabled={isSaving} style={inpStyle('startDate')} />
                            </div>
                            <div>
                                <label style={lblStyle}>{t('end_date') || 'End Date'}</label>
                                <input type="date" name="endDate" value={formData.endDate} onChange={handleFormChange} disabled={isSaving} style={inpStyle('endDate')} />
                            </div>
                        </>
                    )}

                    <div>
                        <label style={lblStyle}>{t('price') || 'Price'}</label>
                        <input type="number" name="price" step="0.001" value={formData.price} placeholder="0.00" onChange={handleFormChange} disabled={isSaving} style={inpStyle('price')} />
                        {formErrors.price && <div style={errStyle}>{formErrors.price}</div>}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                        <button type="submit" disabled={isSaving}
                                style={{ flex: 1, padding: '10px 16px', background: isSaving ? '#93c0e4' : '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                            {isSaving ? (t('saving') || 'Saving…') : (editingId ? (t('update') || 'Update') : (t('add') || 'Add'))}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} disabled={isSaving}
                                    style={{ padding: '10px 16px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                                {t('cancel') || 'Cancel'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChaletPricesTab;
