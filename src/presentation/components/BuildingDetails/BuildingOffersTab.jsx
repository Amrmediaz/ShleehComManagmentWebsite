import React from 'react';
import { useBuildingTodayOffer } from '../../hooks/useBuildingTodayOffer.js';
import TodayOfferPanel from '../TodayOfferPanel.jsx';

/**
 * BuildingOffersTab
 * Dedicated home for "Today's Offer" (TODAY-OFFER-API-SPEC.md) on a
 * building — set once per building (not per flat), separate from the
 * per-flat "Special Prices" feature reachable from the Flats tab, since the
 * two are easy to confuse. Mirrors ChaletOffersTab exactly via the shared
 * TodayOfferPanel, so chalets and buildings behave identically. The hook
 * fetches its own settings (including live isLive status) via the dedicated
 * GetHotelBuildingTodayOffer endpoint, so it no longer depends on
 * `building.raw` carrying fresh todayOffer fields.
 */
const BuildingOffersTab = ({ building, t }) => {
    const offer = useBuildingTodayOffer(building);
    return <TodayOfferPanel t={t} {...offer} />;
};

export default BuildingOffersTab;
