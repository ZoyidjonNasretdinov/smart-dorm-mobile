export const COLORS = {
  primary: "#4f46e5",
  secondary: "#10b981",
  background: "#f8fafc",
  white: "#ffffff",
  danger: "#ef4444",
  warning: "#f59e0b",
  success: "#10b981",
  gradient: {
    start: "#4f46e5",
    end: "#312e81",
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const SIZES = {
  base: 16,
  font: 14,
  radius: 24,
  padding: 24,
};

export const SHADOWS = {
  soft: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
};

export const LIGHT_THEME = {
  ...COLORS,
  card: COLORS.white,
  text: COLORS.gray[900],
  textSecondary: COLORS.gray[500],
};

export const DARK_THEME = {
  ...COLORS,
  background: "#0f172a",
  card: "#1e293b",
  text: "#f8fafc",
  textSecondary: "#94a3b8",
};
