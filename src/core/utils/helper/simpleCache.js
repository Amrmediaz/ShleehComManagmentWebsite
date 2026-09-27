/**
 * simpleCache
 *
 * Tiny in-memory, per-key, TTL cache for wrapping repository/API calls.
 * Several pages (Header, Dashboard, ChaletsPage, CalendarPage, BookingList)
 * independently fetch the same owner-wide lists (buildings, chalets, flats
 * per building) every time they mount — this cuts that down to one network
 * call per TTL window, shared across all of them, without each page needing
 * its own caching logic.
 *
 * Usage:
 *   const cached = withCache('buildings', () => buildingApiClient.getOwnerBuildings(), 60_000);
 *   const data = await cached();          // fetches, then reuses for 60s
 *   invalidate('buildings');              // e.g. after AddBuilding succeeds
 */

const store = new Map(); // key -> { timestamp, promise, value }
const inflight = new Map(); // key -> in-flight promise (de-dupes concurrent callers)

/**
 * Wrap an async fetcher with caching. Returns a function with the same
 * signature; the cache key can be static or derived from the call args.
 *
 * @param {string|((...args:any[])=>string)} keyOrKeyFn - cache key, or a function deriving one from args
 * @param {(...args:any[])=>Promise<any>} fetcher - the real fetch to cache
 * @param {number} ttlMs - how long a cached value stays valid
 */
export function withCache(keyOrKeyFn, fetcher, ttlMs = 60 * 1000) {
    return async (...args) => {
        const key = typeof keyOrKeyFn === 'function' ? keyOrKeyFn(...args) : keyOrKeyFn;
        const entry = store.get(key);
        const isFresh = entry && (Date.now() - entry.timestamp) < ttlMs;

        if (isFresh) return entry.value;

        // De-dupe: if a fetch for this key is already underway, piggyback on it
        // instead of firing a second identical request.
        if (inflight.has(key)) return inflight.get(key);

        const promise = fetcher(...args)
            .then((value) => {
                store.set(key, { timestamp: Date.now(), value });
                inflight.delete(key);
                return value;
            })
            .catch((err) => {
                inflight.delete(key);
                throw err;
            });

        inflight.set(key, promise);
        return promise;
    };
}

/** Drop one cached key (e.g. after a mutation), or everything if no key given. */
export function invalidateCache(key) {
    if (key === undefined) {
        store.clear();
        return;
    }
    store.delete(key);
}

/** Drop every cached key starting with a prefix — handy for keyed caches (e.g. `flats:`). */
export function invalidateCachePrefix(prefix) {
    for (const key of store.keys()) {
        if (typeof key === 'string' && key.startsWith(prefix)) store.delete(key);
    }
}
