import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext.jsx';
import { GetProfileUseCase } from '../../../core/usecases/GetProfileUseCase';
import { UpdateProfileUseCase } from '../../../core/usecases/UpdateProfileUseCase';
import { ChangePasswordUseCase } from '../../../core/usecases/ChangePasswordUseCase';
import PasswordRules from '../../components/Profile/PasswordRules';
import { validatePassword } from '../../../core/utils/validators.js';
export default function ProfileModal({ isOpen, onClose }) {
    const { t ,lang} = useTranslation();

    // Active Tab State ('profile' or 'security')
    const [activeTab, setActiveTab] = useState('profile');
    // Profile State Fields
    const [profileId, setProfileId] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [userImage, setUserImage] = useState('');

    // Password State Fields
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Password Visibility Toggles
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Status & Loading Management Indicators
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadUserProfile();
            setActiveTab('profile'); // Reset to first tab on open
        }
    }, [isOpen]);

    const loadUserProfile = async () => {
        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        clearPasswordFields();

        const result = await GetProfileUseCase.execute();
        if (result.status) {
            setProfileId(result.data.id);
            setFirstName(result.data.firstName);
            setLastName(result.data.lastName);
            setPhoneNumber(result.data.phoneNumber);
            setUserImage(result.data.userImage);
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    };

    const clearPasswordFields = () => {
        setOldPassword('');
        setNewPassword('');
        setShowOldPassword(false);
        setShowNewPassword(false);
    };

    // Handler 1: Update Profile (First / Last Name)
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!firstName.trim() || !lastName.trim()) return;

        setIsSavingProfile(true);
        setError('');
        setSuccessMessage('');

        const result = await UpdateProfileUseCase.execute(profileId, firstName, lastName);
        if (result.status) {
            setSuccessMessage(t('profile_update_success'));
        } else {
            setError(result.message);
        }
        setIsSavingProfile(false);
    };

    // Handler 2: Change Password with robust strength validation checks
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!oldPassword || !newPassword) return;

        setError('');
        setSuccessMessage('');

        const passwordError = validatePassword(newPassword, t);
        if (passwordError) {
            setError(passwordError);
            return;
        }
        setIsChangingPassword(true)


        const result = await ChangePasswordUseCase.execute(oldPassword, newPassword);
        if (result.status) {
            setSuccessMessage(t('password_change_success'));
            clearPasswordFields();
        } else {
            setError(result.message);
        }
        setIsChangingPassword(false);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, padding: '16px' }}>
            <div className="modal-content" style={{ maxWidth: '550px', width: '100%', background: '#fff', borderRadius: '12px', display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>

                {/* 1. FIXED HEADER REGION */}
                <div style={{ padding: '24px 24px 0 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '600', color: '#1e293b' }}>{t('user_profile')}</h2>
                        <button className="btn-secondary" onClick={onClose} style={{ padding: '8px', cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '1.2rem' }} disabled={isSavingProfile || isChangingPassword}>
                            <i className="fa-solid fa-times" style={{ color: '#64748b' }}></i>
                        </button>
                    </div>

                    {/* User Card Summary Section */}
                    {!isLoading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', marginBottom: '16px' }}>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '50%',
                                background: '#e2e8f0', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                                overflow: 'hidden', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flexShrink: 0
                            }}>
                                {userImage ? (
                                    <img src={userImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <i className="fa-solid fa-user" style={{ color: '#94a3b8' }}></i>
                                )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{`${firstName} ${lastName}`}</h3>
                                <small style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontSize: '0.85rem' }}>
                                    <i className="fa-solid fa-phone" style={{ fontSize: '0.75rem' }}></i> {phoneNumber}
                                </small>
                            </div>
                        </div>
                    )}

                    {/* Modern UX Tab Navigation Switcher */}
                    {!isLoading && (
                        <div style={{ display: 'flex', borderBottom: '2px solid #f1f5f9', gap: '8px' }}>
                            <button
                                type="button"
                                onClick={() => { setError(''); setSuccessMessage(''); setActiveTab('profile'); }}
                                style={{
                                    padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500',
                                    color: activeTab === 'profile' ? '#0284c7' : '#64748b',
                                    borderBottom: activeTab === 'profile' ? '2px solid #0284c7' : '2px solid transparent',
                                    marginBottom: '-2px', transition: 'all 0.2s ease'
                                }}
                            >
                                <i className="fa-solid fa-id-card" style={{ marginInlineEnd: '6px' }}></i>
                                {t('personal_info')}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setError(''); setSuccessMessage(''); setActiveTab('security'); }}
                                style={{
                                    padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500',
                                    color: activeTab === 'security' ? '#0284c7' : '#64748b',
                                    borderBottom: activeTab === 'security' ? '2px solid #0284c7' : '2px solid transparent',
                                    marginBottom: '-2px', transition: 'all 0.2s ease'
                                }}
                            >
                                <i className="fa-solid fa-lock" style={{ marginInlineEnd: '6px' }}></i>
                                {t('change_password')}
                            </button>
                        </div>
                    )}
                </div>

                {/* 2. SCROLLABLE CONTENT BODY REGION */}
                <div style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
                    {isLoading ? (
                        <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
                            <i className="fa-solid fa-spinner fa-spin fa-2xl" style={{ marginBottom: '16px', color: '#0284c7' }}></i>
                            <div style={{ fontWeight: '500', marginTop: '8px' }}>{t('loading_profile')}</div>
                        </div>
                    ) : (
                        <div className="profile-form-body">
                            {/* Global Status Feedback Messages */}
                            {error && (
                                <div style={{ padding: '12px 16px', color: '#b91c1c', background: '#fef2f2', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', border: '1px solid #fee2e2' }}>
                                    <i className="fa-solid fa-triangle-exclamation" style={{ flexShrink: 0 }}></i>
                                    <span>{error}</span>
                                </div>
                            )}
                            {successMessage && (
                                <div style={{ padding: '12px 16px', color: '#15803d', background: '#f0fdf4', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: '500', border: '1px solid #dcfce7' }}>
                                    <i className="fa-solid fa-circle-check" style={{ flexShrink: 0 }}></i>
                                    <span>{successMessage}</span>
                                </div>
                            )}

                            {/* TAB PANEL 1: PROFILE PERSONAL FORMS */}
                            {activeTab === 'profile' && (
                                <form id="profileForm" onSubmit={handleUpdateProfile}>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div className="form-field" style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '500', color: '#475569' }}>
                                                {t('first_name')} <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                required
                                                disabled={isSavingProfile}
                                                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                        <div className="form-field" style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '500', color: '#475569' }}>
                                                {t('last_name')} <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                required
                                                disabled={isSavingProfile}
                                                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                    </div>
                                </form>
                            )}

                            {/* TAB PANEL 2: SECURITY MODIFICATION FORMS */}
                            {activeTab === 'security' && (
                                <form id="securityForm" onSubmit={handleChangePassword}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                                        {/* Old Password */}
                                        <div className="form-field">
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '500', color: '#475569' }}>
                                                {t('old_password')} <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                {/* Added custom padding to prevent text from overlapping with eye icon */}
                                                <input
                                                    type={showOldPassword ? "text" : "password"}
                                                    value={oldPassword}
                                                    onChange={(e) => setOldPassword(e.target.value)}
                                                    required
                                                    placeholder="••••••••"
                                                    disabled={isChangingPassword}
                                                    style={{ width: '100%', padding: '10px 40px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                                    style={{ position: 'absolute', insetInlineEnd: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                                                >
                                                    <i className={`fa-solid ${showOldPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                </button>
                                            </div>
                                        </div>

                                        {/* New Password */}
                                        <div className="form-field">
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '500', color: '#475569' }}>
                                                {t('new_password')} <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <div style={{ position: 'relative', marginBottom: '12px' }}>
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                    placeholder="••••••••"
                                                    disabled={isChangingPassword}
                                                    style={{ width: '100%', padding: '10px 40px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    style={{ position: 'absolute', insetInlineEnd: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                                                >
                                                    <i className={`fa-solid ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Reusable Password Rules Box */}
                                        <div style={{ direction: lang === 'ar' ? 'rtl' : 'ltr', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                                            <PasswordRules />
                                        </div>

                           
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                {/* 3. STATIC FIXED BUTTONS FOOTER BAR */}
                {!isLoading && (
                    <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#fff', borderRadius: '0 0 12px 12px' }}>
                        <button className="btn btn-secondary" type="button" onClick={onClose} disabled={isSavingProfile || isChangingPassword}>
                            {t('close')}
                        </button>

                        {activeTab === 'profile' ? (
                            <button
                                className="btn"
                                type="submit"
                                form="profileForm"
                                style={{ minWidth: '120px' }}
                                disabled={isSavingProfile || !firstName.trim() || !lastName.trim()}
                            >
                                {isSavingProfile ? <i className="fa-solid fa-spinner fa-spin"></i> : t('save_changes')}
                            </button>
                        ) : (
                            <button
                                className="btn"
                                type="submit"
                                form="securityForm"
                                style={{ background: '#0284c7', minWidth: '140px' }}
                                disabled={isChangingPassword || !oldPassword || !newPassword}
                            >
                                {isChangingPassword ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin" style={{ marginInlineEnd: '6px' }}></i>
                                        {t('updating')}
                                    </>
                                ) : (
                                    t('update_password')
                                )}
                            </button>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}