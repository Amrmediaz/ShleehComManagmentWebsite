import React from 'react';

/**
 * Skeleton
 * Shared shimmer loading block (see the `.skeleton`/`.dash-spin` keyframes in
 * index.css). Reused across the dashboard, lists, and detail pages instead of
 * plain "Loading…" text/spinners so navigating the app feels instant — the
 * real layout's shape is visible immediately, content just streams in.
 */
export function Skeleton({ width = '100%', height = '14px', style }) {
    return <span className="skeleton" style={{ width, height, display: 'inline-block', ...style }} />;
}

/**
 * CardSkeleton
 * Mirrors the `.flat-card` layout (used by both FlatCard and ChaletCard) so
 * grid loading states don't jump/reflow once real cards arrive.
 */
export function CardSkeleton() {
    return (
        <div className="flat-card" style={{ pointerEvents: 'none' }}>
            <Skeleton height="172px" style={{ borderRadius: 0 }} />
            <div style={{ padding: '14px 16px 16px' }}>
                <Skeleton width="65%" height="18px" style={{ marginBottom: '10px' }} />
                <Skeleton width="45%" height="12px" style={{ marginBottom: '14px' }} />
                <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                    <Skeleton width="60px" height="22px" style={{ borderRadius: '999px' }} />
                    <Skeleton width="60px" height="22px" style={{ borderRadius: '999px' }} />
                </div>
                <Skeleton width="40%" height="16px" style={{ marginBottom: '14px' }} />
                <Skeleton height="34px" style={{ borderRadius: '8px' }} />
            </div>
        </div>
    );
}

/**
 * CardSkeletonGrid
 * Convenience wrapper matching the `repeat(auto-fill, minmax(280px, 1fr))`
 * grid used throughout (chalets list, flats list, etc).
 */
export function CardSkeletonGrid({ count = 6 }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', padding: '4px 0' }}>
            {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
    );
}

/**
 * RowSkeleton
 * A single shimmering row — for tables/lists (bookings, pickers, etc).
 */
export function RowSkeleton({ height = '36px', style }) {
    return <Skeleton height={height} style={{ borderRadius: '8px', ...style }} />;
}

export default Skeleton;
