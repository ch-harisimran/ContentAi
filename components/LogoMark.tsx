// The app's mark — a minimal caret/cursor glyph, echoing the blinking
// text-cursor motif used throughout the product (hero eyebrow, the
// scroll-typed demo). Deliberately restrained: one accent color, no
// gradient. Mirrored as the static app/icon.svg for the browser favicon.
export default function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="0.5" y="0.5" width="31" height="31" rx="7" fill="#0b0b0c" stroke="rgba(241,237,227,0.18)" />
      <rect x="14" y="7" width="4" height="14" rx="1" fill="#ff5a36" />
      <rect x="9" y="23" width="14" height="2.4" rx="1.2" fill="#f1ede3" fillOpacity="0.5" />
    </svg>
  );
}
