import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext.jsx';
import { GetBuildingTodayOfferUseCase } from '../../core/useCases/GetBuildingTodayOfferUseCase.js';
import { UpdateBuildingTodayOfferUseCase } from '../../core/useCases/UpdateBuildingTodayOfferUseCase.js';
import { getBuildingId } from '../../core/utils/helper/Helpers.js';

/**
 * useBuildingTodayOffer
 * Owner-facing controls for "Today's Offer" on a building (see
 * TODAY-OFFER-API-SPEC.md) — set once per building, applies to whichever
 * flat the guest ends up booking. Uses the dedicated
 * GetHotelBuildingTodayOffer/UpdateHotelBuildingTodayOffer owner-panel
 * endpoints (Part 5) instead of the general building update/detail — no
 * need to rebuild the building's full ~30-field payload just to flip 3
 * fields, and the live `todayOfferActive` status is always freshly fetched.
 *
 * BuildingOffersTab is rendered with `key={building.id}` by its parent, so
 * switching buildings remounts this hook fresh — the load effect below only
 * ever needs to run once per mount, keyed on buildingId.
 */
export const useBuildingTodayOffer = (building) => {
    const { t } = useTranslation();
    const buildingId = getBuildingId(building);

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
        if (!buildingId) return;
        const { result, error } = await GetBuildingTodayOfferUseCase.execute(buildingId, t);
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
    }, [buildingId]);

    // isLoading starts true via its useState initializer above — no need to
    // reset it synchronously here. BuildingOffersTab is rendered with
    // `key={building.id}` by its parent, so a new buildingId always means a
    // full remount (fresh initial state), never a re-run of this same
    // effect instance — avoids the react-hooks/set-state-in-effect footgun.
    useEffect(() => {
        let cancelled = false;
        loadSettings().finally(() => { if (!cancelled) setIsLoading(false); });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buildingId]);

    const save = useCallback(async () => {
        if (!buildingId) return;
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

        const { validationError, result } = await UpdateBuildingTodayOfferUseCase.execute(
            { id: settingsId, buildingId, todayOfferEnabled: enabled, todayOfferPercent: percent, todayOfferTriggerHour: triggerHour },
            t
        );

        if (validationError) {
            setStatusMessage({ text: validationError, isError: true });
            setIsSaving(false);
            return;
        }
        if (result?.status === true) {
            setStatusMessage({ text: t('today_offer_saved') || 'Today’s Offer settings saved!', isError: false });
            // Re-fetch so isLive reflects the just-saved settings immediately.
            await loadSettings();
        } else {
            setStatusMessage({ text: result?.message || (t('today_offer_save_failed') || 'Failed to save'), isError: true });
        }
        setIsSaving(false);
    }, [buildingId, settingsId, enabled, percent, triggerHour, t, loadSettings]);

    return {
        enabled, setEnabled,
        percent, setPercent,
        triggerHour, setTriggerHour,
        isLive, isLoading,
        isSaving, statusMessage, formError,
        save,
    };
};
