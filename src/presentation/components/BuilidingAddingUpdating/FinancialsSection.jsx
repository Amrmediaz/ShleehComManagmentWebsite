import React from 'react';
import {IconCreditCard, IconStar, IconCheck, IconPigMoney, IconCash} from '@tabler/icons-react';
import RialSymbol from '../OmaniRial.jsx';
import '../../styles/AddBuildingModal.css';

/**
 * CustomCheckbox Component
 */
const CustomCheckbox = ({ checked, onChange }) => (
    <div
        onClick={() => onChange(!checked)}
        style={{
            width: '20px',
            height: '20px',
            borderRadius: '6px',
            border: checked ? 'none' : '2px solid #D1D5DB',
            backgroundColor: checked ? '#185FA5' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0
        }}
    >
        {checked && <IconCheck size={14} color="white" stroke={3} />}
    </div>
);

export default function FinancialsSection({
                                              minimumRent, setMinimumRent,
                                              maxRent, setMaxRent,
                                              minDays, setMinDays,
                                              acceptDownPay, setAcceptDownPay,
                                              isExclusive, setIsExclusive,
                                              t, isRTL
                                          }) {
    return (
        <section>
            <div className="modal-section-title">{t('financials')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Rent & Days */}
                <div className="modal-grid-3">
                    <div>
                        <label className="modal-label">{t('min_rent')}
                            <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="modal-input"
                                type="number"
                                placeholder="150"
                                min="0"
                                value={minimumRent}
                                onChange={e => setMinimumRent(e.target.value)}
                                style={{ paddingInlineEnd: '32px' }}
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
                    </div>
                    <div>
                        <label className="modal-label">{t('max_rent')}
                            <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="modal-input"
                                type="number"
                                placeholder="800"
                                min="0"
                                value={maxRent}
                                onChange={e => setMaxRent(e.target.value)}
                                style={{ paddingInlineEnd: '32px' }}
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
                    </div>
                    <div>
                        <label className="modal-label">{isRTL ? 'الأيام الأدنى' : 'Min Days'}
                            {/*<span style={{ color: '#ef4444' }}>*</span>*/}
                        </label>
                        <input
                            className="modal-input"
                            type="number"
                            placeholder="1"
                            min="1"
                            value={minDays}
                            onChange={e => setMinDays(e.target.value)}
                        />
                    </div>
                </div>

                {/* Payment Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                    {/* Row Style Generator Function */}
                    {/* Use this structure for all three items to guarantee alignment */}

                    {/* 1. Online Payment */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: '1px solid #185FA5',
                        background: '#F4F9FD',
                        flexDirection: isRTL ? 'row-reverse' : 'row'
                    }}>
                        <IconCreditCard size={20} color="#185FA5" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0C447C', flexGrow: 1, textAlign: isRTL ? 'right' : 'left' }}>
            {isRTL ? 'الدفع الإلكتروني عبر الإنترنت' : 'Online Digital Payment'}
        </span>
                        <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IconCheck size={14} color="white" stroke={3} />
                        </div>
                    </div>

                    {/* 2. Exclusive Property */}
                    <div
                        onClick={() => setIsExclusive(!isExclusive)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 14px', flexDirection: isRTL ? 'row-reverse' : 'row', cursor: 'pointer', height: '40px' }}
                    >
                        <IconStar size={20} color="#6b7280" />
                        <span style={{ fontSize: '13px', color: '#374151', flexGrow: 1, textAlign: isRTL ? 'right' : 'left' }}>
            {isRTL ? 'عقار حصري' : 'Exclusive Property'}
        </span>
                        <CustomCheckbox checked={isExclusive} onChange={setIsExclusive} />
                    </div>

                    {/* 3. Partial Payment */}
                    <div
                        onClick={() => setAcceptDownPay(!acceptDownPay)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 14px', flexDirection: isRTL ? 'row-reverse' : 'row', cursor: 'pointer', height: '40px' }}
                    >
                        {/*<div style={{ width: '20px' }} />*/}
                        <IconCash size={20} color="#6b7280" />

                        <span style={{ fontSize: '13px', color: '#374151', flexGrow: 1, textAlign: isRTL ? 'right' : 'left' }}>
            {t('partial_payment_option')}
        </span>
                        <CustomCheckbox checked={acceptDownPay} onChange={setAcceptDownPay} />
                    </div>

                </div>            </div>
        </section>
    );
}