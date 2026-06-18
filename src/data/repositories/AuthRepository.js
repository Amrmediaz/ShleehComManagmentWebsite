import { authApiClient } from '../authApiClient.js';

export const AuthRepository = {
    async registerOwner(registrationData) {
        const responseData = await authApiClient.postRegister(registrationData);

        if (responseData.status === true) {
            // Manage cache persistence layers cleanly
            localStorage.setItem('token', responseData.message.token);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('expaire', responseData.message.expaire);
        }

        return responseData; // Returns { status: true/false, message: ... }
    } ,
    async loginOwner(username, password) {
        const responseData = await authApiClient.postLogin({ username, password });

        if (responseData.status === true) {
            // Caches data locally matching your state rules
            localStorage.setItem('token', responseData.token);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('expaire', responseData.expaire);
        }

        return responseData; // Returns { status: true/false, message/token... }
    } ,
    async checkUserExists(phone) {
        return await authApiClient.checkUserExists(phone);
    },

    async sendOtp(phone, otp) {
        return await authApiClient.sendOtp(phone, otp);
    },

    async resetPassword(phone) {
        const responseData = await authApiClient.resetPassword(phone);

        // If your business rule requires caching or state management upon 
        // password reset, you put it here, not in the component.
        return responseData;
    }
};