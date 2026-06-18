export class UserCredentials {
    constructor({ countryCode, phoneNumber, password }) {
        this.countryCode = countryCode || '968';
        this.phoneNumber = phoneNumber.trim();
        this.password = password;
    }

    // Combines code and phone to match the backend 'username' requirement
    get username() {
        return `${this.countryCode}${this.phoneNumber}`;
    }
}