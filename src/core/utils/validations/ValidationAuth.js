// Import the shared validators
import { validatePassword, validatePhone } from '../validators.js';

export const validateRegisterFields = ({ firstName, lastName, phoneNumber, password }, t) => {
    // 1. Name Validations
    if (!firstName?.trim() || firstName.trim().length < 2) return t('error_firstname');
    if (!lastName?.trim() || lastName.trim().length < 2) return t('error_lastname');

    // 2. Phone Validation
    const phoneError = validatePhone(phoneNumber, t, 'invalid_phone');
    if (phoneError) return phoneError;

    // 3. Password Validation
    const passwordError = validatePassword(password, t);
    if (passwordError) return passwordError;

    return null;
};

export const validateLoginFields = ({ phoneNumber, password }, t) => {
    const phoneError = validatePhone(phoneNumber, t, 'invalid_phone');
    if (phoneError) return phoneError;

    if (!password) return t('password_required');

    return null;
};