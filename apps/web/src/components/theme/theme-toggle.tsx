'use client';

import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme, isReady } = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${nextTheme} theme`} title={`Switch to ${nextTheme} theme`} disabled={!isReady}>
      <span aria-hidden="true">{theme === 'dark' ? '☼' : '☾'}</span>
      <span className="theme-toggle-label">{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
    </button>
  );
}
