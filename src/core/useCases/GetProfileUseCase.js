import { authApiClient } from '../../data/authApiClient.js'; // Adjust path matching your files

export const GetProfileUseCase = {
    async execute() {
        try {
            const profileData = await authApiClient.getProfile();
            return {
                status: true,
                data: profileData
            };
        } catch (error) {
            return {
                status: false,
                message: error.message || 'Error parsing profile payload data'
            };
        }
    }
};