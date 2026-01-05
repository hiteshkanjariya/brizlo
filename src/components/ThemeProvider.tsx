import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { ThemeMode } from '@/store/slices/themeSlice';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode, color, borderRadius } = useAppSelector((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;

    // Handle theme mode
    const applyTheme = (themeMode: ThemeMode) => {
      if (themeMode === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', systemDark);
      } else {
        root.classList.toggle('dark', themeMode === 'dark');
      }
    };

    applyTheme(mode);

    // Listen for system theme changes
    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        root.classList.toggle('dark', e.matches);
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme color classes
    root.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange', 'theme-red');

    // Add current theme color class
    root.classList.add(`theme-${color}`);
  }, [color]);

  useEffect(() => {
    const root = document.documentElement;

    // Remove all radius classes
    root.classList.remove('radius-0', 'radius-4', 'radius-7', 'radius-12');

    // Add current radius class
    root.classList.add(`radius-${borderRadius}`);
  }, [borderRadius]);

  return <>{children}</>;
}
