// src/data/mock/initialState.js

// Stand-in architecture logic mimicking your operational database backend
export const initialBuildings = [
    {
        id: "bld-101",
        name: "Al Mouj Horizon Residence",
        address: "Street 4, Sector 12, Muscat",
        floors: 6,
        flats: 48,
        governorate: "Muscat",
        wilayat: "Seeb",
        services: ["Wi-Fi", "Basement Parking", "Gymnasium", "24/7 Security"],
        isActive: true,
        roomTypes: [
            { id: "rm-deluxe", name: "Executive Deluxe Suite", count: 20, occupied: 14, pricePerNight: 45, pricePerMonth: 850 },
            { id: "rm-studio", name: "Premium Studio Flat", count: 28, occupied: 12, pricePerNight: 30, pricePerMonth: 550 }
        ]
    },
    {
        id: "bld-202",
        name: "Salalah Central Galleria",
        address: "Al Nahdah Street, Salalah",
        floors: 4,
        flats: 20,
        governorate: "Dhofar",
        wilayat: "Salalah",
        services: ["Central AC", "Free Parking"],
        isActive: true,
        roomTypes: [
            { id: "rm-family", name: "2BHK Family Apartment", count: 20, occupied: 5, pricePerNight: 60, pricePerMonth: 1100 }
        ]
    }
];

export const initialBookings = [
    { id: "bk-01", guestName: "Salim Al-Harthy", phone: "+968 9123 4567", email: "salim@bms.om", roomTypeId: "rm-deluxe", checkIn: "2026-06-15", checkOut: "2026-06-20", ratePlan: "daily", totalPaid: 225, status: "Upcoming" },
    { id: "bk-02", guestName: "Fatma Al-Said", phone: "+968 9876 5432", email: "fatma@bms.om", roomTypeId: "rm-studio", checkIn: "2026-06-01", checkOut: "2026-06-10", ratePlan: "daily", totalPaid: 270, status: "Active" }
];

export const mockOffers = [
    { id: "off-eid", name: "Eid Holiday Offer", discountPercent: 15, isActive: true }
];