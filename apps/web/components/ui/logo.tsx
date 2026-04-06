interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  const s = sizes[size];

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle
        cx="32"
        cy="32"
        r="28"
        fill="url(#orbitGradient)"
        opacity="0.15"
      />

      <circle
        cx="32"
        cy="32"
        r="20"
        fill="url(#globeGradient)"
        filter="url(#glow)"
        opacity="0.9"
      />

      <ellipse
        cx="32"
        cy="32"
        rx="26"
        ry="10"
        fill="none"
        stroke="url(#orbitGradient)"
        strokeWidth="1.5"
        opacity="0.5"
        transform="rotate(-20 32 32)"
      />
      <ellipse
        cx="32"
        cy="32"
        rx="26"
        ry="10"
        fill="none"
        stroke="url(#orbitGradient)"
        strokeWidth="1.5"
        opacity="0.4"
        transform="rotate(30 32 32)"
      />
      <ellipse
        cx="32"
        cy="32"
        rx="26"
        ry="10"
        fill="none"
        stroke="url(#orbitGradient)"
        strokeWidth="1.5"
        opacity="0.3"
        transform="rotate(70 32 32)"
      />

      <circle cx="32" cy="32" r="8" fill="white" opacity="0.9" />
      <circle cx="32" cy="32" r="5" fill="url(#orbitGradient)" />

      <circle cx="42" cy="22" r="2" fill="white" opacity="0.7" />
      <circle cx="22" cy="38" r="1.5" fill="white" opacity="0.6" />
      <circle cx="45" cy="40" r="1.5" fill="white" opacity="0.5" />
      <circle cx="20" cy="24" r="1" fill="white" opacity="0.4" />

      <path d="M32 12 L34 18 L32 16 L30 18 Z" fill="white" opacity="0.8" />
    </svg>
  );
}

export function LogoWithText({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64,
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo size={size} />
      <span
        className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#818cf8] via-[#a855f7] to-[#f472b6]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #818cf8, #a855f7, #f472b6)",
        }}
      >
        OrbiTalk
      </span>
    </div>
  );
}
