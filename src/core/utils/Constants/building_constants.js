/**
 * Building Constants
 * Shared across AddBuildingModal and EditBuildingModal
 */

import {
    IconShieldLock, IconWifi, IconCar, IconElevator,
    IconSnowflake, IconBarbell, IconRipple, IconBolt, IconCamera,
} from '@tabler/icons-react';

// ===== WILAYATS (All Oman Governorates & Wilayats) =====
export const WILAYATS_BILINGUAL = {
    'Muscat': {
        ar: 'محافظة مسقط',
        en: 'Muscat',
        wilayats: [
            { ar: 'مسقط', en: 'Muscat' },
            { ar: 'مطرح', en: 'Muttrah' },
            { ar: 'بوشر', en: 'Bawshar' },  // ✅ Corrected: was "Bausher"
            { ar: 'العامرات', en: 'Al Amerat' },  // ✅ Keep as is (also spelled Al Amirat)
            { ar: 'قريات', en: 'Qurayyat' },
            { ar: 'السيب', en: 'As Seeb' },
        ]
    },
    'Dhofar': {
        ar: 'محافظة ظفار',
        en: 'Dhofar',
        wilayats: [
            { ar: 'صلالة', en: 'Salalah' },
            { ar: 'ثمريت', en: 'Thumrait' },
            { ar: 'ميربات', en: 'Mirbat' },
            { ar: 'رخيوت', en: 'Rakhyut' },
            { ar: 'دلكوت', en: 'Dalkut' },
            { ar: 'شليم', en: 'Shalim' },
            { ar: 'المزيونة', en: 'Al Mazyunah' },
            { ar: 'مقشن', en: 'Muqshin' },
        ]
    },
    'Musandam': {
        ar: 'محافظة مسندم',
        en: 'Musandam',
        wilayats: [
            { ar: 'خصب', en: 'Khasab' },
            { ar: 'بخاء', en: 'Bukha' },
            { ar: 'دبة', en: 'Daba' },
            { ar: 'شناص', en: 'Shinas' },
            { ar: 'ليما', en: 'Lima' },
        ]
    },
    'Al Buraimi': {
        ar: 'محافظة البريمي',
        en: 'Al Buraimi',
        wilayats: [
            { ar: 'البريمي', en: 'Al Buraimi' },
            { ar: 'محضة', en: 'Mahda' },
            { ar: 'السنينة', en: 'As Sinainah' },
        ]
    },
    'Ad Dakhiliyah': {
        ar: 'محافظة الداخلية',
        en: 'Ad Dakhiliyah',
        wilayats: [
            { ar: 'نزوى', en: 'Nizwa' },
            { ar: 'بهلاء', en: 'Bahla' },
            { ar: 'منح', en: 'Manah' },
            { ar: 'الحمراء', en: 'Al Hamra' },
            { ar: 'آدم', en: 'Adam' },
            { ar: 'إزكي', en: 'Izki' },
            { ar: 'بدبد', en: 'Bidbid' },
            { ar: 'سمائل', en: 'Samail' },
        ]
    },
    'North Al Batinah': {
        ar: 'محافظة شمال الباطنة',
        en: 'North Al Batinah',
        wilayats: [
            { ar: 'صحار', en: 'Sohar' },
            { ar: 'شناص', en: 'Shinas' },
            { ar: 'لوى', en: 'Liwa' },
            { ar: 'صحم', en: 'Saham' },
            { ar: 'الخابورة', en: 'Al Khaburah' },
            { ar: 'السويق', en: 'As Suwayq' },
        ]
    },
    'South Al Batinah': {
        ar: 'محافظة جنوب الباطنة',
        en: 'South Al Batinah',
        wilayats: [
            { ar: 'الرستاق', en: 'Rustaq' },
            { ar: 'العوابي', en: 'Al Awabi' },
            { ar: 'نخل', en: 'Nakhal' },
            { ar: 'وادي المعاول', en: 'Wadi Al Maawil' },
            { ar: 'بركاء', en: 'Barka' },
            { ar: 'المصنعة', en: 'Al Musanaa' },
        ]
    },
    'Ash Sharqiyah North': {  // ✅ Corrected: was "North Al Sharqiyah"
        ar: 'محافظة شمال الشرقية',
        en: 'Ash Sharqiyah North',
        wilayats: [
            { ar: 'إبراء', en: 'Ibra' },
            { ar: 'المضيبي', en: 'Al Mudaybi' },  // ✅ Also spelled Al-Mudhaibi
            { ar: 'القابل', en: 'Al Qabil' },
            { ar: 'وادي بني خالد', en: 'Wadi Bani Khalid' },
            { ar: 'ديما والطائين', en: 'Dima Wa Al Tayeen' },
            { ar: 'الديما والطائيين', en: 'Al Tiwi' },  // Note: Some sources list this separately
        ]
    },
    'Ash Sharqiyah South': {  // ✅ Corrected: was "South Al Sharqiyah"
        ar: 'محافظة جنوب الشرقية',
        en: 'Ash Sharqiyah South',
        wilayats: [
            { ar: 'صور', en: 'Sur' },
            { ar: 'الكامل والوافي', en: 'Al Kamil Wal Wafi' },  // ✅ Verified spelling
            { ar: 'جعلان بني بو حسن', en: 'Jalan Bani Bu Hassan' },  // ✅ Verified spelling
            { ar: 'جعلان بني بو علي', en: 'Jalan Bani Bu Ali' },  // ✅ Verified spelling
            { ar: 'مصيرة', en: 'Masirah' },
        ]
    },
    'Ad Dhahirah': {
        ar: 'محافظة الظاهرة',
        en: 'Ad Dhahirah',
        wilayats: [
            { ar: 'عبري', en: 'Ibri' },
            { ar: 'ينقل', en: 'Yanqul' },
            { ar: 'ضنك', en: 'Dank' },
        ]
    },
    'Al Wusta': {
        ar: 'محافظة الوسطى',
        en: 'Al Wusta',
        wilayats: [
            { ar: 'هيما', en: 'Haima' },
            { ar: 'دقم', en: 'Duqm' },
            { ar: 'محوت', en: 'Mahout' },
            { ar: 'الجازر', en: 'Al Jazir' },
        ]
    },
};

// ===== LOCATION NAME LOOKUP (raw English value → Arabic) =====
// Buildings & chalets always store governorate/wilayat as the English name
// (see the `value={govKey}` / `value={wilayat.en}` options in
// LocationSection.jsx) regardless of which language the owner was using
// when they picked it — so anywhere it's displayed needs to re-localize it
// for the current UI language rather than showing the raw English string.
const GOVERNORATE_AR_BY_EN = Object.fromEntries(
    Object.values(WILAYATS_BILINGUAL).map((g) => [g.en, g.ar])
);
const WILAYAT_AR_BY_EN = Object.fromEntries(
    Object.values(WILAYATS_BILINGUAL).flatMap((g) => g.wilayats.map((w) => [w.en, w.ar]))
);

/** Localizes a governorate name (stored in English) for the current language. */
export function localizeGovernorate(enName, lang) {
    if (!enName || lang !== 'ar') return enName;
    return GOVERNORATE_AR_BY_EN[enName] || enName;
}

/** Localizes a wilayat/city name (stored in English) for the current language. */
export function localizeWilayat(enName, lang) {
    if (!enName || lang !== 'ar') return enName;
    return WILAYAT_AR_BY_EN[enName] || enName;
}

// Keep the old format for backward compatibility if needed
export const WILAYATS = {
    'Muscat': ['Muscat', 'Muttrah', 'Bausher', 'Al Amerat', 'Qurayyat', 'As Seeb'],
    'Dhofar': ['Salalah', 'Thumrait', 'Mirbat', 'Rakhyut', 'Dalkut', 'Shalim', 'Al Mazyunah', 'Muqshin'],
    'Musandam': ['Khasab', 'Bukha', 'Daba', 'Shinas', 'Lima'],
    'Al Buraimi': ['Al Buraimi', 'Mahda', 'As Sinainah'],
    'Ad Dakhiliyah': ['Nizwa', 'Bahla', 'Manah', 'Al Hamra', 'Adam', 'Izki', 'Bidbid', 'Samail'],
    'North Al Batinah': ['Sohar', 'Shinas', 'Liwa', 'Saham', 'Al Khaburah', 'As Suwayq'],
    'South Al Batinah': ['Rustaq', 'Al Awabi', 'Nakhal', 'Wadi Al Maawil', 'Barka', 'Al Musanaa'],
    'North Al Sharqiyah': ['Ibra', 'Al Mudaybi', 'Al Qabil', 'Wadi Bani Khalid', 'Dima Wa Al Tayeen'],
    'South Al Sharqiyah': ['Sur', 'Jalan Bani Bu Ali', 'Jalan Bani Bu Hassan', 'Masirah', 'Al Kamil Wal Wafi'],
    'Ad Dhahirah': ['Ibri', 'Yanqul', 'Dank'],
    'Al Wusta': ['Haima', 'Duqm', 'Mahout', 'Al Jazir'],
};

// ===== UNIT TYPES (All Property Types) =====
export const UNIT_TYPES = [
    { id: 1, en: 'studio', ar: 'استوديو' },
    { id: 2, en: 'one_br', ar: 'غرفة وصالة' },
    { id: 3, en: 'two_br', ar: 'غرفتين وصالة' },
    { id: 4, en: 'three_br', ar: 'ثلاث غرف وصالة' },
    { id: 5, en: 'four_br', ar: 'أربع غرف وصالة' },
    { id: 6, en: 'five_plus_br', ar: 'خمس غرف وصالة فأكثر' },
    { id: 7, en: 'loft', ar: 'صالة مفتوحة لوفت' },
    { id: 8, en: 'duplex', ar: 'دوبلكس' },
    { id: 9, en: 'triplex', ar: 'تريبلكس' },
    { id: 10, en: 'penthouse', ar: 'بنتهاوس' },
    { id: 11, en: 'garden_apartment', ar: 'شقة أرضية بحديقة' },
    { id: 12, en: 'basement_apartment', ar: 'شقة قبو' },
    { id: 13, en: 'serviced_apartment', ar: 'شقة مفروشة بخدمات' },
];

// ===== AMENITY SERVICE MAPPING =====
export const AMENITY_SERVICE_MAP = {
    sec_24: 'Security 24/7',
    wifi: 'WiFi',
    parking: 'Parking',
    elevator: 'Elevator',
    ac: 'Air Conditioning',
    gym: 'Gym',
    pool: 'Swimming Pool',
    power: 'Power Backup',
    cctv: 'CCTV',
};

// ===== AMENITIES UI CONFIG (With Icons & Colors) =====
export const AMENITIES_UI = [
    { key: 'sec_24', Icon: IconShieldLock, bg: '#EEEDFE', color: '#534AB7' },
    { key: 'wifi', Icon: IconWifi, bg: '#E6F1FB', color: '#185FA5' },
    { key: 'parking', Icon: IconCar, bg: '#E1F5EE', color: '#0F6E56' },
    { key: 'elevator', Icon: IconElevator, bg: '#FAEEDA', color: '#854F0B' },
    { key: 'ac', Icon: IconSnowflake, bg: '#FAECE7', color: '#993C1D' },
    { key: 'gym', Icon: IconBarbell, bg: '#FBEAF0', color: '#993556' },
    { key: 'pool', Icon: IconRipple, bg: '#E6F1FB', color: '#185FA5' },
    { key: 'power', Icon: IconBolt, bg: '#FAEEDA', color: '#854F0B' },
    { key: 'cctv', Icon: IconCamera, bg: '#F1EFE8', color: '#5F5E5A' },
];

// ===== REVERSE MAPPING: Service Name → Amenity Key =====
export const SERVICE_TO_KEY = Object.fromEntries(
    Object.entries(AMENITY_SERVICE_MAP).map(([k, v]) => [v, k])
);

// Case-insensitive lookup table, since raw service strings coming back from
// the API don't always match AMENITY_SERVICE_MAP's casing exactly.
const SERVICE_TO_KEY_LOWER = Object.fromEntries(
    Object.entries(SERVICE_TO_KEY).map(([display, key]) => [display.toLowerCase(), key])
);

/**
 * Resolves a raw building service string (e.g. "CCTV", "Swimming Pool") to
 * its icon/color + translation key, for rendering a proper amenity chip
 * instead of a plain untranslated badge.
 *
 * @param {string} serviceDisplay - raw service string from the API
 * @returns {{ key: string, Icon: any, bg: string, color: string } | null}
 */
export function getAmenityMeta(serviceDisplay) {
    if (!serviceDisplay) return null;
    const key = SERVICE_TO_KEY[serviceDisplay] || SERVICE_TO_KEY_LOWER[String(serviceDisplay).toLowerCase()];
    if (!key) return null;
    return AMENITIES_UI.find((a) => a.key === key) || null;
}