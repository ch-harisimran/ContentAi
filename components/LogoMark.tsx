// The app's mark — a stylized opening quotation mark: the plainest signal
// for "written content" there is, borrowed from editorial typography
// rather than tech iconography. One accent color, no gradient. Mirrored as
// the static app/icon.svg for the browser favicon.
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
      <path
        d="M10 12c-2.4 0-4 1.8-4 4.4 0 2.3 1.5 3.9 3.5 3.9.5 2.7-1 4.6-3 5.4l.9 1.5c3.4-1.1 5.3-3.9 5.3-7.9V16c0-2.6-1-4-2.7-4z"
        fill="#7D4047"
      />
      <path
        d="M21 12c-2.4 0-4 1.8-4 4.4 0 2.3 1.5 3.9 3.5 3.9.5 2.7-1 4.6-3 5.4l.9 1.5c3.4-1.1 5.3-3.9 5.3-7.9V16c0-2.6-1-4-2.7-4z"
        fill="#7D4047"
      />
    </svg>
  );
}
