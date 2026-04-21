import { useEffect, useState } from 'react';
import { applyTheme, getStoredTheme, THEME_STORAGE_KEY, THEMES } from '../utils/theme';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const nextTheme = event.newValue === THEMES.dark ? THEMES.dark : THEMES.light;
      setTheme(nextTheme);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === THEMES.dark ? THEMES.light : THEMES.dark));
  };

  return {
    theme,
    isDark: theme === THEMES.dark,
    toggleTheme,
    setTheme,
  };
};
