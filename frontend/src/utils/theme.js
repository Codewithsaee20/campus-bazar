export const THEME_STORAGE_KEY = 'campus-bazzar-theme';

export const THEMES = {
  light: 'light',
  dark: 'dark',
};

export const getStoredTheme = () => {
  if (typeof window === 'undefined') return THEMES.light;

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === THEMES.dark || savedTheme === THEMES.light) {
    return savedTheme;
  }

  return THEMES.light;
};

export const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
};

export const initializeTheme = () => {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
};
