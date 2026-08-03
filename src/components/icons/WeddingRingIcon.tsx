/**
 * Alliance contemporaine 2026
 * Trait fin, anneaux croisés, diamant emerald-cut (joaillerie actuelle).
 */
export function WeddingRingIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Anneaux croisés — ellipse fine, légèrement inclinés */}
        <ellipse cx="9" cy="15" rx="5.5" ry="5.5" transform="rotate(-22 9 15)" />
        <ellipse cx="15" cy="15" rx="5.5" ry="5.5" transform="rotate(22 15 15)" />

        {/* Diamant emerald-cut + table facets */}
        <rect x="10.2" y="2.6" width="3.6" height="4.6" rx="0.4" />
        <path d="M10.45 3.85h3.1M10.45 6h3.1" opacity="0.65" strokeWidth="1" />
      </g>
    </svg>
  );
}
