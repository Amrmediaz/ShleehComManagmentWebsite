import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext.jsx';
import { LoginUserUseCase } from '../../core/useCases/LoginUserUseCase.js';
import { validateLoginFields } from '../../core/utils/validators.js';
import logoImage from '/src/assets/logo.jpg';

export default function LoginPage() {
    const { t, lang, toggleLanguage } = useTranslation();
    const navigate = useNavigate();

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

    const handleLogin = async (e) => {
        e.preventDefault();
        setStatusMessage({ tokenKey: '', isError: false, fallback: '' });

        // 1. Run core field validation checks
        const validationKey = validateLoginFields({ phoneNumber, password });
        if (validationKey) {
            setStatusMessage({ tokenKey: validationKey, isError: true });
            return;
        }

        setIsLoading(true);

        try {
            // 2. Dispatch payload to your Use Case
            const result = await LoginUserUseCase.execute({
                countryCode,
                phoneNumber,
                password
            });

            // 🌟 3. Handle Successful Authentication
            if (result && (result.status === true || result.token)) {

                // Extract the genuine token from your backend API response payload
                const token = result.token || result.data?.token;

                // Store the authentic server session token securely in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('isLoggedIn', 'true');

                setStatusMessage({
                    tokenKey: 'login_success', // Displays "تم تسجيل الدخول بنجاح" / "Login successful"
                    isError: false
                });

                // Clean, short delay so the user can read the success notification message
                setTimeout(() => {
                    navigate('/management/'); // ✅ FIXED - Navigate to dashboard
                }, 1200);

            } else {
                // Handle logical rejection errors (e.g., incorrect combination text patterns)
                setStatusMessage({
                    tokenKey: 'login_failed',
                    isError: true,
                    fallback: result.message || 'Faild'
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

            {/* Vertical Content Wrapper Container */}
            <div className="content-wrapper">
                {/* Branding Headers */}
                <div className="branding-section">
                    <img src={logoImage} alt="Logo" className="branding-logo" />
                    <h1 className="branding-title">مدير شاليه كوم</h1>
                    <p className="branding-subtitle">Shleeh Com Manager</p>
                </div>

                {/* Login Form Sheet Frame Card */}
                <form onSubmit={handleLogin} className="auth-card-form">
                    <h2 className="auth-form-header">{t('login_title')}</h2>

                    {/* Feedback Status Banner Alert Prompt */}
                    {statusMessage.tokenKey && (
                        <div className={`status-banner ${statusMessage.isError ? 'error' : 'success'}`}>
                            {statusMessage.fallback || t(statusMessage.tokenKey)}
                        </div>
                    )}

                    {/* Unified Phone Input Field Row Group Structure (Locked LTR for numerical tracking sequence entry) */}
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
                            placeholder={t('phone_number') || t('username')}
                            value={phoneNumber}
                            onChange={(e) => handleNumberChange(e.target.value, setPhoneNumber)}
                            maxLength={15}
                            required
                        />
                    </div>

                    {/* Password Secure Text Input Field */}
                    <input
                        type="password"
                        className="auth-input-field"
                        placeholder={t('password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {/* Password Auxiliary Navigation Actions Trigger */}
                    <div className="auth-options-wrapper">
                        <a href="/management/reset-password" className="auth-redirect-link">{t('forgot_password')}</a>
                    </div>

                    {/* Form Submissions Execution Action Trigger Button */}
                    <button type="submit" disabled={isLoading} className="auth-submit-btn" style={{ opacity: isLoading ? 0.7 : 1 }}>
                        {isLoading ? t('loading') : t('login_button')}
                    </button>

                    {/* Prompt Registration Switch Redirect Footer */}
                    <p className="auth-footer-prompt">
                        {t('no_account')} <a href="/management/register" className="auth-redirect-link">{t('register')}</a>
                    </p>
                </form>
            </div>
        </div>
    );
}