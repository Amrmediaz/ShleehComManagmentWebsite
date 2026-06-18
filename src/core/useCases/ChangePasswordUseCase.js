import { authApiClient } from '../../data/authApiClient.js'; // Adjust path matching your files

export const ChangePasswordUseCase = {
    async execute(oldPassword, newPassword) {
        try {
            await authApiClient.changePassword(oldPassword, newPassword);
            return { status: true };
        } catch (error) {
            return {
                status: false,
                message: error.message || 'Error executing password update request'
            };
        }
    }
};