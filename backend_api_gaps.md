# Dashboard API Gaps — for the backend developer

The web dashboard is now live, built entirely from the endpoints that already exist. This note lists what it currently *can't* show, because the backend has no endpoint for it — so you know what to prioritize if we want a fuller dashboard.

## What the dashboard can show today

Using existing endpoints: `GET /api/Owners/GetHotelbuildingListbyOwner`, `GET /api/Owners/GetFlatListbyBulidingId?id=`, `GET /api/Owners/GetBuildingList` (chalets), and `POST /api/Owners/GetOwnerBookingList` (chalets, paginated, owner-wide), the dashboard shows: building count, chalet count, total flat count (summed client-side across every building — one API call per building), chalet booking count, a "recent chalet bookings" table, and the revenue of just that recent page of chalet bookings.

## What's missing, and why

**1. No owner-wide bookings endpoint for buildings/flats.** Chalets have `POST /api/Owners/GetOwnerBookingList` which returns every booking across all of the owner's chalets in one paginated call. Buildings have no equivalent — `GetHotelOwnerBookingListByFlat` and `GetFlatBookings` both require a single `flatId`. Today, showing "all upcoming building bookings" would mean fetching every building, then every flat in each building, then every flat's bookings — an N+1-of-N+1 call chain. Requesting: a `GetOwnerBookingListAllBuildings` (or similar) endpoint, mirroring the chalet one, that returns paginated bookings across every flat the owner has.

**2. No real revenue/earnings endpoint.** There's no endpoint that returns total or date-ranged revenue for an owner (building or chalet side). The dashboard currently computes revenue by summing the `coast` field of whatever bookings page it happens to have loaded — that's not a true total, just "revenue in the last N bookings shown." Requesting: an endpoint like `GET /api/Owners/GetRevenueSummary?from=&to=` returning total revenue, split by building vs. chalet, ideally with day/week/month granularity.

**3. No aggregated stats/counts endpoint.** Right now the dashboard has to make one API call per building just to count its flats, and separately fetch the full chalet list just to count chalets. Requesting: a single `GET /api/Owners/GetDashboardSummary` (or similar) that returns building count, total flat count, chalet count, and total/active booking counts in one response — this alone would remove most of the N+1 calls the dashboard currently makes.

**4. No occupancy endpoint.** There's no way to ask "what % of my flats/chalets are booked right now, or in date range X–Y" without pulling every flat's blocked/booked days individually and computing it client-side. Requesting: an occupancy endpoint, at least at the building level, ideally owner-wide.

**5. No booking status or date-range filtering server-side.** The existing booking-list endpoints (both building and chalet) return everything for the given flat/owner with no way to filter by status (upcoming, active, completed, cancelled) or by date range. Every "upcoming bookings this week" type widget currently has to pull the whole list and filter client-side, which doesn't scale as booking history grows. Requesting: `status` and `from`/`to` query params on the existing booking-list endpoints.

**6. No combined buildings+chalets booking feed.** Even with fixes to #1, buildings and chalets would still return bookings via two separate endpoints, so a single unified "today's check-ins across everything" view still requires two calls and client-side merging. This is a lower priority — mergeable client-side reasonably cheaply — but worth flagging if the two property types are meant to feel fully unified going forward.

## Priority suggestion

Items 1 and 3 unblock the most (they're what's currently forcing N+1 calls); item 2 is needed for any meaningful revenue reporting; items 4–6 are nice-to-haves once the above exist.
