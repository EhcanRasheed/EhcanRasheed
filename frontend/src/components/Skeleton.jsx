import React from 'react';

const pulse = `
@keyframes skeletonPulse {
  0% { opacity: 0.08; }
  50% { opacity: 0.18; }
  100% { opacity: 0.08; }
}
`;

const base = {
  background: 'rgba(255,255,255,0.1)',
  borderRadius: 8,
  animation: 'skeletonPulse 1.4s ease-in-out infinite',
};

/* Inject keyframes once */
if (typeof document !== 'undefined' && !document.getElementById('skeleton-pulse-style')) {
  const style = document.createElement('style');
  style.id = 'skeleton-pulse-style';
  style.textContent = pulse;
  document.head.appendChild(style);
}

/** Rectangular skeleton line */
export function SkeletonLine({ width = '100%', height = 14, style: extra, ...props }) {
  return <div style={{ ...base, width, height, ...extra }} {...props} />;
}

/** Skeleton card matching the app's dark card style */
export function SkeletonCard({ style: extra, children, ...props }) {
  return (
    <div style={{ background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 12, ...extra }} {...props}>
      {children || (
        <>
          <SkeletonLine width={60} height={32} style={{ borderRadius: '50%' }} />
          <SkeletonLine width="70%" height={16} />
          <SkeletonLine width="90%" height={12} />
          <SkeletonLine width="40%" height={12} style={{ marginTop: 'auto' }} />
        </>
      )}
    </div>
  );
}

/** Grid of skeleton cards */
export function SkeletonCardGrid({ count = 4, columns = 'repeat(auto-fit,minmax(280px,1fr))', style: extra }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: columns, gap: 20, ...extra }}>
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

/** Skeleton table rows */
export function SkeletonTable({ rows = 5, cols = 4, style: extra }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...extra }}>
      {/* Header row */}
      <div style={{ display: 'flex', gap: 16, padding: '12px 16px' }}>
        {Array.from({ length: cols }, (_, i) => (
          <SkeletonLine key={i} width={`${100 / cols}%`} height={14} />
        ))}
      </div>
      {/* Body rows */}
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} style={{ display: 'flex', gap: 16, padding: '14px 16px', background: '#161618', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
          {Array.from({ length: cols }, (_, c) => (
            <SkeletonLine key={c} width={`${100 / cols}%`} height={12} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Inline skeleton text */
export function SkeletonText({ lines = 3, style: extra }) {
  const widths = ['100%', '92%', '78%', '85%', '60%'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...extra }}>
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonLine key={i} width={widths[i % widths.length]} height={12} />
      ))}
    </div>
  );
}
