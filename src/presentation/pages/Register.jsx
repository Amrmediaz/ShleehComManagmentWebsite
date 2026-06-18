import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext.jsx';
import { RegisterUserUseCase } from '../../core/useCases/RegisterUserUseCase.js';
import { validateRegisterFields } from '../../core/utils/validators.js';
import logoImage from '/src/assets/logo.webp';
import PasswordRules from '../components/PasswordRules';

export default function RegisterPage() {
    const { t, lang, toggleLanguage } = useTranslation();

    // Presentation UI state values
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [countryCode, setCountryCode] = useState('968');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ tokenKey: '', isError: false, fallback: '' });

    // Enforces strict numerical entry by stripping out non-digits immediately
    const handleNumberChange = (value, setter) => {
        const cleanNumbersOnly = value.replace(/\D/g, '');
        setter(cleanNumbersOnly);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setStatusMessage({ tokenKey: '', isError: false, fallback: '' });

        // 1. Run Core Validation Checks (using validation keys for translation logic)
        const validationKey = validateRegisterFields({
            firstName,
            lastName,
            phoneNumber,
            password
        });

        if (validationKey) {
            setStatusMessage({ tokenKey: validationKey, isError: true });
            return;
        }

        setIsLoading(true);

        try {
            // 2. Dispatch separated country code and phone data payload to Domain Use Case
            const result = await RegisterUserUseCase.execute({
                firstName,
                lastName,
                countryCode,
                phoneNumber,
                password
            });

            if (result.status === true) {
                setStatusMessage({
                    tokenKey: 'register_success',
                    isError: false
                });

                // Triggers router updates after success feedback banner displays
                setTimeout(() => { window.location.pathname = '/home'; }, 1500);
            } else {
                setStatusMessage({
                    tokenKey: 'register_failed',
                    isError: true,
                    fallback: result.message
                });
            }
        } catch (error) {
            setStatusMessage({
                tokenKey: 'server_error',
                isError: true
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page-container" direction={lang === 'ar' ? 'rtl' : 'ltr'}>
            {/* Language Switcher Button */}
            <button type="button" onClick={toggleLanguage} className="lang-toggle-btn">
                {lang === 'en' ? 'العربية' : 'English'}
            </button>

            {/* Vertical Content Container */}
            <div className="content-wrapper">
                {/* Branding Headers */}
                <div className="branding-section">
                    <img src={logoImage} alt="Logo" className="branding-logo" />
                    <h1 className="branding-title">مدير شاليه كوم</h1>
                    <p className="branding-subtitle">Shleeh Com Manager</p>
                </div>

                {/* Registration Form Sheet Frame Card */}
                <form onSubmit={handleRegister} className="auth-card-form">
                    <h2 className="auth-form-header">{t('register_title')}</h2>

                    {/* Feedback Status Banner Alert Prompt */}
                    {statusMessage.tokenKey && (
                        <div className={`status-banner ${statusMessage.isError ? 'error' : 'success'}`}>
                            {statusMessage.fallback || t(statusMessage.tokenKey)}
                        </div>
                    )}

                    {/* First & Last Name Fields */}
                    <input
                        type="text"
                        className="auth-input-field"
                        placeholder={t('first_name')}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />

                    <input
                        type="text"
                        className="auth-input-field"
                        placeholder={t('last_name')}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />

                    {/* Separated Phone & Country Code Input Row Structure (Locked LTR for numerical entry) */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', direction: 'ltr' }}>
                        <input
                            type="text"
                            inputMode="numeric"
                            className="auth-input-field"
                            style={{ width: '75px', textAlign: 'center', marginBottom: 0 }}
                            value={countryCode}
                            onChange={(e) => handleNumberChange(e.target.value, setCountryCode)}
                            placeholder={t('code')}
                            maxLength={4}
                            required
                        />
                        <input
                            type="text"
                            inputMode="tel"
                            className="auth-input-field"
                            style={{ marginBottom: 0, flex: 1 }}
                            placeholder={t('phone_number')}
                            value={phoneNumber}
                            onChange={(e) => handleNumberChange(e.target.value, setPhoneNumber)}
                            maxLength={15}
                            required
                        />
                    </div>

                    {/* Password Secure Input Field */}
                    <input
                        type="password"
                        className="auth-input-field"
                        placeholder={t('password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {/* Localized Password Instructions Box */}
                    <PasswordRules></PasswordRules>
                    {/* Form Submission Button */}
                    <button type="submit" disabled={isLoading} className="auth-submit-btn" style={{ opacity: isLoading ? 0.7 : 1 }}>
                        {isLoading ? t('loading') : t('register_button')}
                    </button>
                </form>
            </div>
        </div>
    );
}