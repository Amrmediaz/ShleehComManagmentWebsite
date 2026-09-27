import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext.jsx';
import {
    FetchChaletPricesUseCase,
    SaveChaletPriceUseCase,
    DeleteChaletPriceUseCase,
} from '../../core/useCases/ChaletUseCases.js';
import { convertFromApiDate } from '../../core/utils/helper/date_utils.js';

/**
 * useChaletPrices
 * CRUD for chalet special prices. Unlike flats (always a date range), a
 * chalet price rule can be either a recurring weekday (type 1) or a date
 * range (type 2) — mirrors the mobile app's SetPriceScreen.
 */
export const useChaletPrices = (chaletId) => {
    const { t } = useTranslation();

    const [pricesList, setPricesList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ type: 2, day: '', startDate: '', endDate: '', price: '' });
    const [formErrors, setFormErrors] = useState({});

    const loadPrices = useCallback(async () => {
        if (!chaletId) return;
        setIsLoading(true);
        setStatusMessage({ text: '', isError: false });

        const { result, error } = await FetchChaletPricesUseCase.execute(chaletId, t);
        if (error) {
            setStatusMessage({ text: error, isError: true });
            setPricesList([]);
        } else {
            setPricesList(result || []);
        }
        setIsLoading(false);
    }, [chaletId, t]);

    useEffect(() => {
        if (chaletId) loadPrices();
    }, [chaletId, loadPrices]);

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'type' ? Number(value) : value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    }, [formErrors]);

    const resetForm = useCallback(() => {
        setFormData({ type: 2, day: '', startDate: '', endDate: '', price: '' });
        setFormErrors({});
        setEditingId(null);
    }, []);

    const startEdit = useCallback((price) => {
        setEditingId(price.id);
        setFormData({
            type: price.type || 2,
            day: price.day || '',
            // API returns dates as "DD/MM/YYYY" — convert to "YYYY-MM-DD" for the <input type="date">.
            startDate: price.startDate ? convertFromApiDate(price.startDate) : '',
            endDate: price.endDate ? convertFromApiDate(price.endDate) : '',
            price: price.price ?? '',
        });
        setFormErrors({});
    }, []);

    const savePrice = useCallback(async (e) => {
        e.preventDefault();
        setStatusMessage({ text: '', isError: false });
        setIsSaving(true);

        const { validationErrors, error } = await SaveChaletPriceUseCase.execute(
            { ...formData, chaletId },
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

        setStatusMessage({
            text: editingId ? (t('price_updated_success') || 'Price updated!') : (t('price_added_success') || 'Price added!'),
            isError: false,
        });
        resetForm();
        await loadPrices();
        setIsSaving(false);
    }, [formData, chaletId, editingId, t, resetForm, loadPrices]);

    const deletePrice = useCallback(async (priceId) => {
        if (!window.confirm(t('confirm_delete_price') || 'Are you sure?')) return;
        setIsSaving(true);
        setStatusMessage({ text: '', isError: false });

        const { error } = await DeleteChaletPriceUseCase.execute(priceId, t);
        if (error) {
            setStatusMessage({ text: error, isError: true });
        } else {
            setStatusMessage({ text: t('price_deleted_success') || 'Price deleted!', isError: false });
            await loadPrices();
        }
        setIsSaving(false);
    }, [t, loadPrices]);

    return {
        pricesList, isLoading, isSaving, statusMessage,
        formData, formErrors, editingId,
        handleFormChange, savePrice, deletePrice, startEdit, resetForm, loadPrices, setStatusMessage,
    };
};
