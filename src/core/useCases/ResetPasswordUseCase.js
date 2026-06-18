import { AuthRepository } from '../../data/repositories/AuthRepository';
export const ResetPasswordUseCase = {
    /**
     * Executes the password reset request.
     * The backend will generate a new password and send it to the phone.
     */
    execute: async (phoneNumber) => {
        try {
            // We format the email as the backend expects (phoneNumber@gmail.com)
            const payload = {
                email: `${phoneNumber}@gmail.com`
            };

            // Using your apiClient (assuming it's an axios instance or similar)
            const response = await AuthRepository.resetPassword('${phoneNumber}@gmail.com')

            return { status: true, data: response.data };
        } catch (error) {
            return {
                status: false,
                message: error.response?.data?.message || 'Server connection error'
            };
        }
    }
};