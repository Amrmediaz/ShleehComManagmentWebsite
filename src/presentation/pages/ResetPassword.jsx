import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext.jsx';
import { validatePhone } from '../../core/utils/validators.js';
import {AuthRepository} from '../../data/repositories/AuthRepository.js';
import {ResetPasswordUseCase} from "../../core/useCases/ResetPasswordUseCase.js";

export default function ResetPassword() {
    const { t, lang } = useTranslation();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        countryCode: '968',
        phone: '',
        otp: '',
        generatedOtp: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ key: '', isError: false });

    const handleNumberChange = (value, field) => {
        const cleanNumbersOnly = value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, [field]: cleanNumbersOnly }));
    };

    const fullPhoneNumber = `${formData.countryCode}${formData.phone}`;

    const handleNext = async (e) => {
        e.preventDefault();
        setStatus({ key: '', isError: false });
        setIsLoading(true);

        try {
            if (step === 1) {
                const phoneError = validatePhone(formData.phone, t);
                if (phoneError) { setStatus({ key: phoneError, isError: true }); setIsLoading(false); return; }

                const res = await AuthRepository.checkUserExists(fullPhoneNumber);
                if (res && res.status === true) {
                    const code = Math.floor(1000 + Math.random() * 9000).toString();
                    await AuthRepository.sendOtp(fullPhoneNumber, '1234');
                    setFormData(prev => ({ ...prev, generatedOtp: '1234'}));
                    setStep(2);
                } else {
                    setStatus({ key: 'user_not_found', isError: true });
                }
            } else if (step === 2) {
                if (formData.otp === formData.generatedOtp) setStep(3);
                else setStatus({ key: 'invalid_otp', isError: true });
            } else if (step === 3) {
                // Triggering backend to send password to the phone
                await ResetPasswordUseCase.execute(fullPhoneNumber);
                setStatus({ key: 'password_reset_success', isError: false });
                setTimeout(() => { window.location.href = '/management/login'; }, 1500);
            }
        } catch (err) {
            setStatus({ key: 'server_error', isError: true });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page-container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <form onSubmit={handleNext} className="auth-card-form" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <h2 className="auth-form-header">{t(`reset_step_${step}_title`)}</h2>

                {status.key && (
                    <div className={`status-banner ${status.isError ? 'error' : 'success'}`}>
                        {t(status.key)}
                    </div>
                )}

                {step === 1 && (
                    <div style={{ display: 'flex', gap: '10px', direction: 'ltr', marginBottom: '16px' }}>
                        <input type="text" inputMode="numeric" className="auth-input-field" style={{ width: '80px', textAlign: 'center', marginBottom: 0 }}
                               value={formData.countryCode} onChange={(e) => handleNumberChange(e.target.value, 'countryCode')} maxLength={4} placeholder={t('code')} />
                        <input type="tel" inputMode="numeric" className="auth-input-field" style={{ flex: 1, marginBottom: 0 }} placeholder={t('phone_number')}
                               value={formData.phone} onChange={(e) => handleNumberChange(e.target.value, 'phone')} maxLength={15} required />
                    </div>
                )}

                {step === 2 && (
                    <input type="text" inputMode="numeric" className="auth-input-field" placeholder={t('otp_code')}
                           value={formData.otp} onChange={(e) => handleNumberChange(e.target.value, 'otp')} maxLength={6} required />
                )}

                {step === 3 && (
                    <div className="auth-info-box" style={{ textAlign: 'center', padding: '20px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '20px' }}>
                        <p style={{ fontSize: '14px', color: '#666' }}>{t('confirm_send_password_to')}</p>
                        <strong style={{ fontSize: '18px', display: 'block', margin: '10px 0' }}>{fullPhoneNumber}</strong>
                    </div>
                )}

                <button type="submit" disabled={isLoading} className="auth-submit-btn" style={{ width: '100%' }}>
                    {isLoading ? t('loading') : (step === 3 ? t('confirm') : t('next'))}
                </button>
            </form>
        </div>
    );
}