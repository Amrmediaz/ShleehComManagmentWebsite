import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext.jsx';
import { GetChaletTodayOfferUseCase, UpdateChaletTodayOfferUseCase } from '../../core/useCases/ChaletUseCases.js';

/**
 * useChaletTodayOffer
 * Owner-facing controls for "Today's Offer" on a single chalet (see
 * TODAY-OFFER-API-SPEC.md). Uses the dedicated GetTodayOffer/UpdateTodayOffer
 * owner-panel endpoints (Part 5) instead of the general chalet update/detail
 * — no need to rebuild the chalet's full ~25-field payload just to flip 3
 * fields, and the live `todayOfferActive` status is always freshly fetched
 * rather than relying on whatever was loaded elsewhere in the app.
 *
 * ChaletOffersTab is rendered with `key={chalet.id}` by its parent, so
 * switching chalets remounts this hook fresh — the load effect below only
 * ever needs to run once per mount, keyed on chaletId.
 */
export const useChaletTodayOffer = (chalet) => {
    const { t } = useTranslation();
    const chaletId = chalet?.id;

    const [settingsId, setSettingsId] = useState(0);
    const [enabled, setEnabled] = useState(false);
    const [percent, setPercent] = useState('');
    const [triggerHour, setTriggerHour] = useState(12);
    const [isLive, setIsLive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });
    const [formError, setFormError] = useState('');

    const loadSettings = useCallback(async () => {
        if (!chaletId) return;
        const { result, error } = await GetChaletTodayOfferUseCase.execute(chaletId, t);
        if (result) {
            setSettingsId(result.id ?? 0);
            setEnabled(result.todayOfferEnabled);
            setPercent(result.todayOfferPercent ? String(result.todayOfferPercent) : '');
            setTriggerHour(result.todayOfferTriggerHour);
            setIsLive(result.todayOfferActive);
        } else if (error) {
            setStatusMessage({ text: error, isError: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chaletId]);

    // isLoading starts true via its useState initializer above — no need to
    // reset it synchronously here. ChaletOffersTab is rendered with
    // `key={chalet.id}` by its parent, so a new chaletId always means a full
    // remount (fresh initial state), never a re-run of this same effect
    // instance — avoids the react-hooks/set-state-in-effect footgun.
    useEffect(() => {
        let cancelled = false;
        loadSettings().finally(() => { if (!cancelled) setIsLoading(false); });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chaletId]);

    const save = useCallback(async () => {
        if (!chaletId) return;
        setFormError('');

        if (enabled && (!percent || Number(percent) <= 0)) {
            setFormError(t('today_offer_error_percent_required') || 'Enter a discount percentage greater than 0');
            return;
        }
        if (enabled && Number(percent) > 90) {
            setFormError(t('today_offer_error_percent_too_high') || 'Discount percentage looks too high — double check it');
            return;
        }

        setIsSaving(true);
        setStatusMessage({ text: '', isError: false });

        const { validationError, result } = await UpdateChaletTodayOfferUseCase.execute(
            { id: settingsId, chaletId, todayOfferEnabled: enabled, todayOfferPercent: percent, todayOfferTriggerHour: triggerHour },
            t
        );

        if (validationError) {
            setStatusMessage({ text: validationError, isError: true });
            setIsSaving(false);
            return;
        }
        if (result?.status === true || result?.status === undefined) {
            setStatusMessage({ text: t('today_offer_saved') || 'Today’s Offer settings saved!', isError: false });
            // Re-fetch so isLive reflects the just-saved settings immediately.
            await loadSettings();
        } else {
            setStatusMessage({ text: result?.message || (t('today_offer_save_failed') || 'Failed to save'), isError: true });
        }
        setIsSaving(false);
    }, [chaletId, settingsId, enabled, percent, triggerHour, t, loadSettings]);

    return {
        enabled, setEnabled,
        percent, setPercent,
        triggerHour, setTriggerHour,
        isLive, isLoading,
        isSaving, statusMessage, formError,
        save,
    };
};
