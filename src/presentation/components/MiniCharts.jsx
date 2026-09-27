import React from 'react';

/**
 * MiniBarChart
 * Dependency-free vertical bar chart (no charting library installed in this
 * project — keeps the bundle light). data: [{ label, value, color }]
 */
export function MiniBarChart({ data, height = 160 }) {
    const max = Math.max(1, ...data.map((d) => d.value));
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', height, padding: '8px 4px 0 4px' }}>
            {data.map((d, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>{d.value}</div>
                    <div
                        style={{
                            width: '100%',
                            maxWidth: '56px',
                            height: `${Math.max(4, (d.value / max) * (height - 50))}px`,
                            background: d.color || '#185FA5',
                            borderRadius: '8px 8px 2px 2px',
                            transition: 'height 0.3s ease',
                        }}
                    />
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>{d.label}</div>
                </div>
            ))}
        </div>
    );
}

/**
 * DonutChart
 * Dependency-free SVG donut chart. data: [{ label, value, color }]
 */
export function DonutChart({ data, size = 140, strokeWidth = 20, emptyLabel = 'No data' }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    if (total === 0) {
        return (
            <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '12.5px', textAlign: 'center' }}>
                {emptyLabel}
            </div>
        );
    }

    // Precompute each segment's cumulative offset up front (no mutation during render).
    const segments = data.filter((d) => d.value > 0).reduce((acc, d) => {
        const dash = (d.value / total) * circumference;
        const prevOffset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
        acc.push({ ...d, dash, offset: prevOffset });
        return acc;
    }, []);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
                    {segments.map((seg, i) => (
                        <circle
                            key={i}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                            strokeDashoffset={-seg.offset}
                            strokeLinecap="butt"
                        />
                    ))}
                </g>
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '19px', fontWeight: 700, fill: '#111827' }}>
                    {total}
                </text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#374151' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color, display: 'inline-block', flexShrink: 0 }} />
                        <span>{d.label}: <strong>{d.value}</strong></span>
                    </div>
                ))}
            </div>
        </div>
    );
}
