import React from 'react';
import { useChaletTodayOffer } from '../../hooks/useChaletTodayOffer.js';
import TodayOfferPanel from '../TodayOfferPanel.jsx';

/**
 * ChaletOffersTab
 * Dedicated home for "Today's Offer" (TODAY-OFFER-API-SPEC.md) — kept fully
 * separate from the "Special Prices" tab on purpose, since the two are easy
 * to confuse: Special Prices is a manual price the owner sets for a chosen
 * date, Today's Offer is an automatic discount that only kicks in when
 * today has no booking. All the actual UI lives in the shared
 * TodayOfferPanel (also used by BuildingOffersTab) so chalets and buildings
 * behave identically — this component just wires the chalet-specific hook
 * into it. The hook fetches its own settings (including live isLive status)
 * via the dedicated GetTodayOffer endpoint, so it no longer depends on the
 * `chalet` prop carrying fresh todayOffer fields.
 */
const ChaletOffersTab = ({ chalet, t }) => {
    const offer = useChaletTodayOffer(chalet);
    return <TodayOfferPanel t={t} {...offer} />;
};

export default ChaletOffersTab;
