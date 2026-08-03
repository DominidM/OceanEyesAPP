export type AdminThemeMode = 'light' | 'dark';

export type AdminColors = {
  appBg: string;
  sidebarBg: string;
  sidebarText: string;
  sidebarTextMuted: string;
  sidebarActiveBg: string;
  contentBg: string;
  contentText: string;
  contentTextMuted: string;
  topbarBorder: string;
  cardBg: string;
  cardBorder: string;
  cardText: string;
  primary: string;
  primaryText: string;
  accent: string;
  danger: string;
  dangerBg: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
};

export const lightColors: AdminColors = {
  appBg: '#EFEBE3',
  sidebarBg: '#134E5E',
  sidebarText: '#EFEBE3',
  sidebarTextMuted: '#98B9B1',
  sidebarActiveBg: 'rgba(239, 235, 227, 0.14)',
  contentBg: '#EFEBE3',
  contentText: '#2C2C2C',
  contentTextMuted: 'rgba(44, 44, 44, 0.65)',
  topbarBorder: 'rgba(19, 78, 94, 0.12)',
  cardBg: '#FFFFFF',
  cardBorder: 'rgba(19, 78, 94, 0.12)',
  cardText: '#2C2C2C',
  primary: '#134E5E',
  primaryText: '#EFEBE3',
  accent: '#98B9B1',
  danger: '#B42318',
  dangerBg: '#FDECEC',
  success: '#047857',
  successBg: '#D1FAE5',
  warning: '#8A6D1D',
  warningBg: '#FEF3C7',
  inputBg: '#FFFFFF',
  inputBorder: 'rgba(19, 78, 94, 0.2)',
  inputText: '#2C2C2C',
};

export const darkColors: AdminColors = {
  appBg: '#111827',
  sidebarBg: '#0F172A',
  sidebarText: '#E2E8F0',
  sidebarTextMuted: '#64748B',
  sidebarActiveBg: 'rgba(59, 130, 246, 0.16)',
  contentBg: '#111827',
  contentText: '#E2E8F0',
  contentTextMuted: 'rgba(226, 232, 240, 0.55)',
  topbarBorder: 'rgba(255, 255, 255, 0.06)',
  cardBg: '#1E293B',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardText: '#E2E8F0',
  primary: '#3B82F6',
  primaryText: '#FFFFFF',
  accent: '#64748B',
  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.12)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.12)',
  inputBg: '#1E293B',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  inputText: '#E2E8F0',
};
