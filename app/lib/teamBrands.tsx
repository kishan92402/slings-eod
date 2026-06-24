import React from "react";

export interface TeamTheme {
  primary: string;
  primaryHover: string;
  bgTint: string;
  textOnPrimary: string;
  borderColor: string;
}

export const TEAM_THEMES: Record<string, TeamTheme> = {
  "Brandify": {
    primary: "#e8e8e8",
    primaryHover: "#ffffff",
    bgTint: "rgba(255,255,255,0.04)",
    textOnPrimary: "#000000",
    borderColor: "rgba(255,255,255,0.15)",
  },
  "Swingtradinglab": {
    primary: "#00AAFF",
    primaryHover: "#22BBFF",
    bgTint: "rgba(0,170,255,0.07)",
    textOnPrimary: "#000000",
    borderColor: "rgba(0,170,255,0.25)",
  },
  "Home Service Experts": {
    primary: "#B8945A",
    primaryHover: "#CDA870",
    bgTint: "rgba(184,148,90,0.07)",
    textOnPrimary: "#000000",
    borderColor: "rgba(184,148,90,0.25)",
  },
  "Collective Shift": {
    primary: "#F05A28",
    primaryHover: "#FF6B3D",
    bgTint: "rgba(240,90,40,0.07)",
    textOnPrimary: "#ffffff",
    borderColor: "rgba(240,90,40,0.25)",
  },
  "Deal Flip Formula": {
    primary: "#2A7DE1",
    primaryHover: "#4090F0",
    bgTint: "rgba(42,125,225,0.07)",
    textOnPrimary: "#ffffff",
    borderColor: "rgba(42,125,225,0.25)",
  },
  "Vibecoding Accelerator": {
    primary: "#A855F7",
    primaryHover: "#B970FF",
    bgTint: "rgba(168,85,247,0.07)",
    textOnPrimary: "#ffffff",
    borderColor: "rgba(168,85,247,0.25)",
  },
  "RB Launch": {
    primary: "#E63946",
    primaryHover: "#FF4D5A",
    bgTint: "rgba(230,57,70,0.07)",
    textOnPrimary: "#ffffff",
    borderColor: "rgba(230,57,70,0.25)",
  },
};

export const DEFAULT_THEME: TeamTheme = {
  primary: "#10b981",
  primaryHover: "#34d399",
  bgTint: "rgba(16,185,129,0.07)",
  textOnPrimary: "#000000",
  borderColor: "rgba(16,185,129,0.25)",
};

export function getTheme(team: string): TeamTheme {
  return TEAM_THEMES[team] ?? DEFAULT_THEME;
}

// ─── Logo Components ───────────────────────────────────────────────────────────

export function BrandifyLogo({ size = 48 }: { size?: number }) {
  const scale = size / 48;
  return (
    <svg width={200 * scale} height={size} viewBox="0 0 200 48" fill="none">
      <text x="0" y="36" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight="700" fontSize="38" letterSpacing="-1" fill="white">
        Brandify
      </text>
    </svg>
  );
}

export function SwingtradingLabLogo({ size = 48 }: { size?: number }) {
  const s = size / 48;
  return (
    <svg width={220 * s} height={size} viewBox="0 0 220 48" fill="none">
      <text x="0" y="30" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight="800" fontSize="26" fill="#00AAFF" letterSpacing="-0.5">
        Swing Trading Lab
      </text>
    </svg>
  );
}

export function HomeServiceExpertsLogo({ size = 56 }: { size?: number }) {
  const s = size / 56;
  return (
    <svg width={56 * s} height={size} viewBox="0 0 56 56" fill="none">
      {/* Shield */}
      <path d="M28 2 L52 12 L52 32 C52 44 28 54 28 54 C28 54 4 44 4 32 L4 12 Z"
        fill="none" stroke="#3D4040" strokeWidth="3.5" />
      {/* Inner bracket left */}
      <path d="M14 14 L14 28 L20 28" stroke="#3D4040" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Inner bracket right */}
      <path d="M42 14 L42 28 L36 28" stroke="#3D4040" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Roof chevron */}
      <path d="M18 22 L28 14 L38 22" stroke="#B8945A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function HomeServiceExpertsWordmark({ size = 56 }: { size?: number }) {
  const s = size / 56;
  return (
    <svg width={180 * s} height={size} viewBox="0 0 180 56" fill="none">
      <text x="0" y="22" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontWeight="800" fontSize="17" fill="white" letterSpacing="0.5">HOME</text>
      <text x="0" y="40" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontWeight="800" fontSize="17" fill="white" letterSpacing="0.5">SERVICE</text>
      <text x="0" y="55" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontWeight="800" fontSize="13" fill="#B8945A" letterSpacing="2">EXPERTS</text>
    </svg>
  );
}

export function CollectiveShiftLogo({ size = 48 }: { size?: number }) {
  const s = size / 48;
  return (
    <svg width={180 * s} height={size} viewBox="0 0 180 48" fill="none">
      {/* C chevron shape */}
      <path d="M8 8 L28 8 L20 24 L28 40 L8 40 L16 24 Z" fill="#F05A28" />
      <path d="M22 8 L38 8 L30 24 L38 40 L22 40 L30 24 Z" fill="#F05A28" opacity="0.5" />
      {/* Wordmark */}
      <text x="50" y="28" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="18" fill="white">
        <tspan fontWeight="300">collective</tspan><tspan fontWeight="700">shift</tspan>
      </text>
    </svg>
  );
}

export function DealFlipFormulaLogo({ size = 48 }: { size?: number }) {
  const s = size / 48;
  return (
    <svg width={200 * s} height={size} viewBox="0 0 200 48" fill="none">
      {/* House outline */}
      <path d="M20 36 L20 22 L12 22 L28 8 L44 22 L36 22 L36 36 Z" fill="none" stroke="#2A7DE1" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Checkmark */}
      <path d="M22 28 L27 33 L38 20" stroke="#2A7DE1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Wordmark */}
      <text x="54" y="20" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontWeight="800" fontSize="13" fill="white" letterSpacing="0.3">DEAL</text>
      <text x="54" y="34" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontWeight="800" fontSize="10" fill="#2A7DE1" letterSpacing="1">FLIP FORMULA</text>
    </svg>
  );
}

export function VibeCodingLogo({ size = 56 }: { size?: number }) {
  const s = size / 56;
  return (
    <svg width={260 * s} height={size} viewBox="0 0 260 56" fill="none">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* "Vibe Coding" in script style with glow */}
      <text x="4" y="34" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic"
        fontWeight="700" fontSize="30" fill="#A855F7" filter="url(#glow)" letterSpacing="-0.5">
        Vibe Coding
      </text>
      {/* "ACCELERATOR" bold */}
      <text x="4" y="52" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
        fontWeight="900" fontSize="13" fill="white" letterSpacing="3">
        ACCELERATOR
      </text>
    </svg>
  );
}

export function RBLaunchLogo({ size = 48 }: { size?: number }) {
  const s = size / 48;
  return (
    <svg width={180 * s} height={size} viewBox="0 0 180 48" fill="none">
      {/* Rocket */}
      <path d="M20 38 L20 26 C20 18 26 10 32 8 C38 10 44 18 44 26 L44 38 L38 34 L32 36 L26 34 Z"
        fill="none" stroke="#E63946" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="32" cy="22" r="3.5" fill="#E63946" />
      {/* Flames */}
      <path d="M26 38 C26 42 29 44 32 44 C35 44 38 42 38 38" fill="#E63946" opacity="0.4" />
      {/* Wordmark */}
      <text x="54" y="22" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontWeight="900" fontSize="16" fill="white" letterSpacing="0.5">RB</text>
      <text x="54" y="36" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontWeight="700" fontSize="12" fill="#E63946" letterSpacing="2">LAUNCH</text>
    </svg>
  );
}

// Map team name → logo component
export function TeamLogo({ team, size }: { team: string; size?: number }) {
  switch (team) {
    case "Brandify": return <BrandifyLogo size={size} />;
    case "Swingtradinglab": return <SwingtradingLabLogo size={size} />;
    case "Home Service Experts": return (
      <div className="flex items-center gap-3">
        <HomeServiceExpertsLogo size={size} />
        <HomeServiceExpertsWordmark size={size} />
      </div>
    );
    case "Collective Shift": return <CollectiveShiftLogo size={size} />;
    case "Deal Flip Formula": return <DealFlipFormulaLogo size={size} />;
    case "Vibecoding Accelerator": return <VibeCodingLogo size={size} />;
    case "RB Launch": return <RBLaunchLogo size={size} />;
    default: return <span className="text-white font-bold text-lg">{team}</span>;
  }
}
