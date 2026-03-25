export const colors = {
  background: '#F4F7F9',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF3F6',
  primary: '#2C6E7E',
  primaryDark: '#1F4F5C',
  primaryLight: '#4A8FA2',
  accent: '#5CB8CC',
  text: '#1A2633',
  textSecondary: '#5C6B78',
  textMuted: '#8A97A3',
  border: '#DDE5EB',
  borderLight: '#E8EEF2',
  success: '#2F8F6B',
  warning: '#C17A2D',
  error: '#C44D4D',
  overlay: 'rgba(26, 38, 51, 0.45)',
} as const;

export type ColorName = keyof typeof colors;
