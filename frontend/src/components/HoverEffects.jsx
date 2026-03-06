import { useEffect } from 'react';

/**
 * Zero-render component that adds micro-interaction hover classes
 * to inline-styled card-like divs across the entire app.
 * Attach once at the App root level.
 */
export default function HoverEffects() {
  useEffect(() => {
    const isCard = (el) => {
      if (el.tagName !== 'DIV') return false;
      const s = el.style;
      // Must have border-radius and some kind of border or background
      return (
        (s.borderRadius || s.WebkitBorderRadius) &&
        (s.border || s.background || s.backgroundColor || s.backdropFilter)
      );
    };

    const onOver = (e) => {
      const el = e.target.closest?.('div');
      if (!el || !isCard(el)) return;
      if (el.dataset.hcHover) return; // already tagged
      el.dataset.hcHover = '1';
      el.classList.add('hc-card-hover');
    };

    document.addEventListener('mouseover', onOver, { passive: true });
    return () => document.removeEventListener('mouseover', onOver);
  }, []);

  return null;
}
