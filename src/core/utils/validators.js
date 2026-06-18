export const validateRegisterFields = ({ firstName, lastName, phoneNumber, password, lang }) => {
    // 1. First Name Validation
    if (!firstName?.trim()) {
        return lang === 'ar' ? 'يرجى إدخال الاسم الأول' : 'First name is required';
    }
    if (firstName.trim().length < 2) {
        return lang === 'ar' ? 'يجب أن يكون الاسم الأول من حرفين على الأقل' : 'First name must be at least 2 characters';
    }

    // 2. Last Name Validation
    if (!lastName?.trim()) {
        return lang === 'ar' ? 'يرجى إدخال اسم العائلة' : 'Last name is required';
    }
    if (lastName.trim().length < 2) {
        return lang === 'ar' ? 'يجب أن يكون اسم العائلة من حرفين على الأقل' : 'Last name must be at least 2 characters';
    }

    // 3. Phone Number Validation
    const phoneRegex = /^[0-9]{8,15}$/;
    if (!phoneNumber?.trim()) {
        return lang === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Phone number is required';
    }
    if (!phoneRegex.test(phoneNumber.trim())) {
        return lang === 'ar' ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number';
    }

    // 4. Password Structure Rules
    if (!password || password.length < 8) {
        return lang === 'ar' ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' : 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
        return lang === 'ar' ? 'يجب أن تحتوي على حرف كبير واحد على الأقل' : 'Must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
        return lang === 'ar' ? 'يجب أن تحتوي على حرف صغير واحد على الأقل' : 'Must contain at least one lowercase letter';
    }
    if (!/\d/.test(password)) {
        return lang === 'ar' ? 'يجب أن تحتوي على رقم واحد على الأقل' : 'Must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return lang === 'ar' ? 'يجب أن تحتوي على رمز خاص واحد على الأقل' : 'Must contain at least one special character';
    }

    return null; // All clean
};

export const validateLoginFields = ({ phoneNumber, password }) => {
    if (!phoneNumber?.trim()) {
        return 'phone_required';
    }

    const phoneRegex = /^[0-9]{8,15}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
        return 'invalid_phone';
    }

    if (!password) {
        return 'password_required';
    }

    return null;
};

export const validatePassword = (password, t) => {
    if (!password || password.trim() === '') {
        return t('rule_error_required'); // Make sure to add this key to your JSON
    }
    if (password.length < 8) return t('rule_error_min_length');
    if (!/[A-Z]/.test(password)) return t('rule_error_uppercase');
    if (!/[a-z]/.test(password)) return t('rule_error_lowercase');
    if (!/\d/.test(password)) return t('rule_error_number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return t('rule_error_special_char');

    return null; // Return null if password is valid
};
const PHONE_REGEX = /^[0-9]{8,15}$/; // Adjust the regex pattern to match your country requirements
export const validatePhone = (phoneNumber, t, errorKey = 'invalid_phone') => {
    if (!phoneNumber?.trim()) return t('phone_required');
    if (!PHONE_REGEX.test(phoneNumber.trim())) return t(errorKey);
    return null;
};

export const validateBuilding = (data, lang) => {
    const isAr = lang === 'ar';
    if (!data.nameAr?.trim() || !data.nameEn?.trim()) return isAr ? 'اسم المبنى مطلوب' : 'Building name is required';
    if (!data.totalFloor || data.totalFloor <= 0) return isAr ? 'يجب إدخال عدد الطوابق' : 'Floors are required';
    if (!data.governorate || !data.state) return isAr ? 'يجب اختيار المحافظة والولاية' : 'Governorate and state are required';
    return null;
};