import type { CiOperatorId } from "@/lib/ci-operators";

const sizeClass = "h-7 w-7 shrink-0 rounded-full";

export function CiOperatorLogo({
  operatorId,
  name,
  className = "",
}: {
  operatorId: CiOperatorId;
  name: string;
  className?: string;
}) {
  if (operatorId === "orange") {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`${sizeClass} ${className}`}
        role="img"
        aria-label={name}
      >
        <circle cx="16" cy="16" r="16" fill="#FF7900" />
        <text
          x="16"
          y="20.5"
          textAnchor="middle"
          fill="#fff"
          fontSize="9"
          fontFamily="Arial, sans-serif"
          fontWeight="700"
        >
          O
        </text>
      </svg>
    );
  }

  if (operatorId === "mtn") {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`${sizeClass} ${className}`}
        role="img"
        aria-label={name}
      >
        <circle cx="16" cy="16" r="16" fill="#FFCC00" />
        <text
          x="16"
          y="20.5"
          textAnchor="middle"
          fill="#1a1a1a"
          fontSize="7"
          fontFamily="Arial, sans-serif"
          fontWeight="800"
        >
          MTN
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 32 32"
      className={`${sizeClass} ${className}`}
      role="img"
      aria-label={name}
    >
      <circle cx="16" cy="16" r="16" fill="#0066B3" />
      <text
        x="16"
        y="20.5"
        textAnchor="middle"
        fill="#fff"
        fontSize="7"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
      >
        Moov
      </text>
    </svg>
  );
}
