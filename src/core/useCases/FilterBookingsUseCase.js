export class FilterBookingsUseCase {
    execute(bookings, { searchName, roomTypeId, status }) {
        return bookings.filter(booking => {
            const matchesName = searchName ? booking.guestName.toLowerCase().includes(searchName.toLowerCase()) : true;
            const matchesType = roomTypeId && roomTypeId !== 'ALL' ? String(booking.roomTypeId) === String(roomTypeId) : true;
            const matchesStatus = status && status !== 'ALL' ? booking.status === status : true;
            return matchesName && matchesType && matchesStatus;
        });
    }
}