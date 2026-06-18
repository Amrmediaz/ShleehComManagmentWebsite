/**
 * Core Domain Business Logic for Price Verification
 * Calculates costs based on Omani weekend markups and global promotional offers.
 */
export class CalculateBookingPrice {
    execute({ checkIn, checkOut, ratePlan, roomType, specialOffers = [] }) {
        if (!checkIn || !checkOut || !roomType) return { baseCost: 0, discount: 0, grandTotal: 0 };

        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        if (totalDays <= 0) return { baseCost: 0, discount: 0, grandTotal: 0 };

        let baseCost = 0;

        if (ratePlan === 'monthly') {
            // Calculate based on standard fixed monthly tiering
            baseCost = roomType.pricePerMonth * (totalDays / 30);
        } else {
            // Daily plan with local standard weekend markups (+5 OMR for Friday/Saturday check-ins)
            let current = new Date(start);
            for (let i = 0; i < totalDays; i++) {
                const dayOfWeek = current.getDay(); // 5 = Friday, 6 = Saturday
                let nightPrice = roomType.pricePerNight;
                if (dayOfWeek === 5 || dayOfWeek === 6) {
                    nightPrice += 5;
                }
                baseCost += nightPrice;
                current.setDate(current.getDate() + 1);
            }
        }

        baseCost = Math.round(baseCost);

        // Apply any active promotional tiers (e.g., Eid Offers)
        let maxDiscountPercent = 0;
        specialOffers.forEach(offer => {
            if (offer.isActive) {
                maxDiscountPercent = Math.max(maxDiscountPercent, offer.discountPercent);
            }
        });

        const discount = Math.round(baseCost * (maxDiscountPercent / 100));
        const grandTotal = baseCost - discount;

        return { baseCost, discount, grandTotal, totalDays };
    }
}