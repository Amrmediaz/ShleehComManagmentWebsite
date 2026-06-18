export class Booking {
    constructor({ id, guestName, phone, email, roomTypeId, checkIn, checkOut, ratePlan, totalPaid, status }) {
        this.id = id;
        this.guestName = guestName;
        this.phone = phone;
        this.email = email;
        this.roomTypeId = roomTypeId;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.ratePlan = ratePlan; // 'daily' | 'monthly'
        this.totalPaid = totalPaid;
        this.status = status; // 'Active' | 'Upcoming' | 'Cancelled'
    }
}