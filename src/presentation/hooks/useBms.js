import { useState, useEffect } from 'react';
import { BmsRepositoryImpl } from '../../data/repositories/BmsRepositoryImpl.js';

export const useBms = () => {
    const [buildings, setBuildings] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBuilding, setSelectedBuilding] = useState('bld-101');
    const [currentScreen, setCurrentScreen] = useState('dashboard');

    const repo = new BmsRepositoryImpl();

    const fetchData = async () => {
        setLoading(true);
        try {
            const b = await repo.getBuildings();
            const bk = await repo.getBookings();
            setBuildings(b || []); // Ensure we at least set an empty array
            setBookings(bk || []);
        } catch (error) {
            console.error("Failed to fetch BMS data:", error);
            // Even on error, we set empty arrays so the UI doesn't break
            setBuildings([]);
            setBookings([]);
        } finally {
            // This runs whether success or failure
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        buildings,
        bookings,
        loading,
        selectedBuilding,
        currentScreen,
        setCurrentScreen,
        changeBuilding: setSelectedBuilding,
        addBooking: async (b) => {
            await repo.saveBooking(b);
            await fetchData();
        }
    };
};