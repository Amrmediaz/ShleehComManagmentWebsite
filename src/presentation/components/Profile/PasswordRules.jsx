import React from 'react';
import { useTranslation } from '../../context/LanguageContext.jsx';

export default function PasswordRules() {
    const { t, lang } = useTranslation();

    return (
        <div className="password-rules-box" style={{
            padding: '12px',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            color: '#475569',
            fontSize: '0.8rem',
            lineHeight: '1.5',
            direction: lang === 'ar' ? 'rtl' : 'ltr',
            textAlign: lang === 'ar' ? 'right' : 'left',
        }}>
            <strong style={{ display: 'block', marginBottom: '6px', color: '#1e293b', fontSize: '0.85rem' }}>
                {t('password_rules_title')}
            </strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span>• {t('rule_min_length')}</span>
                <span>• {t('rule_uppercase')}</span>
                <span>• {t('rule_lowercase')}</span>
                <span>• {t('rule_number')}</span>
                <span>• {t('rule_special_char')}</span>
            </div>
        </div>
    );
}