import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext.jsx';
import {
    EditSpecialPriceUseCase,
    DeleteSpecialPriceUseCase,
    FetchSpecialPricesUseCase,
} from '../../core/useCases/EditSpecialPriceUseCase.js';

import  {formatDateToDDMMYYYY} from '../../core/utils/helper/Helpers.js';

/**
 * useSpecialPrices
 * Custom hook for managing special prices
 * Encapsulates all business logic for CRUD operations on special prices
 *
 * @param {number} flatId - The flat ID to manage prices for
 * @returns {object} Hook interface with state and methods
 */
export const useSpecialPrices = (flatId) => {
    const { t } = useTranslation();

    // ──── STATE ────
    const [pricesList, setPricesList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

    // Form state
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        price: '',
    });
    const [formErrors, setFormErrors] = useState({});

    // ──── LOAD PRICES ────
    const loadPrices = useCallback(async () => {
        if (!flatId) return;

        setIsLoading(true);
        setStatusMessage({ text: '', isError: false });

        const { result, error } = await FetchSpecialPricesUseCase.execute(flatId, t);

        if (error) {
            setStatusMessage({ text: error, isError: true });
            setPricesList([]);
        } else {
            setPricesList(result || []);
        }

        setIsLoading(false);
    }, [flatId, t]);

    // Load prices on mount or when flatId changes
    useEffect(() => {
        if (flatId) {
            loadPrices();
        }
    }, [flatId, loadPrices]);

    // ──── FORM HANDLERS ────
    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    }, [formErrors]);

    const resetForm = useCallback(() => {
        setFormData({ startDate: '', endDate: '', price: '' });
        setFormErrors({});
        setEditingId(null);
    }, []);

    const startEdit = useCallback((price) => {
        setEditingId(price.id);
        setFormData({
            startDate: price.startDate || '',
            endDate: price.endDate || '',
            price: price.price || '',
        });
        setFormErrors({});
    }, []);

    // ──── SAVE PRICE (ADD OR UPDATE) ────
    const savePrice = useCallback(async (e) => {
        e.preventDefault();
        setStatusMessage({ text: '', isError: false });

        const payload = {
            startDate: formData.startDate,
            endDate: formData.endDate,
            price: formData.price,
            flatId: flatId,
        };
       console.log("x" + JSON.stringify(payload));
        setIsSaving(true);

        const { validationErrors, result, error } = await EditSpecialPriceUseCase.execute(
            payload,
            editingId,
            t
        );

        if (validationErrors) {
            setFormErrors(validationErrors);
            setIsSaving(false);
            return;
        }

        if (error) {
            setStatusMessage({ text: error, isError: true });
            setIsSaving(false);
            return;
        }

        // Success: reload prices and reset form
        const successMsg = editingId
            ? t('price_updated_success') || 'Price updated successfully!'
            : t('price_added_success') || 'Price added successfully!';

        setStatusMessage({ text: successMsg, isError: false });
        resetForm();
        await loadPrices();

        setIsSaving(false);
    }, [formData, flatId, editingId, t, resetForm, loadPrices]);

    // ──── DELETE PRICE ────
    const deletePrice = useCallback(async (priceId) => {
        if (!window.confirm(t('confirm_delete_price') || 'Are you sure?')) {
            return;
        }

        setIsSaving(true);
        setStatusMessage({ text: '', isError: false });

        const { result, error } = await DeleteSpecialPriceUseCase.execute(priceId, t);

        if (error) {
            setStatusMessage({ text: error, isError: true });
        } else {
            setStatusMessage({ text: t('price_deleted_success') || 'Price deleted!', isError: false });
            await loadPrices();
        }

        setIsSaving(false);
    }, [t, loadPrices]);

    // ──── PUBLIC API ────
    return {
        // State
        pricesList,
        isLoading,
        isSaving,
        statusMessage,
        formData,
        formErrors,
        editingId,

        // Methods
        handleFormChange,
        savePrice,
        deletePrice,
        startEdit,
        resetForm,
        loadPrices,
        setStatusMessage,
    };
};