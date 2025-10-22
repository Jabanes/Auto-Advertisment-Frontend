// app/theme/theme.ts
// 🎨 Unified Design System for Auto-Advertisement Platform
// Matches visual style from HTML login + dashboard mockups

export const colors = {
  // 🌈 BRAND COLORS
  primary: "#4585ed",
  primaryLight: "#7ba8f6",
  primaryDark: "#2c5fc7",

  // 🌗 BACKGROUNDS
  backgroundLight: "#f6f7f8",
  backgroundDark: "#111721",
  background: "#f6f7f8",
  surfaceLight: "#ffffff",
  surfaceDark: "#1a1f2b",

  // 🖋️ TEXT COLORS
  textDark: "#111721",
  textLight: "#f6f7f8",
  textMutedLight: "rgba(17,23,33,0.6)",
  textMutedDark: "rgba(246,247,248,0.6)",
  textMuted: "#6b7280",

  // 🧱 BORDERS & DIVIDERS
  borderLight: "rgba(17,23,33,0.1)",
  borderDark: "rgba(246,247,248,0.1)",

  // ⚡ STATES
  success: "#16a34a",
  successLight: "#4ade80",
  successDark: "#166534",

  warning: "#facc15",
  warningLight: "#fde047",
  warningDark: "#ca8a04",

  error: "#dc2626",
  errorLight: "#f87171",
  errorDark: "#991b1b",

  // 💫 EFFECTS
  overlayLight: "rgba(255,255,255,0.6)",
  overlayDark: "rgba(0,0,0,0.4)",
  shadow: "rgba(17,23,33,0.08)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
};

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: "0 1px 3px rgba(0,0,0,0.05)",
  md: "0 4px 12px rgba(0,0,0,0.08)",
  lg: "0 8px 30px rgba(0,0,0,0.12)",
  xl: "0 16px 60px rgba(0,0,0,0.15)",
};

export const typography = {
  fontFamily: {
    display: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
    body: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`, // 👈 added

    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    bold: "Inter_700Bold",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    "2xl": 32,
    "3xl": 40,
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    bold: 700,
    black: 900,
  },
};

export const gradients = {
  background: `
    radial-gradient(at 27% 37%, hsla(217, 98%, 60%, 1) 0px, transparent 50%),
    radial-gradient(at 97% 21%, hsla(273, 76%, 53%, 1) 0px, transparent 50%),
    radial-gradient(at 52% 99%, hsla(354, 98%, 60%, 1) 0px, transparent 50%),
    radial-gradient(at 10% 29%, hsla(217, 98%, 60%, 1) 0px, transparent 50%),
    radial-gradient(at 97% 96%, hsla(38, 98%, 60%, 1) 0px, transparent 50%),
    radial-gradient(at 33% 50%, hsla(222, 98%, 60%, 1) 0px, transparent 50%),
    radial-gradient(at 79% 53%, hsla(343, 98%, 60%, 1) 0px, transparent 50%)
  `,
};

export const theme = {
  colors,
  spacing,
  radii,
  shadows,
  typography,
  gradients,
};

export type Theme = typeof theme;
