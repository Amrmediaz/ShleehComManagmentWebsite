import { AuthRepository } from '../../data/repositories/AuthRepository';
import { UserCredentials } from '../entities/UserCredentials';

export const LoginUserUseCase = {
    execute: async ({ countryCode, phoneNumber, password }) => {
        const credentials = new UserCredentials({ countryCode, phoneNumber, password });

        // Dispatches the fully prepared domain username to the data repository
        return await AuthRepository.loginOwner(credentials.username, credentials.password);
    }
};