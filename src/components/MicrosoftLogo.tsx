interface MicrosoftLogoProps {
  size?: number;
  className?: string;
}

export function MicrosoftLogo({ size, className }: MicrosoftLogoProps) {
  return (
    <svg
      viewBox="0 0 23 23"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Microsoft Logo"
    >
      <rect x="0" y="0" width="10" height="10" fill="#f25022" />
      <rect x="12" y="0" width="10" height="10" fill="#7fba00" />
      <rect x="0" y="12" width="10" height="10" fill="#00a4ef" />
      <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
    </svg>
  );
}
