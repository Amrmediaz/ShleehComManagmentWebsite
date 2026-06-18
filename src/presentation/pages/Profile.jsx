import React from 'react';

export default function Profile({ user, t }) {
    // Default user data - you can hook this to your Auth context
    const userData = user || {
        name: "Admin User",
        email: "admin@bms.com",
        role: "Property Manager",
        lastLogin: "2026-06-06 09:15 AM"
    };

    return (
        <div className="form-container">
            <div className="card-panel">
                <h2 className="panel-title">{t('profile_settings')}</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--slate-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                        <i className="fa-solid fa-user" style={{ color: 'var(--slate-500)' }}></i>
                    </div>
                    <div>
                        <h3>{userData.name}</h3>
                        <p style={{ color: 'var(--text-muted)' }}>{userData.role}</p>
                    </div>
                </div>

                <div className="form-group-row">
                    <div className="form-field">
                        <label>{t('full_name')}</label>
                        <input type="text" defaultValue={userData.name} />
                    </div>
                    <div className="form-field">
                        <label>{t('email_address')}</label>
                        <input type="email" defaultValue={userData.email} />
                    </div>
                </div>

                <div className="form-field">
                    <label>{t('role')}</label>
                    <input type="text" value={userData.role} disabled style={{ background: 'var(--slate-50)' }} />
                </div>

                <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                    <button className="btn">{t('save_changes')}</button>
                    <button className="btn btn-secondary">{t('change_password')}</button>
                </div>
            </div>

            <div className="card-panel">
                <h3 className="panel-title">{t('system_info')}</h3>
                <p><strong>{t('last_login')}:</strong> {userData.lastLogin}</p>
                <p><strong>{t('timezone')}:</strong> Muscat, Oman (GST)</p>
            </div>
        </div>
    );
}