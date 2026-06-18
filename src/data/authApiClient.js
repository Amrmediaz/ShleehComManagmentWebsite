export const authApiClient = {
    
    async postRegister(payload) {
        const API_URL = import.meta.env.VITE_API_URL || 'https://shleeh.com';
      
        const response = await fetch(API_URL+'/api/Owners/AddOwner', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Server connection error');
        }
        return await response.json();
    },
    async postLogin(payload) {
        // Safe mapping configuration block:
        // If the upstream layout passed independent keys, construct the expected object contract layout.
        // Otherwise, if it's already structured correctly, pass it right through.
        const normalizedPayload = payload.username
            ? payload
            : {
                username: `${payload.countryCode || '968'}${payload.phoneNumber}`,
                password: payload.password
            };

        console.log("📤 Serialized Login Payload leaving the client:", JSON.stringify(normalizedPayload));
        const API_URL = import.meta.env.VITE_API_URL || 'https://shleeh.com';

        const response = await fetch(API_URL+'/api/Owners/Login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(normalizedPayload), // Sends unified username key string
        });

        // Safe interception handling block preventing unexpected script terminations
        if (!response.ok && response.status !== 201) {
            try {
                const errorBody = await response.json();
                console.error("❌ Server Rejected Login (400 Body details):", errorBody);

                return {
                    status: false,
                    message: errorBody.message || errorBody.title || 'Invalid credentials'
                };
            } catch (parseError) {
                return { status: false, message: 'Server connection error' };
            }
        }

        return await response.json();
    },
    async getProfile() {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'https://shleeh.com';

        const response = await fetch(API_URL+'/api/Owners/GetOwner', {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load user profile from server');
        }

        const data = await response.json();
        // Your backend maps the target UserProfile properties inside the 'message' key field wrapper
        return data.message;
    } ,
    async updateProfile(profileId, firstName, lastName) {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'https://shleeh.com';

        const response = await fetch(API_URL+'/api/Owners/UpdateOwnerData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id: profileId,
                firstName: firstName,
                lastName: lastName,
                businessDescription: '',
                note: '',
                birthDate: '',
                userImage: '',
                gender: 0
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update profile data');
        }

        return await response.json();
    },
    async changePassword(oldPassword, newPassword) {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'https://shleeh.com';

        const response = await fetch(API_URL+'/api/Owners/ChangePassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                oldPassword: oldPassword,
                newPassword: newPassword
            })
        });

        if (!response.ok) {
            // You can extract a backend error message here if your API returns one
            throw new Error('Failed to change password. Please verify your old password.');
        }

        return await response.json();
    } ,
    async checkUserExists(phoneNumber) {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://shleeh.com';

            const response = await fetch(API_URL+'/api/Owners/CheckUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: `${phoneNumber}@gmail.com` }),
            });

            const responseData = await response.json().catch(() => ({}));

            // 1. Check HTTP Status
            if (!response.ok) {
                return { status: false, message: responseData.message || 'Server Error' };
            }

            // 2. LOGIC FIX: Check the specific message from the server
            // If the server returns "Data Used", that's your success condition!
            if (responseData.message === "Data Used") {
                return { status: true, data: responseData };
            }

            // Otherwise, treat as not found or failed
            return { status: false, message: 'User not found' };

        } catch (error) {
            return { status: false, message: 'Server connection error' };
        }
    },
    async sendOtp(phoneNumber, otp) {
        const API_URL = import.meta.env.VITE_API_URL || 'https://shleeh.com';

        const response = await fetch(API_URL+'/api/Support/SendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: phoneNumber,
                message: `Your OTP code is ${otp}`,
                token: "AVUD00KF14BD76DUDB"
            }),
        });
        return await response.json();
    },
    async resetPassword(phoneNumber, newPassword) {
        // Based on your Flutter ResetPasswordScreen
        const API_URL = import.meta.env.VITE_API_URL || 'https://shleeh.com';

        const response = await fetch(API_URL+'/api/Owners/RestPassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: `${phoneNumber}@gmail.com` }),
        });
        return await response.json();
    }
};
