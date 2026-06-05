const palette = {
  primary: '#2563eb',     // Royal Blue
  secondary: '#7c3aed',   // Purple
  background: '#f8fafc',  // Off-white / Slate 50
  surface: '#ffffff',     // Pure White
  text: '#0f172a',        // Dark Slate
  textMuted: '#64748b',   // Gray
  border: '#e2e8f0',      // Light Gray
  error: '#ef4444',       // Red
};

export const Theme = {
  light: {
    brand: palette.primary,
    background: palette.background,
    card: palette.surface,
    text: palette.text,
    textSecondary: palette.textMuted,
    border: palette.border,
    notification: palette.secondary,
  },
  dark: {
    brand: '#60a5fa',
    background: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    border: '#334155',
    notification: '#a78bfa',
  },
};

export type AppTheme = typeof Theme.light;