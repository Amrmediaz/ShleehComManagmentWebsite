import { authApiClient } from '../../data/authApiClient.js'; // Adjust path matching your files

export const UpdateProfileUseCase = {
    async execute(profileId, firstName, lastName) {
        try {
            await authApiClient.updateProfile(profileId, firstName, lastName);
            return { status: true };
        } catch (error) {
            return {
                status: false,
                message: error.message || 'Error updating profile details'
            };
        }
    }
};