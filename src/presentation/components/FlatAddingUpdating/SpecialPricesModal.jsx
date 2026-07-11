import React from 'react';
import { useTranslation } from '../../context/LanguageContext.jsx';
import { useSpecialPrices } from '../../hooks/useSpecialPrices.js';
import { IconX, IconTrash, IconEdit, IconPlus } from '@tabler/icons-react';
import { convertApiDateToDisplay } from '../../../core/utils/helper/date_utils.js';
import RialSymbol from '../OmaniRial.jsx';

export default function SpecialPricesModal({ isOpen, onClose, flatId, flatName }) {
    const { t } = useTranslation();

    if (!isOpen || !flatId) return null;

    // Use custom hook for all logic
    const {
        pricesList,
        isLoading,
        isSaving,
        statusMessage,
        formData,
        formErrors,
        editingId,
        handleFormChange,
        savePrice,
        deletePrice,
        startEdit,
        resetForm,
        setStatusMessage,
    } = useSpecialPrices(flatId);

    // ──── STYLES ────
    const lblStyle = { fontSize: '12px', fontWeight: 500, color: '#4b5563', display: 'block', marginBottom: '4px' };
    const inpStyle = (fieldName) => ({
        width: '100%',
        padding: '10px 12px',
        border: `1px solid ${formErrors[fieldName] ? '#ef4444' : '#d1d5db'}`,
        borderRadius: '8px',
        fontSize: '13px',
        background: '#ffffff',
        color: '#111827',
        boxSizing: 'border-box',
    });
    const errStyle = { fontSize: '11px', color: '#ef4444', marginTop: '3px' };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '12px', boxSizing: 'border-box' }}>
            <div style={{ background: 'white', borderRadius: '16px', maxWidth: '800px', width: '100%', maxHeight: 'calc(100vh - 24px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>

                {/* ──── HEADER ──── */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                        {t('special_prices') || 'Special Prices'} - {flatName || `Flat #${flatId}`}
                    </h2>
                    <button
                        type="button"
                        onClick={() => {
                            resetForm();
                            setStatusMessage({ text: '', isError: false });
                            onClose();
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: '4px' }}
                    >
                        <IconX size={20} />
                    </button>
                </div>

                {/* ──── CONTENT ──── */}
                <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1, boxSizing: 'border-box' }}>

                    {/* Status Message */}
                    {statusMessage.text && (
                        <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: statusMessage.isError ? '#fef2f2' : '#f0fdf4', color: statusMessage.isError ? '#dc2626' : '#16a34a', border: `1px solid ${statusMessage.isError ? '#fecaca' : '#bbf7d0'}` }}>
                            {statusMessage.text}
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                            {t('loading') || 'Loading...'}
                        </div>
                    )}

                    {/* Prices List */}
                    {!isLoading && pricesList.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px', marginTop: 0 }}>
                                {t('existing_prices') || 'Existing Price Ranges'} ({pricesList.length})
                            </h3>
                            <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                        <thead>
                                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>
                                                {t('start_date') || 'Start Date'}
                                            </th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>
                                                {t('end_date') || 'End Date'}
                                            </th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>
                                                {t('price') || 'Price'}
                                            </th>
                                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#4b5563' }}>
                                                {t('actions') || 'Actions'}
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {pricesList.map((price) => (
                                            <tr key={price.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                <td style={{ padding: '12px', color: '#374151' }}>
                                                    {/* ✅ FIX: Use proper date conversion */}
                                                    {convertApiDateToDisplay(price.startDate)}
                                                </td>
                                                <td style={{ padding: '12px', color: '#374151' }}>
                                                    {/* ✅ FIX: Use proper date conversion */}
                                                    {convertApiDateToDisplay(price.endDate)}
                                                </td>
                                                <td style={{ padding: '12px', color: '#185FA5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {parseFloat(price.price).toFixed(2)}
                                                    <RialSymbol style={{ width: '0.85em', height: '0.85em' }} />
                                                </td>
                                              
                                                <td>
                                                    <button
                                                        type="button"
                                                        onClick={() => deletePrice(price.id)}
                                                        disabled={isSaving}
                                                        style={{ background: '#fef2f2', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <IconTrash size={14} />
                                                        {t('delete') || 'Delete'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && pricesList.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                            <div style={{ fontSize: '14px', fontWeight: 500 }}>
                                {t('no_special_prices') || 'No special prices set yet'}
                            </div>
                            <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                {t('add_your_first_price') || 'Add one below to get started'}
                            </div>
                        </div>
                    )}

                    {/* Add/Edit Form */}
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px', marginTop: 0 }}>
                            {editingId ? (t('edit_price') || 'Edit Price Range') : (t('add_new_price') || 'Add New Price Range')}
                        </h3>

                        <form onSubmit={savePrice} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                            {/* Start Date */}
                            <div>
                                <label style={lblStyle}>{t('start_date') || 'Start Date'}</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleFormChange}
                                    disabled={isSaving}
                                    style={inpStyle('startDate')}
                                />
                                {formErrors.startDate && <div style={errStyle}>{formErrors.startDate}</div>}
                            </div>

                            {/* End Date */}
                            <div>
                                <label style={lblStyle}>{t('end_date') || 'End Date'}</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleFormChange}
                                    disabled={isSaving}
                                    style={inpStyle('endDate')}
                                />
                                {formErrors.endDate && <div style={errStyle}>{formErrors.endDate}</div>}
                            </div>

                            {/* Price */}
                            <div>
                                <label style={lblStyle}>{t('price') || 'Price'}</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        name="price"
                                        step="0.001"
                                        value={formData.price}
                                        placeholder="0.00"
                                        onChange={handleFormChange}
                                        disabled={isSaving}
                                        style={{ ...inpStyle('price'), paddingInlineEnd: '32px' }}
                                    />
                                    <RialSymbol
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            insetInlineEnd: '10px',
                                            transform: 'translateY(-50%)',
                                            width: '16px',
                                            height: '16px',
                                            color: '#9ca3af',
                                            pointerEvents: 'none',
                                        }}
                                    />
                                </div>
                                {formErrors.price && <div style={errStyle}>{formErrors.price}</div>}
                            </div>

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    style={{ flex: 1, padding: '10px 16px', background: isSaving ? '#93c0e4' : '#185FA5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                >
                                    <IconPlus size={16} />
                                    {isSaving ? (t('saving') || 'Saving...') : (editingId ? (t('update') || 'Update') : (t('add') || 'Add'))}
                                </button>
                                {/*{editingId && (*/}
                                {/*    <button*/}
                                {/*        type="button"*/}
                                {/*        onClick={resetForm}*/}
                                {/*        disabled={isSaving}*/}
                                {/*        style={{ padding: '10px 16px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}*/}
                                {/*    >*/}
                                {/*        {t('cancel') || 'Cancel'}*/}
                                {/*    </button>*/}
                                {/*)}*/}
                            </div>
                        </form>
                    </div>

                </div>

                {/* ──── FOOTER ──── */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                    <button
                        type="button"
                        onClick={() => {
                            resetForm();
                            setStatusMessage({ text: '', isError: false });
                            onClose();
                        }}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: '13px', cursor: 'pointer' }}
                    >
                        {t('close') || 'Close'}
                    </button>
                </div>

            </div>
        </div>
    );
}