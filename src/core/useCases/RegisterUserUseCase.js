import { AuthRepository } from '../../data/repositories/AuthRepository';

export const RegisterUserUseCase = {
    execute: async ({ firstName, lastName,countryCode, phoneNumber, password }) => {
        // Business Rule: Construct synthetic email structure
        const structuredEmail = `${countryCode+phoneNumber.trim()}@gmail.com`;

        const payload = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phoneNumber: countryCode + phoneNumber.trim(),
            email: structuredEmail,
            password: password.trim()
        };

        return await AuthRepository.registerOwner(payload);
    }
};