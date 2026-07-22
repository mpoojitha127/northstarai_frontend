interface StarMarkProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

/**
 * The four-point star is the one motif the whole product hangs its identity
 * on: it appears in the nav mark, as the alignment-aligned glyph, and as the
 * timeline's connecting thread. Kept to a single shape, single gold value,
 * used sparingly -- everywhere else stays quiet indigo/ink so this reads as
 * a mark, not decoration.
 */
export function StarMark({ size = 20, className = "", animated = false }: StarMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`${className} ${animated ? "animate-pulse-star" : ""}`}
    >
      <path
        d="M12 2L13.8 9.2L21 11L13.8 12.8L12 20L10.2 12.8L3 11L10.2 9.2L12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}
