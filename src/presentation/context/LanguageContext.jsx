import React, { createContext, useState, useContext, useEffect } from 'react';
import { dictionary } from '/src/core/localization/dictionary.js';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState('en');

    useEffect(() => {
        // Target documentElement (the <html> tag) for global RTL support
        const root = document.documentElement;

        root.setAttribute('lang', lang);
        root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    }, [lang]);

    const toggleLanguage = () => setLang(prev => prev === 'en' ? 'ar' : 'en');

    const t = (key) => dictionary[lang]?.[key] || key;

    return (
        <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useTranslation = () => useContext(LanguageContext);